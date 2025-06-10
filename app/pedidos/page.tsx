'use client'

import { Box, Container, Heading } from '@chakra-ui/react'
import OrderList from '../components/OrderList'
import ProtectedRoute from '../components/ProtectedRoute'

export default function PedidosPage() {
  return (
    <ProtectedRoute allowedRoles={['mesero', 'admin']}>
      <Container maxW="container.xl" py={8}>
        <Heading mb={6}>Gestión de Pedidos</Heading>
        <OrderList />
      </Container>
    </ProtectedRoute>
  )
} 