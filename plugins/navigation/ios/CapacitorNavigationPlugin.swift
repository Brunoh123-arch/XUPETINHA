/**
 * CapacitorNavigationPlugin — iOS
 *
 * Integra o Google Maps Navigation SDK (GoogleNavigation) para oferecer
 * navegação turn-by-turn in-app, sem sair para um app externo.
 *
 * ─── ONDE COLOCAR ESTE ARQUIVO ───────────────────────────────────────────────
 *
 * Copiar para:
 *   ios/App/App/plugins/navigation/CapacitorNavigationPlugin.swift
 *
 * Registrar no AppDelegate.swift:
 *   // Nada a fazer — o @objc @CAPPlugin registra automaticamente via Capacitor.
 *
 * ─── PODFILE (ios/App/Podfile) ───────────────────────────────────────────────
 *
 *   pod 'GoogleNavigation', '~> 9.1'
 *   # GoogleNavigation já inclui GoogleMaps, remova duplicatas se existirem.
 *
 * ─── Info.plist ──────────────────────────────────────────────────────────────
 *
 *   NSLocationWhenInUseUsageDescription  → "Usado para exibir sua posição no mapa"
 *   NSLocationAlwaysUsageDescription     → "Usado para navegar em segundo plano"
 *
 * ─── API KEY (AppDelegate.swift) ─────────────────────────────────────────────
 *
 *   import GoogleMaps
 *   GMSServices.provideAPIKey("SUA_CHAVE_AQUI")
 *
 *   // Para Navigation SDK ≥ 9:
 *   import GoogleNavigation
 *   GMSNavigationServices.setAbnormalTerminationReportingEnabled(true)
 */

import Capacitor
import CoreLocation
import UIKit
import GoogleMaps
import GoogleNavigation

// MARK: - Plugin principal

@objc(CapacitorNavigationPlugin)
public class CapacitorNavigationPlugin: CAPPlugin {

    private var navigator: GMSNavigator?
    private var mapView: GMSMapView?
    private var navViewController: NavigationViewController?

    // Tokens para remover listeners do SDK
    private var progressObserver: Any?

    // MARK: isAvailable

    @objc func isAvailable(_ call: CAPPluginCall) {
        // Se a classe GMSNavigator existir no runtime, o SDK está linkado
        let available = (NSClassFromString("GMSNavigator") != nil)
        call.resolve(["available": available])
    }

    // MARK: startNavigation

    @objc func startNavigation(_ call: CAPPluginCall) {
        guard
            let lat = call.getDouble("lat"),
            let lng = call.getDouble("lng")
        else {
            call.reject("Missing lat or lng")
            return
        }
        let label = call.getString("label") ?? "Destino"

        // Verifica se o usuário aceitou os T&Cs do Navigation SDK
        GMSNavigationServices.showTermsAndConditionsDialogIfNeeded(
            withCompanyName: "Uppi",
            uiParams: nil
        ) { [weak self] termsAccepted in
            guard termsAccepted else {
                call.reject("Usuário não aceitou os Termos de Uso do Navigation SDK")
                return
            }
            self?.requestLocationAndStart(call: call, lat: lat, lng: lng, label: label)
        }
    }

