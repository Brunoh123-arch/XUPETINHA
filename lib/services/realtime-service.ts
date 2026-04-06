/**
 * Realtime Service — Firebase Firestore onSnapshot
 * Substitui o Supabase Realtime por listeners do Firestore.
 */
import { db } from "@/lib/firebase/config"
import {
  collection,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
  type DocumentData,
} from "firebase/firestore"

export type TableName =
  | "rides"
  | "price_offers"
  | "messages"
  | "notifications"
  | "driver_profiles"
  | "driver_locations"
  | "social_posts"
  | "post_likes"
  | "post_comments"
  | "wallet_transactions"
  | "payments"
  | "ratings"
  | "user_achievements"

export type ChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

export interface RealtimeOptions {
  event?: ChangeEvent
  schema?: string
  filter?: string
}

// Compat payload para manter a mesma interface
interface CompatPayload<T = DocumentData> {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: T | null
  old: T | null
  table: string
}

// Wrapper de channel para compatibilidade
class FirestoreChannel {
  topic: string
  private unsub: Unsubscribe | null = null

  constructor(topic: string, unsub: Unsubscribe) {
    this.topic = topic
    this.unsub = unsub
  }

  unsubscribe() {
    if (this.unsub) {
      this.unsub()
      this.unsub = null
    }
  }
}

class RealtimeService {
  private channels: Map<string, FirestoreChannel> = new Map()

  subscribeToTable<T = DocumentData>(
    table: TableName,
    callback: (payload: CompatPayload<T>) => void,
    options?: RealtimeOptions
  ): FirestoreChannel {
    const channelName = `${table}_${options?.event || "all"}_${Date.now()}`
    const col = collection(db, table)

    // Parse do filtro Supabase-style (e.g. "id=eq.123")
    let q = query(col)
    if (options?.filter) {
      const parts = options.filter.split("=eq.")
      if (parts.length === 2) {
        q = query(col, where(parts[0], "==", parts[1]))
      }
    }

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let eventType: "INSERT" | "UPDATE" | "DELETE" = "UPDATE"
        if (change.type === "added") eventType = "INSERT"
        if (change.type === "removed") eventType = "DELETE"

        if (options?.event && options.event !== "*" && options.event !== eventType) return

        callback({
          eventType,
          new: eventType !== "DELETE" ? ({ id: change.doc.id, ...change.doc.data() } as T) : null,
          old: eventType === "DELETE" ? ({ id: change.doc.id, ...change.doc.data() } as T) : null,
          table,
        })
      })
    })

    const channel = new FirestoreChannel(channelName, unsub)
    this.channels.set(channelName, channel)
    return channel
  }

  subscribeToRide(rideId: string, callback: (payload: CompatPayload) => void): FirestoreChannel {
    return this.subscribeToTable("rides", callback, { filter: `id=eq.${rideId}` })
  }

  subscribeToPriceOffers(rideId: string, callback: (payload: CompatPayload) => void): FirestoreChannel {
    return this.subscribeToTable("price_offers", callback, { filter: `ride_id=eq.${rideId}` })
  }

  subscribeToMessages(rideId: string, callback: (payload: CompatPayload) => void): FirestoreChannel {
    return this.subscribeToTable("messages", callback, { filter: `ride_id=eq.${rideId}` })
  }

  subscribeToNotifications(userId: string, callback: (payload: CompatPayload) => void): FirestoreChannel {
    return this.subscribeToTable("notifications", callback, {
      filter: `user_id=eq.${userId}`,
      event: "INSERT",
    })
  }

  subscribeToDriverLocation(driverId: string, callback: (payload: CompatPayload) => void): FirestoreChannel {
    return this.subscribeToTable("driver_locations", callback, {
      filter: `driver_id=eq.${driverId}`,
      event: "UPDATE",
    })
  }

  subscribeToNearbyDrivers(callback: (payload: CompatPayload) => void): FirestoreChannel {
    return this.subscribeToTable("driver_profiles", callback, { event: "UPDATE" })
  }

  async unsubscribe(channel: FirestoreChannel): Promise<void> {
    channel.unsubscribe()
    this.channels.delete(channel.topic)
  }

  async unsubscribeAll(): Promise<void> {
    this.channels.forEach((ch) => ch.unsubscribe())
    this.channels.clear()
  }

  getActiveChannelsCount(): number {
    return this.channels.size
  }

  isConnected(): boolean {
    return this.channels.size > 0
  }

  async broadcast(_channelName: string, _event: string, _payload: unknown): Promise<void> {
    // Firestore nao tem broadcast nativo — no-op
  }

  createPresenceChannel(_channelName: string, _userId: string, _userData: unknown): FirestoreChannel {
    // Firestore nao tem presence nativo — retorna channel vazio
    const unsub: Unsubscribe = () => {}
    const channel = new FirestoreChannel(_channelName, unsub)
    this.channels.set(_channelName, channel)
    return channel
  }
}

export const realtimeService = new RealtimeService()
