'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Badge,
  useToast,
  useColorModeValue
} from '@chakra-ui/react'
import { BellIcon, CheckIcon, DeleteIcon } from '@chakra-ui/icons'
import { useSupabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
  data?: Record<string, any>
}

interface NotificationsProps {
  userId: string
}

export default function Notifications({ userId }: NotificationsProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { supabase } = useSupabase()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    subscribeToNotifications()
  }, [userId])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read).length || 0)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las notificaciones',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo marcar la notificación como leída',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      )
      setUnreadCount((prev) =>
        notifications.find((n) => n.id === notificationId)?.read
          ? prev
          : Math.max(0, prev - 1)
      )
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la notificación',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron marcar todas las notificaciones como leídas',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'green'
      case 'warning':
        return 'orange'
      case 'error':
        return 'red'
      default:
        return 'blue'
    }
  }

  return (
    <>
      <IconButton
        aria-label="Notificaciones"
        icon={
          <Box position="relative">
            <BellIcon />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="-2"
                right="-2"
                colorScheme="red"
                borderRadius="full"
                minW="20px"
                textAlign="center"
              >
                {unreadCount}
              </Badge>
            )}
          </Box>
        }
        onClick={onOpen}
        variant="ghost"
      />

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack justify="space-between">
              <Text>Notificaciones</Text>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  leftIcon={<CheckIcon />}
                  onClick={markAllAsRead}
                >
                  Marcar todas como leídas
                </Button>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {notifications.length === 0 ? (
                <Text textAlign="center" color="gray.500">
                  No hay notificaciones
                </Text>
              ) : (
                notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    p={4}
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    position="relative"
                  >
                    <HStack justify="space-between">
                      <Badge colorScheme={getNotificationColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <HStack>
                        {!notification.read && (
                          <IconButton
                            aria-label="Marcar como leída"
                            icon={<CheckIcon />}
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          />
                        )}
                        <IconButton
                          aria-label="Eliminar notificación"
                          icon={<DeleteIcon />}
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        />
                      </HStack>
                    </HStack>
                    <Text fontWeight="bold" mt={2}>
                      {notification.title}
                    </Text>
                    <Text mt={1}>{notification.message}</Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      {new Date(notification.created_at).toLocaleString()}
                    </Text>
                  </Box>
                ))
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
} 