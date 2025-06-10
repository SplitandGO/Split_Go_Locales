'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Select,
  Button
} from '@chakra-ui/react'
import { useSupabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

interface DashboardStats {
  total_sales: number
  total_orders: number
  average_order_value: number
  sales_growth: number
  orders_growth: number
  top_products: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  sales_by_category: Array<{
    category: string
    revenue: number
  }>
  sales_by_hour: Array<{
    hour: number
    revenue: number
  }>
  sales_by_day: Array<{
    day: string
    revenue: number
  }>
}

interface DashboardProps {
  restaurantId: string
}

export default function Dashboard({ restaurantId }: DashboardProps) {
  const { supabase } = useSupabase()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [restaurantId, period])

  const fetchStats = async () => {
    try {
      setLoading(true)

      // Obtener ventas totales
      const { data: salesData, error: salesError } = await supabase
        .from('orders')
        .select('total, created_at')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', getStartDate())
        .eq('payment_status', 'paid')

      if (salesError) throw salesError

      const total_sales = salesData.reduce((sum, order) => sum + order.total, 0)
      const total_orders = salesData.length
      const average_order_value = total_orders > 0 ? total_sales / total_orders : 0

      // Obtener crecimiento de ventas
      const { data: previousSalesData, error: previousSalesError } = await supabase
        .from('orders')
        .select('total')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', getPreviousStartDate())
        .lt('created_at', getStartDate())
        .eq('payment_status', 'paid')

      if (previousSalesError) throw previousSalesError

      const previous_total_sales = previousSalesData.reduce((sum, order) => sum + order.total, 0)
      const sales_growth = previous_total_sales > 0
        ? ((total_sales - previous_total_sales) / previous_total_sales) * 100
        : 0

      // Obtener productos más vendidos
      const { data: topProductsData, error: topProductsError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          menu_item:menu_items(
            name,
            price
          )
        `)
        .eq('restaurant_id', restaurantId)
        .gte('created_at', getStartDate())

      if (topProductsError) throw topProductsError

      const productMap = new Map()
      topProductsData.forEach((item) => {
        const key = item.menu_item.name
        if (productMap.has(key)) {
          const current = productMap.get(key)
          productMap.set(key, {
            name: key,
            quantity: current.quantity + item.quantity,
            revenue: current.revenue + (item.quantity * item.menu_item.price)
          })
        } else {
          productMap.set(key, {
            name: key,
            quantity: item.quantity,
            revenue: item.quantity * item.menu_item.price
          })
        }
      })

      const top_products = Array.from(productMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

      // Obtener ventas por categoría
      const { data: categoryData, error: categoryError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          menu_item:menu_items(
            category,
            price
          )
        `)
        .eq('restaurant_id', restaurantId)
        .gte('created_at', getStartDate())

      if (categoryError) throw categoryError

      const categoryMap = new Map()
      categoryData.forEach((item) => {
        const key = item.menu_item.category
        if (categoryMap.has(key)) {
          categoryMap.set(key, categoryMap.get(key) + (item.quantity * item.menu_item.price))
        } else {
          categoryMap.set(key, item.quantity * item.menu_item.price)
        }
      })

      const sales_by_category = Array.from(categoryMap.entries())
        .map(([category, revenue]) => ({ category, revenue }))
        .sort((a, b) => b.revenue - a.revenue)

      // Obtener ventas por hora
      const sales_by_hour = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        revenue: salesData
          .filter((order) => new Date(order.created_at).getHours() === hour)
          .reduce((sum, order) => sum + order.total, 0)
      }))

      // Obtener ventas por día
      const sales_by_day = salesData.reduce((acc, order) => {
        const day = new Date(order.created_at).toLocaleDateString()
        if (acc[day]) {
          acc[day] += order.total
        } else {
          acc[day] = order.total
        }
        return acc
      }, {} as Record<string, number>)

      const sales_by_day_array = Object.entries(sales_by_day)
        .map(([day, revenue]) => ({ day, revenue }))
        .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())

      setStats({
        total_sales,
        total_orders,
        average_order_value,
        sales_growth,
        orders_growth: 0, // TODO: Implementar cálculo de crecimiento de pedidos
        top_products,
        sales_by_category,
        sales_by_hour,
        sales_by_day: sales_by_day_array
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStartDate = () => {
    const now = new Date()
    switch (period) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0)).toISOString()
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString()
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString()
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString()
      default:
        return new Date(now.setHours(0, 0, 0, 0)).toISOString()
    }
  }

  const getPreviousStartDate = () => {
    const now = new Date()
    switch (period) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1)).toISOString()
      case 'week':
        return new Date(now.setDate(now.getDate() - 14)).toISOString()
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 2)).toISOString()
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 2)).toISOString()
      default:
        return new Date(now.setDate(now.getDate() - 1)).toISOString()
    }
  }

  if (loading || !stats) {
    return (
      <Box p={4}>
        <Text>Cargando estadísticas...</Text>
      </Box>
    )
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Dashboard
          </Text>
          <HStack>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
            >
              <option value="day">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="year">Este Año</option>
            </Select>
            <Button onClick={fetchStats}>Actualizar</Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Box
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            shadow="sm"
          >
            <Stat>
              <StatLabel>Ventas Totales</StatLabel>
              <StatNumber>{stats.total_sales.toFixed(2)} €</StatNumber>
              <StatHelpText>
                <StatArrow
                  type={stats.sales_growth >= 0 ? 'increase' : 'decrease'}
                />
                {Math.abs(stats.sales_growth).toFixed(1)}%
              </StatHelpText>
            </Stat>
          </Box>

          <Box
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            shadow="sm"
          >
            <Stat>
              <StatLabel>Pedidos Totales</StatLabel>
              <StatNumber>{stats.total_orders}</StatNumber>
              <StatHelpText>
                <StatArrow
                  type={stats.orders_growth >= 0 ? 'increase' : 'decrease'}
                />
                {Math.abs(stats.orders_growth).toFixed(1)}%
              </StatHelpText>
            </Stat>
          </Box>

          <Box
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            shadow="sm"
          >
            <Stat>
              <StatLabel>Valor Medio del Pedido</StatLabel>
              <StatNumber>{stats.average_order_value.toFixed(2)} €</StatNumber>
            </Stat>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            shadow="sm"
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Productos Más Vendidos
            </Text>
            <VStack align="start" spacing={2}>
              {stats.top_products.map((product) => (
                <HStack key={product.name} justify="space-between" width="100%">
                  <Text>{product.name}</Text>
                  <Text fontWeight="bold">
                    {product.quantity} unidades - {product.revenue.toFixed(2)} €
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          <Box
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            shadow="sm"
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Ventas por Categoría
            </Text>
            <VStack align="start" spacing={2}>
              {stats.sales_by_category.map((category) => (
                <HStack key={category.category} justify="space-between" width="100%">
                  <Text>{category.category}</Text>
                  <Text fontWeight="bold">{category.revenue.toFixed(2)} €</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            shadow="sm"
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Ventas por Hora
            </Text>
            <VStack align="start" spacing={2}>
              {stats.sales_by_hour.map((hour) => (
                <HStack key={hour.hour} justify="space-between" width="100%">
                  <Text>{hour.hour}:00</Text>
                  <Text fontWeight="bold">{hour.revenue.toFixed(2)} €</Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          <Box
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            shadow="sm"
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Ventas por Día
            </Text>
            <VStack align="start" spacing={2}>
              {stats.sales_by_day.map((day) => (
                <HStack key={day.day} justify="space-between" width="100%">
                  <Text>{new Date(day.day).toLocaleDateString()}</Text>
                  <Text fontWeight="bold">{day.revenue.toFixed(2)} €</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  )
} 