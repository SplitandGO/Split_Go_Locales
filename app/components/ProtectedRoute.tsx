'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/supabase'
import { Box, Spinner, Center } from '@chakra-ui/react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'superadmin'
}

export default function ProtectedRoute({
  children,
  requiredRole
}: ProtectedRouteProps) {
  const router = useRouter()
  const { supabase, user, loading } = useSupabase()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      if (requiredRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (!profile || profile.role !== requiredRole) {
          router.push('/unauthorized')
          return
        }
      }
    }

    if (!loading) {
      checkAuth()
    }
  }, [loading, requiredRole, router, supabase])

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Center>
    )
  }

  return <Box>{children}</Box>
} 