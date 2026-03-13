package app.uppi.mobile.plugins

import android.content.Intent
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * CapacitorNavigationPlugin
 *
 * Ponte entre o front-end TypeScript e o Google Maps Navigation SDK nativo
 * no Android. Abre a NavigationActivity (que embute o SupportNavigationFragment)
 * e retorna o resultado para o JS via PluginCall.
 *
 * Registro em MainAcitivity.kt:
 *   add(NavigationPlugin::class.java)
 */
@CapacitorPlugin(name = "CapacitorNavigation")
class NavigationPlugin : Plugin() {

    companion object {
        private const val TAG = "CapacitorNavigation"

        // Request code para identificar o retorno da NavigationActivity
        const val REQUEST_NAVIGATION = 9001
    }

    // Guarda a call ativa para resolver depois que a Activity retornar
    private var pendingCall: PluginCall? = null

    // ─── isAvailable ─────────────────────────────────────────────────────────

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        // O Navigation SDK está disponível se a dependência foi incluída no build.gradle.
        // Verificamos dinamicamente se a classe principal do SDK existe no classpath.
        val available = try {
            Class.forName("com.google.android.libraries.navigation.NavigationApi")
            true
        } catch (e: ClassNotFoundException) {
            Log.w(TAG, "Navigation SDK não encontrado no classpath: ${e.message}")
            false
        }

        val result = JSObject()
        result.put("available", available)
        call.resolve(result)
    }

    // ─── startNavigation ─────────────────────────────────────────────────────

    @PluginMethod
    fun startNavigation(call: PluginCall) {
        val lat   = call.getDouble("lat")
        val lng   = call.getDouble("lng")
        val label = call.getString("label") ?: "Destino"

        if (lat == null || lng == null) {
            call.reject("Parâmetros 'lat' e 'lng' são obrigatórios.")
            return
        }

        // Salva a call para resolver quando a Activity terminar
        pendingCall = call

        val intent = Intent(activity, NavigationActivity::class.java).apply {
            putExtra(NavigationActivity.EXTRA_LAT,   lat)
            putExtra(NavigationActivity.EXTRA_LNG,   lng)
            putExtra(NavigationActivity.EXTRA_LABEL, label)
        }

        Log.d(TAG, "Iniciando NavigationActivity → lat=$lat lng=$lng label=$label")
        startActivityForResult(call, intent, REQUEST_NAVIGATION)
    }

    // ─── stopNavigation ──────────────────────────────────────────────────────

    @PluginMethod
    fun stopNavigation(call: PluginCall) {
        // Encerra a NavigationActivity se estiver em foreground
        activity.runOnUiThread {
            // Envia um broadcast para a Activity se fechar
            val intent = Intent(NavigationActivity.ACTION_STOP_NAVIGATION)
            activity.sendBroadcast(intent)
        }
        call.resolve()
    }

    // ─── Callback quando a NavigationActivity retorna ────────────────────────

    override fun handleOnActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.handleOnActivityResult(requestCode, resultCode, data)

        if (requestCode != REQUEST_NAVIGATION) return

        val savedCall = pendingCall ?: return
        pendingCall = null

        val result = JSObject()
        result.put("initialized", true)

        Log.d(TAG, "NavigationActivity retornou, resultCode=$resultCode")
        savedCall.resolve(result)
    }
}
