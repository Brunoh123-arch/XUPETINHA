import SwiftUI
import WidgetKit
import ActivityKit

// ─── Widget Entry Point ───────────────────────────────────────────────────────
//
// SETUP:
//   1. Crie um novo target "Widget Extension" no Xcode (File > New > Target > Widget Extension)
//   2. Copie UppiRideAttributes.swift e este arquivo para o novo target
//   3. Habilite Live Activities no Info.plist do APP principal:
//        NSSupportsLiveActivities = YES
//   4. Adicione o Bundle ID do widget ao campo "Widget Extension" em Signing & Capabilities
//

@main
struct UppiRideWidgetBundle: WidgetBundle {
    var body: some Widget {
        UppiRideLiveActivityWidget()
    }
}

// ─── Status helpers ───────────────────────────────────────────────────────────

private struct StatusInfo {
    let label: String
    let color: Color
    let icon: String // SF Symbol
}

private func statusInfo(for status: String) -> StatusInfo {
    switch status {
    case "accepted":
        return StatusInfo(label: "A caminho", color: .blue, icon: "car.fill")
    case "driver_arrived":
        return StatusInfo(label: "Chegou no local", color: .orange, icon: "mappin.circle.fill")
    case "in_progress":
        return StatusInfo(label: "Em andamento", color: .green, icon: "arrow.triangle.turn.up.right.diamond.fill")
    case "completed":
        return StatusInfo(label: "Finalizada", color: .green, icon: "checkmark.circle.fill")
    case "cancelled":
        return StatusInfo(label: "Cancelada", color: .red, icon: "xmark.circle.fill")
    default:
        return StatusInfo(label: "Corrida", color: .gray, icon: "car.fill")
    }
}

// ─── Live Activity Widget ─────────────────────────────────────────────────────

@available(iOSApplicationExtension 16.1, *)
struct UppiRideLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: UppiRideAttributes.self) { context in
            // ── Tela de bloqueio / Notification banner ────────────────────
            LockScreenView(attributes: context.attributes, state: context.state)
        } dynamicIsland: { context in
            DynamicIsland {
                // ── Dynamic Island expandida ──────────────────────────────
                DynamicIslandExpandedRegion(.leading) {
                    Label {
                        Text(context.attributes.passengerName)
                            .font(.headline)
                            .foregroundColor(.white)
                    } icon: {
                        Image(systemName: statusInfo(for: context.state.status).icon)
                            .foregroundColor(statusInfo(for: context.state.status).color)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 2) {
                        if context.state.etaMinutes > 0 {
                            Text("\(context.state.etaMinutes) min")
                                .font(.title2.bold())
                                .foregroundColor(.white)
                            Text("ETA")
                                .font(.caption2)
                                .foregroundColor(.gray)
                        }
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    if let instruction = context.state.navigationInstruction {
                        Text(instruction)
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                            .lineLimit(1)
                            .padding(.horizontal, 4)
                    } else {
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.up.right")
                                .font(.caption2)
                                .foregroundColor(.gray)
                            Text(context.attributes.destinationAddress)
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.7))
                                .lineLimit(1)
                        }
                    }
                }
            } compactLeading: {
                // ── Dynamic Island compacta — lado esquerdo ───────────────
                Image(systemName: statusInfo(for: context.state.status).icon)
                    .foregroundColor(statusInfo(for: context.state.status).color)
            } compactTrailing: {
                // ── Dynamic Island compacta — lado direito ────────────────
                if context.state.etaMinutes > 0 {
                    Text("\(context.state.etaMinutes)m")
                        .font(.caption.bold())
                        .foregroundColor(.white)
                } else {
                    Image(systemName: "checkmark")
                        .foregroundColor(.green)
                }
            } minimal: {
                // ── Minimal (quando há duas atividades) ───────────────────
                Image(systemName: statusInfo(for: context.state.status).icon)
                    .foregroundColor(statusInfo(for: context.state.status).color)
            }
        }
    }
}

// ─── Lock Screen View ─────────────────────────────────────────────────────────

@available(iOSApplicationExtension 16.1, *)
struct LockScreenView: View {
    let attributes: UppiRideAttributes
    let state: UppiRideAttributes.ContentState

    private var info: StatusInfo { statusInfo(for: state.status) }

    var body: some View {
        HStack(spacing: 12) {
            // Ícone de status
            ZStack {
                Circle()
                    .fill(info.color.opacity(0.2))
                    .frame(width: 44, height: 44)
                Image(systemName: info.icon)
                    .foregroundColor(info.color)
                    .font(.title3)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(info.label)
                    .font(.headline)
                    .foregroundColor(.primary)
                Text(attributes.passengerName)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                if let instruction = state.navigationInstruction {
                    Text(instruction)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            if state.etaMinutes > 0 {
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(state.etaMinutes)")
                        .font(.title.bold())
                        .foregroundColor(.primary)
                    Text("min")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground).opacity(0.9))
        .cornerRadius(16)
    }
}
