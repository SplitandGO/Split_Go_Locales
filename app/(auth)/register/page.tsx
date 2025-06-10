'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Select,
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'mesero' | 'cocina' | 'admin'>('mesero')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              role,
            },
          ])

        if (profileError) throw profileError

        toast({
          title: 'Registro exitoso',
          description: 'Por favor verifica tu email para continuar',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        router.push('/login')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading>Registro</Heading>
          <Text mt={2} color="gray.600">
            Crea tu cuenta en Split&Go
          </Text>
        </Box>

        <Box w="100%" p={8} borderWidth={1} borderRadius="lg">
          <form onSubmit={handleRegister}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Rol</FormLabel>
                <Select value={role} onChange={(e) => setRole(e.target.value as any)}>
                  <option value="mesero">Mesero</option>
                  <option value="cocina">Cocina</option>
                  <option value="admin">Administrador</option>
                </Select>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={loading}
              >
                Registrarse
              </Button>

              <Text>
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" style={{ color: 'blue' }}>
                  Inicia sesión
                </Link>
              </Text>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  )
} 