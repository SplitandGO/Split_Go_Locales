'use client'

import { Box, Container, Heading, SimpleGrid, Button, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const features = [
    {
      title: 'Gestión de Mesas',
      description: 'Administra mesas, pedidos y comandas en tiempo real',
      icon: '🍽️',
      path: '/mesas'
    },
    {
      title: 'Cocina',
      description: 'Visualiza y gestiona pedidos, marca preparados',
      icon: '👨‍🍳',
      path: '/cocina'
    },
    {
      title: 'Administración',
      description: 'Gestiona usuarios, carta, inventario y estadísticas',
      icon: '📊',
      path: '/admin'
    },
    {
      title: 'Superadmin',
      description: 'Panel de control global y gestión de restaurantes',
      icon: '👑',
      path: '/superadmin'
    }
  ]

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" py={10}>
          <Heading as="h1" size="2xl" mb={4}>
            Bienvenido a Split&Go Work
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Tu solución integral para la gestión de restaurantes
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {features.map((feature) => (
            <Box
              key={feature.title}
              p={6}
              bg={bgColor}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
              transition="all 0.3s"
            >
              <VStack spacing={4} align="stretch">
                <Text fontSize="4xl" textAlign="center">
                  {feature.icon}
                </Text>
                <Heading as="h3" size="lg" textAlign="center">
                  {feature.title}
                </Heading>
                <Text color="gray.600" textAlign="center">{feature.description}</Text>
                <Button
                  colorScheme="blue"
                  onClick={() => router.push(feature.path)}
                  mt={4}
                >
                  Acceder
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        <Box textAlign="center" py={10}>
          <Heading as="h2" size="xl" mb={4}>
            ¿Eres un cliente?
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={6}>
            Descarga nuestra aplicación para clientes
          </Text>
          <Button
            colorScheme="green"
            size="lg"
            onClick={() => window.location.href = 'https://splitandgo.com/clientes'}
          >
            Ir a Split&Go Clientes
          </Button>
        </Box>
      </VStack>
    </Container>
  )
} 