import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken } from 'firebase/messaging'
import { getAuth, onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useState, useEffect } from 'react'
import { getFirestore } from 'firebase/firestore'
import { supabase } from './supabase'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null
const auth = getAuth(app)
const db = getFirestore(app)

export const getFCMToken = async () => {
  if (!messaging) return null

  try {
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })
    return currentToken
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

// Función para iniciar sesión
export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Obtener el rol del usuario desde Supabase
    const { data: userData, error } = await supabase
      .from('users')
      .select('role, restaurant_id')
      .eq('email', email)
      .single()

    if (error) throw error

    // Actualizar último acceso
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email)

    return {
      user,
      role: userData.role,
      restaurantId: userData.restaurant_id
    }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Función para cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Hook personalizado para la autenticación
export const useAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Obtener el rol del usuario desde Supabase
        const { data: userData, error } = await supabase
          .from('users')
          .select('role, restaurant_id')
          .eq('email', user.email)
          .single()

        if (!error && userData) {
          setRole(userData.role)
          setRestaurantId(userData.restaurant_id)
        }
      } else {
        setRole(null)
        setRestaurantId(null)
      }
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return {
    user,
    role,
    restaurantId,
    loading,
    isAuthenticated: !!user,
    isSuperAdmin: role === 'superadmin',
    isAdmin: role === 'admin',
    isMesero: role === 'mesero',
    isCocina: role === 'cocina',
    isCliente: role === 'cliente'
  }
}

export { app, messaging, auth, db } 