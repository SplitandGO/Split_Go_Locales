import { createClient } from '@supabase/supabase-js'

// Configuración para el superadmin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Crear cliente de Supabase con permisos de superadmin
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Funciones específicas para el superadmin
export const createRestaurant = async (restaurantData: {
  name: string
  address: string
  phone: string
  email: string
}) => {
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .insert([restaurantData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const createAdminUser = async (userData: {
  email: string
  restaurant_id: string
}) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([{ ...userData, role: 'admin' }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getRestaurantAnalytics = async (restaurantId: string) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      count,
      sum:total_amount,
      avg:total_amount,
      created_at
    `)
    .eq('restaurant_id', restaurantId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export const getSystemAnalytics = async () => {
  const { data: restaurants, error: restaurantsError } = await supabaseAdmin
    .from('restaurants')
    .select('id, name')

  if (restaurantsError) throw restaurantsError

  const analytics = await Promise.all(
    restaurants.map(async (restaurant) => {
      const { data: orders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select(`
          count,
          sum:total_amount,
          avg:total_amount
        `)
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (ordersError) throw ordersError

      return {
        restaurant: restaurant.name,
        ...orders
      }
    })
  )

  return analytics
}

export const updateRestaurantSettings = async (
  restaurantId: string,
  settings: {
    name?: string
    address?: string
    phone?: string
    email?: string
  }
) => {
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .update(settings)
    .eq('id', restaurantId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteRestaurant = async (restaurantId: string) => {
  const { error } = await supabaseAdmin
    .from('restaurants')
    .delete()
    .eq('id', restaurantId)

  if (error) throw error
} 