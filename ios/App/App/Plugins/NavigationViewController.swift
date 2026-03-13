import UIKit
import GoogleMaps
import GoogleNavigation

/**
 * NavigationViewController (iOS)
 *
 * UIViewController totalmente nativo que embute o GMSNavigationMapView
 * do Google Maps Navigation SDK. Equivalente à NavigationActivity do Android.
 *
 * O motorista vê:
 *  - Mapa com a rota azul e turn-by-turn
 *  - Instrução de voz via AVSpeechSynthesizer (TTS nativa)
 *  - Velocidade e tempo estimado (HUD nativo do SDK)
 *  - Botão "Encerrar" no canto superior esquerdo
 *
 * Funciona em background: o iOS mantém o CLLocationManager e o TTS ativo
 * enquanto o app está em foreground (NavigationViewController visível).
 * Para manter o áudio com tela bloqueada, o app precisa de Background Modes
 * "Audio, AirPlay, and Picture in Picture" + "Location updates" no Info.plist.
 */
final class NavigationViewController: UIViewController {

    // ─── Parâmetros recebidos do plugin ──────────────────────────────────────

    private let latitude:  Double
    private let longitude: Double
    private let label:     String

    /// Closure chamada quando o VC é dispensado (nil = sucesso, String = erro)
    var onFinished: ((String?) -> Void)?

    // ─── Views ────────────────────────────────────────────────────────────────

    private var mapView: GMSMapView?
    private var navView: GMSNavigationMapView?

    // ─── Init ─────────────────────────────────────────────────────────────────

    init(latitude: Double, longitude: Double, label: String) {
        self.latitude  = latitude
        self.longitude = longitude
        self.label     = label
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) not implemented") }

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black

        requestNavigationPermissionAndStart()
        setupCloseButton()
    }

    override var prefersStatusBarHidden: Bool { false }

    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }

    // ─── UI: botão de fechar ──────────────────────────────────────────────────

    private func setupCloseButton() {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setTitle("✕  Encerrar", for: .normal)
        button.titleLabel?.font = .systemFont(ofSize: 15, weight: .semibold)
        button.setTitleColor(.white, for: .normal)
        button.backgroundColor = UIColor(red: 0.1, green: 0.1, blue: 0.1, alpha: 0.85)
        button.layer.cornerRadius = 20
        button.contentEdgeInsets = UIEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)
        button.addTarget(self, action: #selector(closeTapped), for: .touchUpInside)

        view.addSubview(button)
        NSLayoutConstraint.activate([
            button.topAnchor.constraint(
                equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 12),
            button.leadingAnchor.constraint(
                equalTo: view.leadingAnchor, constant: 16),
        ])
    }

    @objc private func closeTapped() {
        stopNavigationAndDismiss(error: nil)
    }

    // ─── Permissão de localização + inicialização do SDK ─────────────────────

    private func requestNavigationPermissionAndStart() {
        // Verificar se o Navigation SDK foi inicializado com uma API Key válida
        // A inicialização ocorre em AppDelegate via GMSServices.provideAPIKey()
        guard GMSNavigationServices.areTermsAndConditionsAccepted() else {
            // Exibe o dialog de Termos de Uso do Navigation SDK (obrigatório)
            GMSNavigationServices.showTermsAndConditionsDialogIfNeeded(
                withTitle:   "Termos de Navegação",
                companyName: "Uppi"
            ) { [weak self] accepted in
                if accepted {
                    self?.initNavigationMapView()
                } else {
                    self?.stopNavigationAndDismiss(
                        error: "Termos de Uso do Navigation SDK não aceitos."
                    )
                }
            }
            return
        }
        initNavigationMapView()
    }

    // ─── Inicializa o GMSNavigationMapView ───────────────────────────────────

    private func initNavigationMapView() {
        let camera = GMSCameraPosition.camera(
            withLatitude:  latitude,
            longitude:     longitude,
            zoom:          15.0
        )

        let nav = GMSNavigationMapView(
            frame: view.bounds,
            camera: camera
        )
        nav.autoresizingMask     = [.flexibleWidth, .flexibleHeight]
        nav.settings.myLocationButton  = true
        nav.isMyLocationEnabled  = true
        nav.navigationEnabled    = true
        nav.cameraMode           = .following
        nav.travelMode           = .driving

        // Guia de voz ativo (usa AVSpeechSynthesizer nativo do iOS)
        nav.voiceGuidance        = .alertsAndGuidance

        // HUD superior com instrução e HUD inferior com ETA
        nav.isNavigationHeaderEnabled = true
        nav.isNavigationFooterEnabled = true

        nav.delegate = self

        view.insertSubview(nav, at: 0)
        self.navView = nav

        // Traça a rota ao destino
        startRoute()
    }

    // ─── Traçar rota ─────────────────────────────────────────────────────────

    private func startRoute() {
        guard let nav = navView else { return }

        let target = GMSNavigationMutableWaypoint()
        target.title     = label
        target.coordinate = CLLocationCoordinate2D(
            latitude:  latitude,
            longitude: longitude
        )

        nav.navigator?.setDestinations([target]) { [weak self] routeStatus in
            guard let self = self else { return }
            switch routeStatus {
            case .OK:
                nav.navigator?.isGuidanceActive = true
                print("[NavigationViewController] Rota calculada. Guia de voz iniciado.")
            case .noRouteFound:
                self.showError("Nenhuma rota encontrada para o destino.")
            case .networkError:
                self.showError("Sem conexão para calcular a rota.")
            case .waypointError:
                self.showError("Coordenadas inválidas.")
            default:
                self.showError("Erro desconhecido ao calcular a rota (\(routeStatus.rawValue)).")
            }
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private func showError(_ message: String) {
        let alert = UIAlertController(
            title:   "Erro de Navegação",
            message: message,
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "Fechar", style: .default) { [weak self] _ in
            self?.stopNavigationAndDismiss(error: message)
        })
        present(alert, animated: true)
    }

    private func stopNavigationAndDismiss(error: String?) {
        navView?.navigator?.isGuidanceActive = false
        navView?.clear()
        dismiss(animated: true) { [weak self] in
            self?.onFinished?(error)
        }
    }
}

// ─── GMSNavigationMapViewDelegate ────────────────────────────────────────────

extension NavigationViewController: GMSNavigationMapViewDelegate {

    // Rota chegou ao destino — fecha o VC automaticamente
    func navigationMapView(
        _ mapView: GMSNavigationMapView,
        didArriveAtWaypoint waypoint: GMSNavigationWaypoint
    ) {
        print("[NavigationViewController] Destino atingido: \(waypoint.title ?? label)")
        stopNavigationAndDismiss(error: nil)
    }

    // Erro de rota durante a navegação (ex: perda de GPS)
    func navigationMapViewDidChangeRoute(_ mapView: GMSNavigationMapView) {
        print("[NavigationViewController] Rota recalculada.")
    }
}
