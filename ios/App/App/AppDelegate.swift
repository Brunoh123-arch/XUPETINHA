import UIKit
import Capacitor
import GoogleMaps
import GoogleNavigation

/**
 * AppDelegate
 *
 * Ponto de entrada nativo do app iOS.
 * Aqui inicializamos o Google Maps Services + Navigation SDK e
 * registramos o NavigationPlugin no Capacitor.
 */
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {

        // ─── Google Maps: inicialização obrigatória antes de qualquer uso ────
        //
        // IMPORTANTE: substitua pela sua API Key real.
        // NÃO commite a chave no repositório.
        // Recomendação: leia de um arquivo GoogleService-Info.plist privado
        // ou de uma variável de ambiente via scripts de CI/CD.
        //
        let mapsApiKey = Bundle.main.object(
            forInfoDictionaryKey: "GOOGLE_MAPS_API_KEY"
        ) as? String ?? "SUBSTITUA_PELA_SUA_API_KEY"

        GMSServices.provideAPIKey(mapsApiKey)

        // Relatório de encerramento anormal (recomendado pelo Google)
        GMSNavigationServices.setAbnormalTerminationReportingEnabled(true)

        // ─── Registro do NavigationPlugin no Capacitor ──────────────────────
        // O plugin recebe chamadas JS de NavigationPlugin.startNavigation()
        // e apresenta o NavigationViewController sobre o WebView.
        CAPBridge.registerPlugin(NavigationPlugin.self)

        return true
    }

    // ─── Deep links ──────────────────────────────────────────────────────────

    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(
        _ application: UIApplication,
        continue userActivity: NSUserActivity,
        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(
            application,
            continue: userActivity,
            restorationHandler: restorationHandler
        )
    }

    // ─── Push Notifications (FCM via @capacitor/push-notifications) ──────────

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        NotificationCenter.default.post(
            name: .capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
    }
}
