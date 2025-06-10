import { createClient } from '@supabase/supabase-js'

// Configuración compartida para ambas apps
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})

// Tipos para las tablas compartidas
export interface Restaurant {
  id: string
  name: string
  address: string
  phone: string
  email: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'mesero' | 'cocina' | 'cliente' | 'superadmin'
  restaurant_id?: string
  created_at: string
  last_login: string
}

export interface Order {
  id: string
  restaurant_id: string
  user_id: string
  status: 'pendiente' | 'preparando' | 'listo' | 'entregado'
  total_amount: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  notes: string
}

export interface Product {
  id: string
  restaurant_id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  is_available: boolean
  created_at: string
  updated_at: string
}

// Funciones de utilidad para la base de datos compartida
export const getRestaurantById = async (id: string) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Restaurant
}

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as User
}

export const getOrdersByRestaurant = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      ),
      user:users (*)
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getProductsByRestaurant = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('category', { ascending: true })
  
  if (error) throw error
  return data as Product[]
}

// Funciones específicas para el superadmin
export const getAllRestaurants = async () => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) throw error
  return data as Restaurant[]
}

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('last_login', { ascending: false })
  
  if (error) throw error
  return data as User[]
}

export const getRestaurantStats = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      count,
      sum:total_amount,
      avg:total_amount
    `)
    .eq('restaurant_id', restaurantId)
    .single()
  
  if (error) throw error
  return data
} 