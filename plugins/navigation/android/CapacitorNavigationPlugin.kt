package com.uppi.app.plugins.navigation

/**
 * CapacitorNavigationPlugin — Android
 *
 * Integra o Google Maps Navigation SDK nativo (com.google.android.libraries.navigation)
 * para oferecer navegação turn-by-turn in-app, sem abrir um app externo.
 *
 * ─── ONDE COLOCAR ESTE ARQUIVO ───────────────────────────────────────────────
 *
 * Copiar para:
 *   android/app/src/main/java/com/uppi/app/plugins/navigation/
 *
 * Registrar no MainActivity.kt:
 *   add(CapacitorNavigationPlugin::class.java)
 *
 * ─── DEPENDÊNCIAS (android/app/build.gradle) ─────────────────────────────────
 *
 *   // Navigation SDK (requer acesso aprovado pelo Google)
 *   implementation 'com.google.android.libraries.navigation:navigation:5.2.0'
 *
 * ─── PERMISSÕES (AndroidManifest.xml) ────────────────────────────────────────
 *
 *   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
 *   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
 *
 * ─── API KEY (AndroidManifest.xml) ───────────────────────────────────────────
 *
 *   <meta-data
 *       android:name="com.google.android.geo.API_KEY"
 *       android:value="${GOOGLE_MAPS_API_KEY}" />
 *
 * ─── ACEITAR TERMOS DE USO (Application.onCreate ou MainActivity.onCreate) ───
 *
 *   NavigationApi.getNavigator(this, termsAccepted = true, ...) deve ser chamado
 *   com termsAndConditionsType = TermsAndConditionsCheckOption.SKIPPED se já
 *   foi aceito previamente (armazene a flag em SharedPreferences).
 */

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import com.google.android.libraries.navigation.*

private const val TAG = "CapNavPlugin"
private const val LOCATION_PERMISSION_REQUEST = 1001

@CapacitorPlugin(
    name = "CapacitorNavigation",
    permissions = [
        Permission(
            strings = [
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ],
            alias = "location"
        )
    ]
)
class CapacitorNavigationPlugin : Plugin() {

    /** Instância do Navigator do SDK — null até requestPermissions ser aceito */
    private var navigator: Navigator? = null

    /** Listener de progresso de rota registrado no SDK */
    private var routeChangeListener: Navigator.RouteChangedListener? = null
    private var remainingTimeListener: Navigator.RemainingTimeOrDistanceChangedListener? = null

