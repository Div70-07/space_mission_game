import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'
import { getAuth, signInAnonymously, type Auth, type User } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

let app: FirebaseApp | null = null
let db: Database | null = null
let auth: Auth | null = null
let firebaseAvailable = false

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.databaseURL) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    db = getDatabase(app)
    auth = getAuth(app)
    firebaseAvailable = true
  }
} catch {
  // Graceful degradation when network/credentials are invalid
  firebaseAvailable = false
}

export async function getOrCreateAnonymousUser(): Promise<User | null> {
  if (!auth) return null
  if (auth.currentUser) return auth.currentUser
  try {
    const cred = await signInAnonymously(auth)
    return cred.user
  } catch (err) {
    console.warn('Firebase Anonymous Auth failed:', err)
    return null
  }
}

export { app, db, auth, firebaseAvailable }
