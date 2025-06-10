'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Select,
  Button,
  useColorModeValue
} from '@chakra-ui/react'
import { useState } from 'react'

interface Estadistica {
  id: string
  titulo: string
  valor: number
  cambio: number
  periodo: string
}

export default function EstadisticasPage() {
  const [periodo, setPeriodo] = useState('hoy')
  const cardBg = useColorModeValue('white', 'gray.700')

  const estadisticas: Estadistica[] = [
    {
      id: 'ventas',
      titulo: 'Ventas Totales',
      valor: 12500,
      cambio: 12.5,
      periodo: 'hoy'
    },
    {
      id: 'pedidos',
      titulo: 'Pedidos',
      valor: 156,
      cambio: 8.2,
      periodo: 'hoy'
    },
    {
      id: 'clientes',
      titulo: 'Clientes Nuevos',
      valor: 24,
      cambio: -2.1,
      periodo: 'hoy'
    },
    {
      id: 'ticket',
      titulo: 'Ticket Promedio',
      valor: 80.13,
      cambio: 4.3,
      periodo: 'hoy'
    }
  ]

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Estadísticas</Heading>
            <Text mt={2} color="gray.600">
              Análisis en tiempo real de tu negocio
            </Text>
          </Box>
          <HStack>
            <Select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              width="200px"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mes</option>
              <option value="año">Este Año</option>
            </Select>
            <Button colorScheme="blue">Exportar Reporte</Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {estadisticas.map((stat) => (
            <Card key={stat.id} bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel>{stat.titulo}</StatLabel>
                  <StatNumber>
                    {stat.id === 'ticket'
                      ? `$${stat.valor.toFixed(2)}`
                      : stat.valor.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow
                      type={stat.cambio >= 0 ? 'increase' : 'decrease'}
                    />
                    {Math.abs(stat.cambio)}%
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <Heading size="md" mb={4}>
                Ventas por Categoría
              </Heading>
              {/* Aquí iría el gráfico de ventas por categoría */}
              <Text color="gray.500">Gráfico de ventas por categoría</Text>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md">
            <CardBody>
              <Heading size="md" mb={4}>
                Horas Pico
              </Heading>
              {/* Aquí iría el gráfico de horas pico */}
              <Text color="gray.500">Gráfico de horas pico</Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card bg={cardBg} shadow="md">
          <CardBody>
            <Heading size="md" mb={4}>
              Tendencias de Ventas
            </Heading>
            {/* Aquí iría el gráfico de tendencias */}
            <Text color="gray.500">Gráfico de tendencias de ventas</Text>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
} 