    // ─── isAvailable ─────────────────────────────────────────────────────────

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        // O SDK está disponível se a classe principal existir no classpath
        val available = try {
            Class.forName("com.google.android.libraries.navigation.NavigationApi")
            true
        } catch (e: ClassNotFoundException) {
            Log.w(TAG, "Navigation SDK class not found — did you add the dependency?")
            false
        }
        val result = JSObject()
        result.put("available", available)
        call.resolve(result)
    }

    // ─── startNavigation ─────────────────────────────────────────────────────

    @PluginMethod
    fun startNavigation(call: PluginCall) {
        val lat = call.getDouble("lat") ?: run {
            call.reject("Missing lat")
            return
        }
        val lng = call.getDouble("lng") ?: run {
            call.reject("Missing lng")
            return
        }
        val label = call.getString("label") ?: "Destino"

        // Verifica permissão de localização antes de qualquer coisa
        if (!hasLocationPermission()) {
            // Armazena a call para retomar após a permissão
            savedCall = call
            requestAllPermissions(call, "onLocationPermissionResult")
            return
        }

        initNavigatorAndStart(call, lat, lng, label)
    }

    @PermissionCallback
    private fun onLocationPermissionResult(call: PluginCall) {
        if (hasLocationPermission()) {
            val lat = call.getDouble("lat") ?: run { call.reject("Missing lat"); return }
            val lng = call.getDouble("lng") ?: run { call.reject("Missing lng"); return }
            val label = call.getString("label") ?: "Destino"
            initNavigatorAndStart(call, lat, lng, label)
        } else {
            call.reject("Permissão de localização negada")
        }
    }

    private fun initNavigatorAndStart(call: PluginCall, lat: Double, lng: Double, label: String) {
        NavigationApi.getNavigator(
            activity,
            object : NavigationApi.NavigatorListener {
                override fun onNavigatorReady(nav: Navigator) {
                    navigator = nav
                    setUpListeners(nav)
                    startRoute(call, nav, lat, lng, label)
                }

                override fun onError(@NavigationApi.ErrorCode errorCode: Int) {
                    Log.e(TAG, "NavigatorListener.onError: $errorCode")
                    val result = JSObject()
                    result.put("initialized", false)
                    result.put("error", "NavigationApi error code: $errorCode")
                    call.resolve(result)
                }
            }
        )
    }

    private fun startRoute(call: PluginCall, nav: Navigator, lat: Double, lng: Double, label: String) {
        val waypoint = try {
            Waypoint.builder()
                .setLatLng(lat, lng)
                .setTitle(label)
                .build()
        } catch (e: Waypoint.UnsupportedFleetJourneyWaypointException) {
            call.reject("Waypoint inválido: ${e.message}")
            return
        }

        val routingOptions = RoutingOptions().apply {
            travelMode(RoutingOptions.TravelMode.DRIVING)
        }

        val pendingRoute = nav.setDestination(waypoint, routingOptions)

        pendingRoute.setOnResultListener { code ->
            if (code == RouteStatus.OK) {
                // Inicia guidance — o Navigation SDK toma controle da tela
                nav.startGuidance()
                nav.setAudioGuidance(Navigator.AudioGuidance.VOICE_ALERTS_AND_GUIDANCE)

                val result = JSObject()
                result.put("initialized", true)
                call.resolve(result)
            } else {
                Log.e(TAG, "setDestination failed: $code")
                val result = JSObject()
                result.put("initialized", false)
                result.put("error", "RouteStatus: $code")
                call.resolve(result)
            }
        }
    }

    // ─── stopNavigation ───────────────────────────────────────────────────────

    @PluginMethod
    fun stopNavigation(call: PluginCall) {
        tearDownListeners()
        navigator?.apply {
            stopGuidance()
            clearDestinations()
            cleanup()
        }
        navigator = null

        notifyListeners("navigationStopped", JSObject())
        call.resolve()
    }

    // ─── Listeners do SDK → eventos Capacitor ────────────────────────────────

    private fun setUpListeners(nav: Navigator) {
        // Progresso a cada update de rota (instrução + distâncias)
        routeChangeListener = Navigator.RouteChangedListener {
            emitProgress(nav)
        }.also { nav.addRouteChangedListener(it) }

        // Tempo restante / distância restante
        remainingTimeListener = Navigator.RemainingTimeOrDistanceChangedListener {
            emitProgress(nav)
        }.also {
            nav.addRemainingTimeOrDistanceChangedListener(
                /* minimumTimeSeconds = */ 1,
                /* minimumDistanceMeters = */ 10,
                it
            )
        }

        // Chegada ao destino
        nav.addArrivalListener {
            notifyListeners("arrivedAtDestination", JSObject())
        }
    }

    private fun tearDownListeners() {
        navigator?.let { nav ->
            routeChangeListener?.let { nav.removeRouteChangedListener(it) }
            remainingTimeListener?.let { nav.removeRemainingTimeOrDistanceChangedListener(it) }
        }
        routeChangeListener = null
        remainingTimeListener = null
    }

    private fun emitProgress(nav: Navigator) {
        val currentStep = nav.currentTimeAndDistance
        val nextStep = nav.currentRouteSegment?.currentStepInfo ?: return

        val data = JSObject().apply {
            put("nextStepInstruction",          nextStep.fullInstructionText ?: "")
            put("distanceToNextStepMeters",     nextStep.distanceFromPrevStepMeters.toDouble())
            put("timeToDestinationSeconds",     currentStep.seconds.toDouble())
            put("distanceToDestinationMeters",  currentStep.meters.toDouble())
            put("currentRoadName",              nav.currentRouteSegment?.currentStepInfo?.road ?: "")
            put("maneuverType",                 mapManeuver(nextStep.maneuver))
            // Localização atual (via LocationSimulator ou GPS real)
            nav.roadSnappedLocationProvider?.let { provider ->
                provider.lastKnownLocation?.let { loc ->
                    put("currentLat",     loc.latitude)
                    put("currentLng",     loc.longitude)
                    put("currentHeading", loc.bearing.toDouble())
                }
            }
        }

        notifyListeners("navigationProgress", data)
    }

    /**
     * Mapeia o enum Maneuver do Navigation SDK para a string esperada pelo front-end.
     */
    private fun mapManeuver(maneuver: StepInfo.Maneuver?): String {
        return when (maneuver) {
            StepInfo.Maneuver.TURN_LEFT           -> "turn_left"
            StepInfo.Maneuver.TURN_RIGHT          -> "turn_right"
            StepInfo.Maneuver.TURN_SLIGHT_LEFT    -> "turn_slight_left"
            StepInfo.Maneuver.TURN_SLIGHT_RIGHT   -> "turn_slight_right"
            StepInfo.Maneuver.TURN_SHARP_LEFT     -> "turn_sharp_left"
            StepInfo.Maneuver.TURN_SHARP_RIGHT    -> "turn_sharp_right"
            StepInfo.Maneuver.UTURN_LEFT,
            StepInfo.Maneuver.UTURN_RIGHT         -> "uturn"
            StepInfo.Maneuver.ROUNDABOUT_LEFT,
            StepInfo.Maneuver.ROUNDABOUT_RIGHT    -> "roundabout"
            StepInfo.Maneuver.STRAIGHT            -> "straight"
            StepInfo.Maneuver.DESTINATION,
            StepInfo.Maneuver.DESTINATION_LEFT,
            StepInfo.Maneuver.DESTINATION_RIGHT   -> "destination"
            else                                  -> "unknown"
        }
    }

    // ─── Utilitários ─────────────────────────────────────────────────────────

    private fun hasLocationPermission(): Boolean {
        val ctx = context
        return ContextCompat.checkSelfPermission(ctx, Manifest.permission.ACCESS_FINE_LOCATION) ==
                PackageManager.PERMISSION_GRANTED
    }

    override fun handleOnDestroy() {
        tearDownListeners()
        navigator?.cleanup()
        navigator = null
        super.handleOnDestroy()
    }
}
