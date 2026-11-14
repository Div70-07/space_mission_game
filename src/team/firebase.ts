import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

let app: FirebaseApp | null = null
let db: Database | null = null
let firebaseAvailable = false

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.databaseURL) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    db = getDatabase(app)
    firebaseAvailable = true
  }
} catch {
  // Graceful degradation when network/credentials are invalid
  firebaseAvailable = false
}

export { app, db, firebaseAvailable }
