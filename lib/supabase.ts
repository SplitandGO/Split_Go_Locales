import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  role: 'cliente' | 'mesero' | 'cocina' | 'admin'
  created_at: string
}

export type Table = {
  id: string
  number: number
  status: 'libre' | 'ocupada' | 'reservada'
  created_at: string
}

export type Order = {
  id: string
  table_id: string
  user_id: string
  status: 'pendiente' | 'preparando' | 'listo' | 'entregado'
  items: OrderItem[]
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  notes: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  available: boolean
  created_at: string
} 