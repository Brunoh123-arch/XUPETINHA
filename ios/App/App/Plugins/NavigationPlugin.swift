import Foundation
import Capacitor

/**
 * NavigationPlugin (iOS)
 *
 * Ponte entre o front-end TypeScript e o Google Maps Navigation SDK
 * no iOS. Apresenta um NavigationViewController por cima do WebView,
 * exibindo mapa turn-by-turn com voz nativa — sem sair do app.
 *
 * Registro em AppDelegate.swift:
 *   CAPBridge.registerPlugin(NavigationPlugin.self)
 *
 * Ou via capacitor.config.json:
 *   { "plugins": { "CapacitorNavigation": {} } }
 */
@objc(NavigationPlugin)
public class NavigationPlugin: CAPPlugin, CAPBridgedPlugin {

    // ─── Identificação do plugin (deve coincidir com registerPlugin no TS) ────
    public let identifier   = "NavigationPlugin"
    public let jsName       = "CapacitorNavigation"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable",     returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startNavigation", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopNavigation",  returnType: CAPPluginReturnPromise),
    ]

    // Referência ao ViewController de navegação ativo
    private var navController: NavigationViewController?

    // ─── isAvailable ─────────────────────────────────────────────────────────

    @objc func isAvailable(_ call: CAPPluginCall) {
        // Verifica se a classe principal do Navigation SDK existe no bundle
        let available = NSClassFromString("GMSNavigationServices") != nil
        call.resolve(["available": available])
    }

    // ─── startNavigation ─────────────────────────────────────────────────────

    @objc func startNavigation(_ call: CAPPluginCall) {
        guard
            let lat   = call.getDouble("lat"),
            let lng   = call.getDouble("lng")
        else {
            call.reject("Parâmetros 'lat' e 'lng' são obrigatórios.")
            return
        }
        let label = call.getString("label") ?? "Destino"

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            let vc = NavigationViewController(
                latitude:  lat,
                longitude: lng,
                label:     label
            )

            // Callback de conclusão: resolve a promise JS quando o VC fechar
            vc.onFinished = { [weak self] error in
                self?.navController = nil
                if let error = error {
                    call.reject(error)
                } else {
                    call.resolve(["initialized": true])
                }
            }

            self.navController = vc

            // Apresenta sobre o WebView do Capacitor em tela cheia
            vc.modalPresentationStyle = .fullScreen
            self.bridge?.viewController?.present(vc, animated: true)
        }
    }

    // ─── stopNavigation ──────────────────────────────────────────────────────

    @objc func stopNavigation(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            self?.navController?.dismiss(animated: true) {
                self?.navController = nil
                call.resolve()
            }
        }
    }
}
