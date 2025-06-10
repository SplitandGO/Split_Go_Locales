'use client'

import { Box, Container, Heading, SimpleGrid, Button, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const roles = [
    {
      title: 'Cliente',
      description: 'Accede a la carta, realiza pedidos y paga tu cuenta individualmente',
      path: '/cliente'
    },
    {
      title: 'Mesero',
      description: 'Gestiona mesas, registra pedidos y comunícate con cocina',
      path: '/mesero'
    },
    {
      title: 'Cocina',
      description: 'Visualiza y gestiona pedidos, marca preparados y comunícate con meseros',
      path: '/cocina'
    },
    {
      title: 'Administrador',
      description: 'Gestiona el restaurante, usuarios, carta y estadísticas',
      path: '/admin'
    }
  ]

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" py={10}>
          <Heading as="h1" size="2xl" mb={4}>
            Bienvenido a Split&Go
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Tu solución integral para la gestión de restaurantes
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {roles.map((role) => (
            <Box
              key={role.title}
              p={6}
              bg={bgColor}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
              transition="all 0.3s"
            >
              <VStack spacing={4} align="stretch">
                <Heading as="h3" size="lg">
                  {role.title}
                </Heading>
                <Text color="gray.600">{role.description}</Text>
                <Button
                  colorScheme="blue"
                  onClick={() => router.push(role.path)}
                  mt={4}
                >
                  Acceder
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  )
} 