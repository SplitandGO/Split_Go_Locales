'use client'

import { Box, Container, Heading, Button, useDisclosure } from '@chakra-ui/react'
import MenuGrid from '../components/MenuGrid'
import ProtectedRoute from '../components/ProtectedRoute'

export default function CartaPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <ProtectedRoute allowedRoles={['mesero', 'admin', 'cliente']}>
      <Container maxW="container.xl" py={10}>
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={4}>
            Carta Digital
          </Heading>
        </Box>

        <MenuGrid />
      </Container>
    </ProtectedRoute>
  )
} 