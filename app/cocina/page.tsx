'use client'

import { Box, Container, Heading, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import ProtectedRoute from '../components/ProtectedRoute'
import OrderList from '../components/OrderList'

export default function CocinaPage() {
  return (
    <ProtectedRoute allowedRoles={['cocina', 'admin']}>
      <Container maxW="container.xl" py={8}>
        <Heading mb={6}>Panel de Cocina</Heading>
        
        <Tabs variant="enclosed">
          <TabList>
            <Tab>Pedidos Pendientes</Tab>
            <Tab>En Preparación</Tab>
            <Tab>Listos para Servir</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <OrderList status="pendiente" />
            </TabPanel>
            <TabPanel>
              <OrderList status="preparando" />
            </TabPanel>
            <TabPanel>
              <OrderList status="listo" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </ProtectedRoute>
  )
} 