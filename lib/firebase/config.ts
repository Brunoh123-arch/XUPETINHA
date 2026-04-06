import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCro6pGmZ0v1DaZzli9tivAPSTDopfMejs",
  authDomain: "uppi-digitalapp.firebaseapp.com",
  projectId: "uppi-digitalapp",
  storageBucket: "uppi-digitalapp.firebasestorage.app",
  messagingSenderId: "97447404680",
  appId: "1:97447404680:web:40201173f5260f51adab3d",
  measurementId: "G-HRR7C49CLQ",
}

// Singleton — evita inicializar Firebase multiplas vezes
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
