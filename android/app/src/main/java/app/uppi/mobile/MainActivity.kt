package app.uppi.mobile

import com.getcapacitor.BridgeActivity
import app.uppi.mobile.plugins.NavigationPlugin

/**
 * MainActivity — ponto de entrada do app Android.
 *
 * Herda de BridgeActivity (Capacitor), que inicializa o WebView e todos os
 * plugins registrados.
 *
 * Para adicionar novos plugins nativos: chame registerPlugin() aqui.
 */
class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: android.os.Bundle?) {
        // Registra o plugin ANTES de super.onCreate() para que o Capacitor
        // o disponibilize ao JS desde o primeiro carregamento do WebView.
        registerPlugin(NavigationPlugin::class.java)

        super.onCreate(savedInstanceState)
    }
}