    private func requestLocationAndStart(call: CAPPluginCall, lat: Double, lng: Double, label: String) {
        let manager = CLLocationManager()
        if manager.authorizationStatus == .notDetermined {
            manager.requestWhenInUseAuthorization()
            // Chamada assíncrona — para simplicidade, aguardamos 0.5 s e tentamos de novo
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                self?.presentNavigationScreen(call: call, lat: lat, lng: lng, label: label)
            }
        } else {
            presentNavigationScreen(call: call, lat: lat, lng: lng, label: label)
        }
    }

    private func presentNavigationScreen(call: CAPPluginCall, lat: Double, lng: Double, label: String) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            // Cria o GMSMapView com NavigationEnabled
            let camera = GMSCameraPosition.camera(withLatitude: lat, longitude: lng, zoom: 15)
            let options = GMSMapViewOptions()
            options.camera = camera

            let mapView = GMSMapView(options: options)
            mapView.isNavigationEnabled = true
            mapView.settings.compassButton = true
            mapView.cameraMode = .following
            mapView.travelMode = .driving
            self.mapView = mapView

            // Obtém o Navigator
            guard let nav = mapView.navigator else {
                call.reject("Não foi possível criar o Navigator")
                return
            }
            self.navigator = nav
            nav.isVoiceEnabled = true

            // Define o destino
            let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lng)
            let waypoint = GMSNavigationWaypoint(location: coordinate, title: label)

            nav.setDestinations([waypoint]) { [weak self] routeStatus in
                guard let self = self else { return }

                if routeStatus == .OK {
                    nav.isGuidanceActive = true
                    self.setUpSDKListeners(nav: nav, mapView: mapView)

                    // Apresenta o ViewController de navegação sobre o WebView
                    let vc = NavigationViewController(mapView: mapView, plugin: self)
                    self.navViewController = vc
                    vc.modalPresentationStyle = .overFullScreen

                    self.bridge?.viewController?.present(vc, animated: true) {
                        let result = JSObject()
                        result["initialized"] = true
                        call.resolve(result)
                    }
                } else {
                    let result = JSObject()
                    result["initialized"] = false
                    result["error"] = "RouteStatus: \(routeStatus.rawValue)"
                    call.resolve(result)
                }
            }
        }
    }

    // MARK: stopNavigation

    @objc func stopNavigation(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.tearDownListeners()
            self.navigator?.isGuidanceActive = false
            self.navigator?.clearDestinations()

            self.navViewController?.dismiss(animated: true) {
                self.navViewController = nil
                self.navigator = nil
                self.mapView = nil
                self.notifyListeners("navigationStopped", data: [:])
                call.resolve()
            }
        }
    }

    // MARK: Listeners do SDK

    private func setUpSDKListeners(nav: GMSNavigator, mapView: GMSMapView) {
        // Progresso — a cada update do SDK emite para o front-end
        progressObserver = nav.add(observer: { [weak self, weak nav, weak mapView] _ in
            guard
                let self = self,
                let nav = nav
            else { return }

            guard let step = nav.currentRouteLeg?.steps.first else { return }
            let timeAndDist = nav.timeAndDistanceRemaining

            var data = JSObject()
            data["nextStepInstruction"]         = step.simpleInstruction ?? step.exitRoadName ?? ""
            data["distanceToNextStepMeters"]    = step.distanceFromPrevStep
            data["timeToDestinationSeconds"]    = timeAndDist.time
            data["distanceToDestinationMeters"] = timeAndDist.distance
            data["currentRoadName"]             = nav.currentRouteLeg?.roadName ?? ""
            data["maneuverType"]                = self.mapManeuver(step.maneuver)

            if let loc = mapView?.myLocation {
                data["currentLat"]     = loc.coordinate.latitude
                data["currentLng"]     = loc.coordinate.longitude
                data["currentHeading"] = loc.course >= 0 ? loc.course : 0
            }

            self.notifyListeners("navigationProgress", data: data)
        }, on: .routeUpdated)

        // Chegada
        nav.didArriveAtWaypoint = { [weak self] _ in
            self?.notifyListeners("arrivedAtDestination", data: [:])
            return false // false = não avança para o próximo waypoint automaticamente
        }
    }

    private func tearDownListeners() {
        if let obs = progressObserver as? GMSNavigatorListener {
            navigator?.remove(listener: obs)
        }
        progressObserver = nil
        navigator?.didArriveAtWaypoint = nil
    }

    /**
     * Mapeia GMSNavigationManeuver para a string esperada pelo front-end.
     */
    private func mapManeuver(_ maneuver: GMSNavigationManeuver) -> String {
        switch maneuver {
        case .turnLeft:          return "turn_left"
        case .turnRight:         return "turn_right"
        case .turnSlightLeft:    return "turn_slight_left"
        case .turnSlightRight:   return "turn_slight_right"
        case .turnSharpLeft:     return "turn_sharp_left"
        case .turnSharpRight:    return "turn_sharp_right"
        case .uturnLeft,
             .uturnRight:        return "uturn"
        case .roundaboutLeft,
             .roundaboutRight:   return "roundabout"
        case .straight:          return "straight"
        case .destination,
             .destinationLeft,
             .destinationRight:  return "destination"
        default:                 return "unknown"
        }
    }
}

// MARK: - ViewController que envolve o GMSMapView

/**
 * NavigationViewController
 *
 * UIViewController simples que hospeda o GMSMapView (com Navigation ativado)
 * em fullscreen. Tem um botão de fechar para voltar ao app.
 */
class NavigationViewController: UIViewController {

    private let mapView: GMSMapView
    private weak var plugin: CapacitorNavigationPlugin?

    init(mapView: GMSMapView, plugin: CapacitorNavigationPlugin) {
        self.mapView = mapView
        self.plugin = plugin
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) not implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()

        // Mapa fullscreen
        mapView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(mapView)
        NSLayoutConstraint.activate([
            mapView.topAnchor.constraint(equalTo: view.topAnchor),
            mapView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            mapView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            mapView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])

        // Botão fechar (canto superior esquerdo, sobre safe area)
        let closeButton = UIButton(type: .system)
        closeButton.setImage(
            UIImage(systemName: "xmark.circle.fill",
                    withConfiguration: UIImage.SymbolConfiguration(pointSize: 28, weight: .medium)),
            for: .normal
        )
        closeButton.tintColor = .white
        closeButton.addTarget(self, action: #selector(closeTapped), for: .touchUpInside)
        closeButton.translatesAutoresizingMaskIntoConstraints = false
        closeButton.backgroundColor = UIColor.black.withAlphaComponent(0.4)
        closeButton.layer.cornerRadius = 22
        closeButton.clipsToBounds = true
        view.addSubview(closeButton)
        NSLayoutConstraint.activate([
            closeButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 12),
            closeButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            closeButton.widthAnchor.constraint(equalToConstant: 44),
            closeButton.heightAnchor.constraint(equalToConstant: 44),
        ])
    }

    @objc private func closeTapped() {
        // Delega o stop ao plugin para garantir limpeza correta
        let call = CAPPluginCall()
        plugin?.stopNavigation(call)
    }
}
