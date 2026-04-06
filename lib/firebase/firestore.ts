import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  type WhereFilterOp,
  type DocumentData,
  type QueryConstraint,
  Timestamp,
  increment,
} from "firebase/firestore"
import { db } from "./config"

// Re-exporta para uso direto
export {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  firestoreLimit as limit,
  serverTimestamp,
  Timestamp,
  increment,
  db,
}

/**
 * Helper que emula o padrao supabase.from('table').select().eq().single()
 * Facilita a migracao gradual dos arquivos
 */
export function createFirestoreClient() {
  return {
    from(collectionName: string) {
      const col = collection(db, collectionName)
      let constraints: QueryConstraint[] = []
      let _limit: number | null = null
      let _single = false
      let _orderField: string | null = null
      let _orderDir: "asc" | "desc" = "asc"

      const builder = {
        select(_fields?: string) {
          // Firestore sempre retorna todos os campos, select e no-op
          return builder
        },
        eq(field: string, value: unknown) {
          constraints.push(where(field, "==", value))
          return builder
        },
        neq(field: string, value: unknown) {
          constraints.push(where(field, "!=", value))
          return builder
        },
        gt(field: string, value: unknown) {
          constraints.push(where(field, ">", value))
          return builder
        },
        gte(field: string, value: unknown) {
          constraints.push(where(field, ">=", value))
          return builder
        },
        lt(field: string, value: unknown) {
          constraints.push(where(field, "<", value))
          return builder
        },
        lte(field: string, value: unknown) {
          constraints.push(where(field, "<=", value))
          return builder
        },
        in(field: string, values: unknown[]) {
          if (values.length > 0) {
            constraints.push(where(field, "in", values))
          }
          return builder
        },
        contains(field: string, value: unknown) {
          constraints.push(where(field, "array-contains", value))
          return builder
        },
        order(field: string, opts?: { ascending?: boolean }) {
          _orderField = field
          _orderDir = opts?.ascending === false ? "desc" : "asc"
          return builder
        },
        limit(n: number) {
          _limit = n
          return builder
        },
        single() {
          _single = true
          _limit = 1
          return builder.execute()
        },
        maybeSingle() {
          _single = true
          _limit = 1
          return builder.execute()
        },
        async execute(): Promise<{ data: DocumentData | DocumentData[] | null; error: Error | null; count?: number }> {
          try {
            const parts: QueryConstraint[] = [...constraints]
            if (_orderField) parts.push(orderBy(_orderField, _orderDir))
            if (_limit) parts.push(firestoreLimit(_limit))

            const q = query(col, ...parts)
            const snap = await getDocs(q)

            if (_single) {
              if (snap.empty) return { data: null, error: null }
              const d = snap.docs[0]
              return { data: { id: d.id, ...d.data() }, error: null }
            }

            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            return { data, error: null, count: data.length }
          } catch (err) {
            return { data: null, error: err as Error }
          }
        },
        then(resolve: (v: { data: DocumentData | DocumentData[] | null; error: Error | null }) => void, reject?: (e: Error) => void) {
          return builder.execute().then(resolve, reject)
        },

        // INSERT
        async insert(data: DocumentData | DocumentData[]) {
          try {
            if (Array.isArray(data)) {
              const results: DocumentData[] = []
              for (const item of data) {
                const cleaned = { ...item, created_at: serverTimestamp(), updated_at: serverTimestamp() }
                if (item.id) {
                  await setDoc(doc(db, collectionName, item.id), cleaned)
                  results.push({ id: item.id, ...cleaned })
                } else {
                  const ref = await addDoc(col, cleaned)
                  results.push({ id: ref.id, ...cleaned })
                }
              }
              return { data: results, error: null }
            }
            const cleaned = { ...data, created_at: serverTimestamp(), updated_at: serverTimestamp() }
            if (data.id) {
              await setDoc(doc(db, collectionName, data.id), cleaned)
              return { data: { id: data.id, ...cleaned }, error: null }
            }
            const ref = await addDoc(col, cleaned)
            return { data: { id: ref.id, ...cleaned }, error: null }
          } catch (err) {
            return { data: null, error: err as Error }
          }
        },

        // UPDATE (precisa de .eq() antes)
        async update(data: DocumentData) {
          try {
            // Se temos um filtro eq por id, atualiza direto
            const cleaned = { ...data, updated_at: serverTimestamp() }
            const parts: QueryConstraint[] = [...constraints]
            if (_limit) parts.push(firestoreLimit(_limit))
            const q = query(col, ...parts)
            const snap = await getDocs(q)

            if (snap.empty) return { data: null, error: null }

            for (const d of snap.docs) {
              await updateDoc(doc(db, collectionName, d.id), cleaned)
            }
            return { data: cleaned, error: null }
          } catch (err) {
            return { data: null, error: err as Error }
          }
        },

        // UPSERT
        async upsert(data: DocumentData | DocumentData[], opts?: { onConflict?: string }) {
          try {
            if (Array.isArray(data)) {
              for (const item of data) {
                const id = item.id ?? item[opts?.onConflict ?? "id"]
                if (id) {
                  await setDoc(doc(db, collectionName, id), { ...item, updated_at: serverTimestamp() }, { merge: true })
                } else {
                  await addDoc(col, { ...item, created_at: serverTimestamp(), updated_at: serverTimestamp() })
                }
              }
              return { data, error: null }
            }
            const id = data.id ?? data[opts?.onConflict ?? "id"]
            if (id) {
              await setDoc(doc(db, collectionName, id), { ...data, updated_at: serverTimestamp() }, { merge: true })
            } else {
              await addDoc(col, { ...data, created_at: serverTimestamp(), updated_at: serverTimestamp() })
            }
            return { data, error: null }
          } catch (err) {
            return { data: null, error: err as Error }
          }
        },

        // DELETE (precisa de .eq() antes)
        async delete() {
          try {
            const parts: QueryConstraint[] = [...constraints]
            const q = query(col, ...parts)
            const snap = await getDocs(q)
            for (const d of snap.docs) {
              await deleteDoc(doc(db, collectionName, d.id))
            }
            return { data: null, error: null }
          } catch (err) {
            return { data: null, error: err as Error }
          }
        },
      }

      return builder
    },

    // Acesso direto ao auth (para compatibilidade)
    auth: {
      async getUser() {
        // No server-side, isso precisa de admin SDK
        return { data: { user: null }, error: null }
      },
    },
  }
}
