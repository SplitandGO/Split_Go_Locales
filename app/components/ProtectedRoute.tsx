'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/firebase'
import { Box, Spinner, Center } from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const { data: { role } } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.uid)
            .single()
          
          setUserRole(role)
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      }
    }

    fetchUserRole()
  }, [user])

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!user) {
    return null
  }

  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    router.push('/')
    return null
  }

  return <Box>{children}</Box>
} 