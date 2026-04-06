import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function getServiceAccount(): ServiceAccount | undefined {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as ServiceAccount
  } catch {
    return undefined
  }
}

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(
        getServiceAccount()
          ? { credential: cert(getServiceAccount()!) }
          : {
              projectId: "uppi-digitalapp",
            }
      )

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export default adminApp
