'use client'

import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Select,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react'
import { useState } from 'react'
import { useSupabase } from '@/lib/supabase'

interface StatisticsProps {
  period: 'day' | 'week' | 'month' | 'year'
  onPeriodChange?: (period: StatisticsProps['period']) => void
}

interface StatData {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  salesGrowth: number
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  salesByCategory: Array<{
    category: string
    revenue: number
    percentage: number
  }>
}

export default function Statistics({ period, onPeriodChange }: StatisticsProps) {
  const [statData, setStatData] = useState<StatData>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    salesGrowth: 0,
    topProducts: [],
    salesByCategory: []
  })

  const { supabase } = useSupabase()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const fetchStatistics = async (selectedPeriod: StatisticsProps['period']) => {
    try {
      // Aquí iría la lógica para obtener las estadísticas de Supabase
      // Por ahora usamos datos de ejemplo
      setStatData({
        totalSales: 15000,
        totalOrders: 150,
        averageOrderValue: 100,
        salesGrowth: 15,
        topProducts: [
          { name: 'Producto 1', quantity: 50, revenue: 5000 },
          { name: 'Producto 2', quantity: 30, revenue: 3000 },
          { name: 'Producto 3', quantity: 20, revenue: 2000 }
        ],
        salesByCategory: [
          { category: 'Bebidas', revenue: 6000, percentage: 40 },
          { category: 'Comidas', revenue: 7500, percentage: 50 },
          { category: 'Postres', revenue: 1500, percentage: 10 }
        ]
      })
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value as StatisticsProps['period']
    if (onPeriodChange) {
      onPeriodChange(newPeriod)
    }
    fetchStatistics(newPeriod)
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Select
          value={period}
          onChange={handlePeriodChange}
          width="200px"
          mb={4}
        >
          <option value="day">Hoy</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mes</option>
          <option value="year">Este Año</option>
        </Select>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Stat
            px={4}
            py={5}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            shadow="sm"
          >
            <StatLabel>Ventas Totales</StatLabel>
            <StatNumber>${statData.totalSales.toFixed(2)}</StatNumber>
            <StatHelpText>
              <StatArrow
                type={statData.salesGrowth >= 0 ? 'increase' : 'decrease'}
              />
              {Math.abs(statData.salesGrowth)}%
            </StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            shadow="sm"
          >
            <StatLabel>Pedidos Totales</StatLabel>
            <StatNumber>{statData.totalOrders}</StatNumber>
            <StatHelpText>Pedidos procesados</StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            shadow="sm"
          >
            <StatLabel>Valor Promedio</StatLabel>
            <StatNumber>${statData.averageOrderValue.toFixed(2)}</StatNumber>
            <StatHelpText>Por pedido</StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            shadow="sm"
          >
            <StatLabel>Crecimiento</StatLabel>
            <StatNumber>{statData.salesGrowth}%</StatNumber>
            <StatHelpText>Respecto al período anterior</StatHelpText>
          </Stat>
        </SimpleGrid>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Box
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          p={4}
          shadow="sm"
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Productos Más Vendidos
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Producto</Th>
                <Th isNumeric>Cantidad</Th>
                <Th isNumeric>Ingresos</Th>
              </Tr>
            </Thead>
            <Tbody>
              {statData.topProducts.map((product) => (
                <Tr key={product.name}>
                  <Td>{product.name}</Td>
                  <Td isNumeric>{product.quantity}</Td>
                  <Td isNumeric>${product.revenue.toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          p={4}
          shadow="sm"
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Ventas por Categoría
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Categoría</Th>
                <Th isNumeric>Ingresos</Th>
                <Th isNumeric>Porcentaje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {statData.salesByCategory.map((category) => (
                <Tr key={category.category}>
                  <Td>{category.category}</Td>
                  <Td isNumeric>${category.revenue.toFixed(2)}</Td>
                  <Td isNumeric>{category.percentage}%</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SimpleGrid>
    </VStack>
  )
} 