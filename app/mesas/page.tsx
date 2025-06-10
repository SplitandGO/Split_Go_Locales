'use client'

import { Box, Container, Heading, Button, useDisclosure } from '@chakra-ui/react'
import TableGrid from '../components/TableGrid'
import ProtectedRoute from '../components/ProtectedRoute'

export default function MesasPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <ProtectedRoute allowedRoles={['mesero', 'admin']}>
      <Container maxW="container.xl" py={10}>
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={4}>
            Gestión de Mesas
          </Heading>
        </Box>

        <TableGrid />
      </Container>
    </ProtectedRoute>
  )
} 