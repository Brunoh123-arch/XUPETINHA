package app.uppi.mobile.plugins

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.FrameLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.libraries.navigation.NavigationApi
import com.google.android.libraries.navigation.Navigator
import com.google.android.libraries.navigation.RoutingOptions
import com.google.android.libraries.navigation.SimulationOptions
import com.google.android.libraries.navigation.SupportNavigationFragment
import com.google.android.libraries.navigation.Waypoint
import com.google.android.libraries.navigation.NavigationView

/**
 * NavigationActivity
 *
 * Tela nativa que embute o SupportNavigationFragment do Google Maps
 * Navigation SDK. Ocupa 100% da tela, exatamente como no app Uber.
 *
 * O motorista vê:
 *  - Mapa com a rota azul
 *  - Instrução turn-by-turn com voz (TTS nativa)
 *  - Velocidade e tempo estimado
 *  - Botão "Encerrar Navegação" no canto inferior
 *
 * Para fechar de fora: envie o broadcast ACTION_STOP_NAVIGATION.
 */
class NavigationActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "NavigationActivity"

        // Keys dos extras da Intent
        const val EXTRA_LAT   = "lat"
        const val EXTRA_LNG   = "lng"
        const val EXTRA_LABEL = "label"

        // Broadcast action para encerrar a navegação via NavigationPlugin.stopNavigation()
        const val ACTION_STOP_NAVIGATION = "app.uppi.mobile.STOP_NAVIGATION"
    }

    private var navigator: Navigator? = null
    private var navFragment: SupportNavigationFragment? = null

    // BroadcastReceiver para receber stopNavigation() do JS
    private val stopReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            Log.d(TAG, "BroadcastReceiver: recebendo ACTION_STOP_NAVIGATION")
            stopAndFinish()
        }
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val lat   = intent.getDoubleExtra(EXTRA_LAT,   0.0)
        val lng   = intent.getDoubleExtra(EXTRA_LNG,   0.0)
        val label = intent.getStringExtra(EXTRA_LABEL) ?: "Destino"

        Log.d(TAG, "onCreate → lat=$lat lng=$lng label=$label")

        // Layout em código — FrameLayout simples para hospedar o Fragment
        val container = FrameLayout(this).apply {
            id = View.generateViewId()
        }
        setContentView(container)

        // Registra receiver para poder fechar de fora (JS stopNavigation)
        val filter = IntentFilter(ACTION_STOP_NAVIGATION)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(stopReceiver, filter, RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("UnspecifiedRegisterReceiverFlag")
            registerReceiver(stopReceiver, filter)
        }

        initNavigationSdk(lat, lng, label, container.id)
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(stopReceiver)
        navigator?.cleanup()
    }

    // ─── Inicialização do SDK ─────────────────────────────────────────────────

    private fun initNavigationSdk(lat: Double, lng: Double, label: String, containerId: Int) {
        NavigationApi.getNavigator(
            this,
            object : NavigationApi.NavigatorListener {

                override fun onNavigatorReady(nav: Navigator) {
                    Log.d(TAG, "Navigator pronto, iniciando rota para $label")
                    navigator = nav

                    // Injeta o Fragment de navegação na Activity
                    navFragment = SupportNavigationFragment.newInstance()
                    supportFragmentManager
                        .beginTransaction()
                        .replace(containerId, navFragment!!)
                        .commitNow()

                    // Aguarda o map estar pronto para então traçar a rota
                    navFragment!!.getMapAsync { _ ->
                        startRouteToDestination(lat, lng, label)
                    }
                }

                override fun onError(@NavigationApi.ErrorCode errorCode: Int) {
                    Log.e(TAG, "NavigationApi.onError código=$errorCode")
                    val msg = when (errorCode) {
                        NavigationApi.ErrorCode.NOT_AUTHORIZED ->
                            "API Key inválida ou Navigation SDK não autorizado."
                        NavigationApi.ErrorCode.TERMS_NOT_ACCEPTED ->
                            "Termos de serviço do Navigation SDK não aceitos."
                        NavigationApi.ErrorCode.NETWORK_ERROR ->
                            "Sem conexão com a internet."
                        else -> "Erro ao inicializar o Navigation SDK ($errorCode)."
                    }
                    Toast.makeText(this@NavigationActivity, msg, Toast.LENGTH_LONG).show()
                    setResult(RESULT_CANCELED)
                    finish()
                }
            }
        )
    }

    // ─── Traçar rota ─────────────────────────────────────────────────────────

    private fun startRouteToDestination(lat: Double, lng: Double, label: String) {
        val waypoint = try {
            Waypoint.builder()
                .setLatLng(lat, lng)
                .setTitle(label)
                .build()
        } catch (e: Waypoint.UnsupportedTravelModeException) {
            Log.e(TAG, "Modo de viagem não suportado: ${e.message}")
            stopAndFinish()
            return
        }

        val routingOptions = RoutingOptions().apply {
            travelMode(RoutingOptions.TravelMode.DRIVING)
        }

        navigator?.setDestination(waypoint, routingOptions)
            ?.addOnResultListener { code ->
                when (code) {
                    Navigator.RouteStatus.OK -> {
                        Log.d(TAG, "Rota calculada com sucesso. Iniciando guia de voz.")
                        navigator?.startGuidance()
                        navigator?.setAudioGuidance(Navigator.AudioGuidance.VOICE_ALERTS_AND_GUIDANCE)
                    }
                    Navigator.RouteStatus.NO_ROUTE_FOUND -> {
                        Log.e(TAG, "Nenhuma rota encontrada.")
                        Toast.makeText(this, "Nenhuma rota encontrada para o destino.", Toast.LENGTH_LONG).show()
                        stopAndFinish()
                    }
                    Navigator.RouteStatus.NETWORK_ERROR -> {
                        Log.e(TAG, "Erro de rede ao calcular rota.")
                        Toast.makeText(this, "Erro de rede ao calcular rota.", Toast.LENGTH_LONG).show()
                        stopAndFinish()
                    }
                    else -> {
                        Log.e(TAG, "Erro ao calcular rota: $code")
                        stopAndFinish()
                    }
                }
            }
    }

    // ─── Encerrar navegação ───────────────────────────────────────────────────

    private fun stopAndFinish() {
        navigator?.stopGuidance()
        navigator?.cleanup()
        navigator = null
        setResult(RESULT_OK)
        finish()
    }

    override fun onBackPressed() {
        // Botão de voltar do Android encerra a navegação e volta ao app
        stopAndFinish()
    }
}
