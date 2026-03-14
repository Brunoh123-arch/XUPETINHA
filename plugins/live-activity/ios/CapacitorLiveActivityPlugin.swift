import Foundation
import Capacitor
import ActivityKit

// ─── Attributos da Live Activity ─────────────────────────────────────────────
//
// IMPORTANTE: Este struct deve ser declarado também na WidgetExtension target.
// Copie o arquivo "UppiRideAttributes.swift" para seu Widget Extension e
// assegure que o Bundle ID do app esteja configurado em ActivityKit no Info.plist:
//   NSSupportsLiveActivities = YES
//

@available(iOS 16.1, *)
struct UppiRideAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: String            // accepted | driver_arrived | in_progress | completed | cancelled
        var etaMinutes: Int
        var navigationInstruction: String?
    }

    var rideId: String
    var passengerName: String
    var passengerAvatarUrl: String?
    var originAddress: String
    var destinationAddress: String
}

// ─── Plugin Capacitor ─────────────────────────────────────────────────────────

@objc(CapacitorLiveActivityPlugin)
public class CapacitorLiveActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CapacitorLiveActivityPlugin"
    public let jsName = "CapacitorLiveActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable",    returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startActivity",  returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateActivity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "endActivity",    returnType: CAPPluginReturnPromise),
    ]

    // Mantém referência à atividade em andamento
    @available(iOS 16.1, *)
    private var currentActivity: Activity<UppiRideAttributes>?

    // ── isAvailable ──────────────────────────────────────────────────────────

    @objc func isAvailable(_ call: CAPPluginCall) {
        if #available(iOS 16.1, *) {
            call.resolve(["available": ActivityAuthorizationInfo().areActivitiesEnabled])
        } else {
            call.resolve(["available": false])
        }
    }

    // ── startActivity ────────────────────────────────────────────────────────

    @objc func startActivity(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.resolve(["available": false])
            return
        }

        guard
            let rideId           = call.getString("rideId"),
            let passengerName    = call.getString("passengerName"),
            let originAddress    = call.getString("originAddress"),
            let destinationAddress = call.getString("destinationAddress"),
            let status           = call.getString("status"),
            let etaMinutes       = call.getInt("etaMinutes")
        else {
            call.reject("Missing required parameters")
            return
        }

        // Encerra atividade anterior se existir
        Task {
            await self.currentActivity?.end(nil, dismissalPolicy: .immediate)
            self.currentActivity = nil
        }

        let attributes = UppiRideAttributes(
            rideId: rideId,
            passengerName: passengerName,
            passengerAvatarUrl: call.getString("passengerAvatarUrl"),
            originAddress: originAddress,
            destinationAddress: destinationAddress
        )

        let contentState = UppiRideAttributes.ContentState(
            status: status,
            etaMinutes: etaMinutes,
            navigationInstruction: nil
        )

        do {
            let activity = try Activity<UppiRideAttributes>.request(
                attributes: attributes,
                contentState: contentState,
                pushType: nil  // Sem push token — atualizamos via API local
            )
            if #available(iOS 16.1, *) {
                self.currentActivity = activity
            }
            call.resolve(["available": true, "activityId": activity.id])
        } catch {
            call.resolve(["available": false])
        }
    }

    // ── updateActivity ───────────────────────────────────────────────────────

    @objc func updateActivity(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else {
            call.resolve(["available": false])
            return
        }

        guard let activity = currentActivity else {
            call.resolve(["available": false])
            return
        }

        // Mantém os valores anteriores, substituindo apenas o que foi passado
        let prevState = activity.contentState
        let newState = UppiRideAttributes.ContentState(
            status:                call.getString("status") ?? prevState.status,
            etaMinutes:            call.getInt("etaMinutes") ?? prevState.etaMinutes,
            navigationInstruction: call.getString("navigationInstruction") ?? prevState.navigationInstruction
        )

        Task {
            await activity.update(using: newState)
            call.resolve(["available": true, "activityId": activity.id])
        }
    }

    // ── endActivity ──────────────────────────────────────────────────────────

    @objc func endActivity(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.resolve(["success": false])
            return
        }

        guard let activity = currentActivity else {
            call.resolve(["success": true]) // Já estava encerrada
            return
        }

        Task {
            // Mantém o tile visível por 4 horas antes de desaparecer (padrão do iOS)
            await activity.end(nil, dismissalPolicy: .after(.now + 4 * 3600))
            self.currentActivity = nil
            call.resolve(["success": true])
        }
    }
}
