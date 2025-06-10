'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Badge,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Flex,
  Spacer,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Divider,
  useColorModeValue
} from '@chakra-ui/react'
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiSettings, FiBarChart2, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { supabase } from '@/lib/supabase'
import { redis } from '@/lib/redis'
import { roles, premiumFeatures, limits, analytics, integrations, support, security, customization, superadminUtils } from './config'

export default function SuperadminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    premiumUsers: 0,
    premiumRestaurants: 0,
    activeUsers: 0,
    activeRestaurants: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('users')
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchStats()
  }, [selectedTimeframe])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const { data: users } = await supabase
        .from('users')
        .select('id, is_premium, last_active')
      
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id, is_premium, last_active')
      
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total, created_at')
        .gte('created_at', getTimeframeDate(selectedTimeframe))

      const stats = {
        totalUsers: users?.length || 0,
        totalRestaurants: restaurants?.length || 0,
        totalOrders: orders?.length || 0,
        totalRevenue: orders?.reduce((acc, order) => acc + order.total, 0) || 0,
        premiumUsers: users?.filter(user => user.is_premium).length || 0,
        premiumRestaurants: restaurants?.filter(restaurant => restaurant.is_premium).length || 0,
        activeUsers: users?.filter(user => isActive(user.last_active)).length || 0,
        activeRestaurants: restaurants?.filter(restaurant => isActive(restaurant.last_active)).length || 0
      }

      setStats(stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las estadísticas',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const getTimeframeDate = (timeframe: string) => {
    const now = new Date()
    switch (timeframe) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1))
      case 'week':
        return new Date(now.setDate(now.getDate() - 7))
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1))
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1))
      default:
        return new Date(now.setDate(now.getDate() - 7))
    }
  }

  const isActive = (lastActive: string) => {
    const lastActiveDate = new Date(lastActive)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 100
    return ((current - previous) / previous) * 100
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        {/* Encabezado */}
        <Box>
          <Heading size="lg">Panel de Superadmin</Heading>
          <Text color="gray.500">Gestión y análisis de la plataforma</Text>
        </Box>

        {/* Filtros */}
        <Flex gap={4}>
          <Select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            w="200px"
          >
            <option value="day">Último día</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="year">Último año</option>
          </Select>
          <Select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            w="200px"
          >
            <option value="users">Usuarios</option>
            <option value="restaurants">Restaurantes</option>
            <option value="orders">Pedidos</option>
            <option value="revenue">Ingresos</option>
          </Select>
        </Flex>

        {/* Estadísticas principales */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Usuarios Totales</StatLabel>
                <StatNumber>{stats.totalUsers}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {getGrowthRate(stats.totalUsers, stats.totalUsers - 100)}%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Restaurantes Totales</StatLabel>
                <StatNumber>{stats.totalRestaurants}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {getGrowthRate(stats.totalRestaurants, stats.totalRestaurants - 50)}%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Pedidos Totales</StatLabel>
                <StatNumber>{stats.totalOrders}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {getGrowthRate(stats.totalOrders, stats.totalOrders - 200)}%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Ingresos Totales</StatLabel>
                <StatNumber>${stats.totalRevenue.toFixed(2)}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {getGrowthRate(stats.totalRevenue, stats.totalRevenue - 1000)}%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Pestañas de análisis */}
        <Tabs variant="enclosed">
          <TabList>
            <Tab>Usuarios</Tab>
            <Tab>Restaurantes</Tab>
            <Tab>Pedidos</Tab>
            <Tab>Ingresos</Tab>
            <Tab>Configuración</Tab>
          </TabList>

          <TabPanels>
            {/* Panel de Usuarios */}
            <TabPanel>
              <Stack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardHeader>
                      <Heading size="md">Usuarios Premium</Heading>
                    </CardHeader>
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Premium</StatLabel>
                        <StatNumber>{stats.premiumUsers}</StatNumber>
                        <StatHelpText>
                          {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% del total
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardHeader>
                      <Heading size="md">Usuarios Activos</Heading>
                    </CardHeader>
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Activos</StatLabel>
                        <StatNumber>{stats.activeUsers}</StatNumber>
                        <StatHelpText>
                          {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% del total
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardHeader>
                    <Heading size="md">Distribución de Planes</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Plan</Th>
                          <Th>Usuarios</Th>
                          <Th>Porcentaje</Th>
                          <Th>Ingresos</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Básico</Td>
                          <Td>{stats.totalUsers - stats.premiumUsers}</Td>
                          <Td>{(((stats.totalUsers - stats.premiumUsers) / stats.totalUsers) * 100).toFixed(1)}%</Td>
                          <Td>$0.00</Td>
                        </Tr>
                        <Tr>
                          <Td>Premium</Td>
                          <Td>{stats.premiumUsers}</Td>
                          <Td>{((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%</Td>
                          <Td>${(stats.premiumUsers * 9.99).toFixed(2)}</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Stack>
            </TabPanel>

            {/* Panel de Restaurantes */}
            <TabPanel>
              <Stack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardHeader>
                      <Heading size="md">Restaurantes Premium</Heading>
                    </CardHeader>
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Premium</StatLabel>
                        <StatNumber>{stats.premiumRestaurants}</StatNumber>
                        <StatHelpText>
                          {((stats.premiumRestaurants / stats.totalRestaurants) * 100).toFixed(1)}% del total
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardHeader>
                      <Heading size="md">Restaurantes Activos</Heading>
                    </CardHeader>
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Activos</StatLabel>
                        <StatNumber>{stats.activeRestaurants}</StatNumber>
                        <StatHelpText>
                          {((stats.activeRestaurants / stats.totalRestaurants) * 100).toFixed(1)}% del total
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardHeader>
                    <Heading size="md">Distribución de Planes</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Plan</Th>
                          <Th>Restaurantes</Th>
                          <Th>Porcentaje</Th>
                          <Th>Ingresos</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Básico</Td>
                          <Td>{stats.totalRestaurants - stats.premiumRestaurants}</Td>
                          <Td>{(((stats.totalRestaurants - stats.premiumRestaurants) / stats.totalRestaurants) * 100).toFixed(1)}%</Td>
                          <Td>$0.00</Td>
                        </Tr>
                        <Tr>
                          <Td>Premium</Td>
                          <Td>{stats.premiumRestaurants}</Td>
                          <Td>{((stats.premiumRestaurants / stats.totalRestaurants) * 100).toFixed(1)}%</Td>
                          <Td>${(stats.premiumRestaurants * 99.99).toFixed(2)}</Td>
                        </Tr>
                        <Tr>
                          <Td>Enterprise</Td>
                          <Td>0</Td>
                          <Td>0%</Td>
                          <Td>$0.00</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Stack>
            </TabPanel>

            {/* Panel de Pedidos */}
            <TabPanel>
              <Stack spacing={6}>
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardHeader>
                    <Heading size="md">Estadísticas de Pedidos</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Métrica</Th>
                          <Th>Valor</Th>
                          <Th>Crecimiento</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Total de Pedidos</Td>
                          <Td>{stats.totalOrders}</Td>
                          <Td>
                            <StatArrow type="increase" />
                            {getGrowthRate(stats.totalOrders, stats.totalOrders - 200)}%
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>Pedidos por Usuario</Td>
                          <Td>{(stats.totalOrders / stats.totalUsers).toFixed(1)}</Td>
                          <Td>
                            <StatArrow type="increase" />
                            {getGrowthRate(stats.totalOrders / stats.totalUsers, (stats.totalOrders - 200) / (stats.totalUsers - 100))}%
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>Pedidos por Restaurante</Td>
                          <Td>{(stats.totalOrders / stats.totalRestaurants).toFixed(1)}</Td>
                          <Td>
                            <StatArrow type="increase" />
                            {getGrowthRate(stats.totalOrders / stats.totalRestaurants, (stats.totalOrders - 200) / (stats.totalRestaurants - 50))}%
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Stack>
            </TabPanel>

            {/* Panel de Ingresos */}
            <TabPanel>
              <Stack spacing={6}>
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardHeader>
                    <Heading size="md">Análisis de Ingresos</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Fuente</Th>
                          <Th>Ingresos</Th>
                          <Th>Porcentaje</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Suscripciones Usuarios</Td>
                          <Td>${(stats.premiumUsers * 9.99).toFixed(2)}</Td>
                          <Td>{(((stats.premiumUsers * 9.99) / stats.totalRevenue) * 100).toFixed(1)}%</Td>
                        </Tr>
                        <Tr>
                          <Td>Suscripciones Restaurantes</Td>
                          <Td>${(stats.premiumRestaurants * 99.99).toFixed(2)}</Td>
                          <Td>{(((stats.premiumRestaurants * 99.99) / stats.totalRevenue) * 100).toFixed(1)}%</Td>
                        </Tr>
                        <Tr>
                          <Td>Comisiones de Pedidos</Td>
                          <Td>${(stats.totalRevenue - (stats.premiumUsers * 9.99) - (stats.premiumRestaurants * 99.99)).toFixed(2)}</Td>
                          <Td>{(((stats.totalRevenue - (stats.premiumUsers * 9.99) - (stats.premiumRestaurants * 99.99)) / stats.totalRevenue) * 100).toFixed(1)}%</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Stack>
            </TabPanel>

            {/* Panel de Configuración */}
            <TabPanel>
              <Stack spacing={6}>
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardHeader>
                    <Heading size="md">Configuración de Planes</Heading>
                  </CardHeader>
                  <CardBody>
                    <Tabs>
                      <TabList>
                        <Tab>Usuarios</Tab>
                        <Tab>Restaurantes</Tab>
                      </TabList>

                      <TabPanels>
                        <TabPanel>
                          <Table>
                            <Thead>
                              <Tr>
                                <Th>Plan</Th>
                                <Th>Precio</Th>
                                <Th>Características</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              <Tr>
                                <Td>Básico</Td>
                                <Td>$0.00</Td>
                                <Td>
                                  <Stack>
                                    {premiumFeatures.customer.basic.features.map((feature, index) => (
                                      <Text key={index}>{feature}</Text>
                                    ))}
                                  </Stack>
                                </Td>
                              </Tr>
                              <Tr>
                                <Td>Premium</Td>
                                <Td>${premiumFeatures.customer.premium.price}</Td>
                                <Td>
                                  <Stack>
                                    {premiumFeatures.customer.premium.features.map((feature, index) => (
                                      <Text key={index}>{feature}</Text>
                                    ))}
                                  </Stack>
                                </Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </TabPanel>

                        <TabPanel>
                          <Table>
                            <Thead>
                              <Tr>
                                <Th>Plan</Th>
                                <Th>Precio</Th>
                                <Th>Características</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              <Tr>
                                <Td>Básico</Td>
                                <Td>$0.00</Td>
                                <Td>
                                  <Stack>
                                    {premiumFeatures.restaurant.basic.features.map((feature, index) => (
                                      <Text key={index}>{feature}</Text>
                                    ))}
                                  </Stack>
                                </Td>
                              </Tr>
                              <Tr>
                                <Td>Premium</Td>
                                <Td>${premiumFeatures.restaurant.premium.price}</Td>
                                <Td>
                                  <Stack>
                                    {premiumFeatures.restaurant.premium.features.map((feature, index) => (
                                      <Text key={index}>{feature}</Text>
                                    ))}
                                  </Stack>
                                </Td>
                              </Tr>
                              <Tr>
                                <Td>Enterprise</Td>
                                <Td>${premiumFeatures.restaurant.enterprise.price}</Td>
                                <Td>
                                  <Stack>
                                    {premiumFeatures.restaurant.enterprise.features.map((feature, index) => (
                                      <Text key={index}>{feature}</Text>
                                    ))}
                                  </Stack>
                                </Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </CardBody>
                </Card>
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Container>
  )
} 