'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Badge,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react'
import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons'
import { useSupabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

interface OrderItem {
  id: string
  menu_item_id: string
  quantity: number
  notes?: string
  status: 'pending' | 'preparing' | 'ready' | 'delivered'
  menu_item: {
    name: string
    category: string
  }
}

interface Order {
  id: string
  table_id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  items: OrderItem[]
  created_at: string
  updated_at: string
  special_requests?: string
}

interface KitchenProps {
  restaurantId: string
}

export default function Kitchen({ restaurantId }: KitchenProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { supabase } = useSupabase()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [formData, setFormData] = useState<Partial<Order>>({})
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
    subscribeToOrders()
  }, [restaurantId])

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setOrders(data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const subscribeToOrders = () => {
    const channel = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      if (selectedOrder) {
        const { error } = await supabase
          .from('orders')
          .update(formData)
          .eq('id', selectedOrder.id)

        if (error) throw error

        toast({
          title: 'Pedido actualizado',
          description: 'El pedido ha sido actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      }

      fetchOrders()
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el pedido',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleItemStatusChange = async (orderId: string, itemId: string, newStatus: OrderItem['status']) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: newStatus })
        .eq('id', itemId)

      if (error) throw error

      toast({
        title: 'Estado actualizado',
        description: 'El estado del elemento ha sido actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      fetchOrders()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del elemento',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleOrderStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: 'Estado actualizado',
        description: 'El estado del pedido ha sido actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      fetchOrders()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const getStatusColor = (status: OrderItem['status']) => {
    switch (status) {
      case 'pending':
        return 'yellow'
      case 'preparing':
        return 'orange'
      case 'ready':
        return 'green'
      case 'delivered':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getStatusText = (status: OrderItem['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'preparing':
        return 'Preparando'
      case 'ready':
        return 'Listo'
      case 'delivered':
        return 'Entregado'
      default:
        return status
    }
  }

  const getCategories = () => {
    const categories = new Set<string>()
    orders.forEach((order) => {
      order.items.forEach((item) => {
        categories.add(item.menu_item.category)
      })
    })
    return Array.from(categories)
  }

  const filteredOrders = orders.filter((order) => {
    if (categoryFilter === 'all') return true
    return order.items.some((item) => item.menu_item.category === categoryFilter)
  })

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Cocina
          </Text>
          <HStack>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Listos</option>
            </Select>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {getCategories().map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <Button onClick={fetchOrders}>Actualizar</Button>
          </HStack>
        </HStack>

        <VStack spacing={4} align="stretch">
          {filteredOrders.map((order) => (
            <Box
              key={order.id}
              p={4}
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              shadow="sm"
            >
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" width="100%">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="bold">
                      Pedido #{order.id.slice(-6)} - Mesa {order.table_id}
                    </Text>
                    <Text>
                      Fecha: {new Date(order.created_at).toLocaleString()}
                    </Text>
                    {order.special_requests && (
                      <Text color="red.500">
                        Notas: {order.special_requests}
                      </Text>
                    )}
                  </VStack>
                  <IconButton
                    aria-label="Editar pedido"
                    icon={<EditIcon />}
                    onClick={() => {
                      setSelectedOrder(order)
                      setFormData(order)
                      onOpen()
                    }}
                  />
                </HStack>

                <VStack align="start" spacing={2} width="100%">
                  {order.items.map((item) => (
                    <Box
                      key={item.id}
                      p={2}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="md"
                      width="100%"
                    >
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Text fontWeight="bold">
                              {item.quantity}x {item.menu_item.name}
                            </Text>
                            <Badge colorScheme={getStatusColor(item.status)}>
                              {getStatusText(item.status)}
                            </Badge>
                          </HStack>
                          {item.notes && (
                            <Text color="gray.500">{item.notes}</Text>
                          )}
                        </VStack>
                        <HStack>
                          {item.status === 'pending' && (
                            <IconButton
                              aria-label="Marcar como preparando"
                              icon={<CheckIcon />}
                              colorScheme="orange"
                              size="sm"
                              onClick={() => handleItemStatusChange(order.id, item.id, 'preparing')}
                            />
                          )}
                          {item.status === 'preparing' && (
                            <IconButton
                              aria-label="Marcar como listo"
                              icon={<CheckIcon />}
                              colorScheme="green"
                              size="sm"
                              onClick={() => handleItemStatusChange(order.id, item.id, 'ready')}
                            />
                          )}
                          {item.status === 'ready' && (
                            <IconButton
                              aria-label="Marcar como entregado"
                              icon={<CheckIcon />}
                              colorScheme="blue"
                              size="sm"
                              onClick={() => handleItemStatusChange(order.id, item.id, 'delivered')}
                            />
                          )}
                        </HStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>

                {order.items.every((item) => item.status === 'delivered') && (
                  <Button
                    colorScheme="green"
                    width="100%"
                    onClick={() => handleOrderStatusChange(order.id, 'delivered')}
                  >
                    Marcar Pedido como Entregado
                  </Button>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Pedido</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Estado</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="preparing">Preparando</option>
                  <option value="ready">Listo</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Notas Especiales</FormLabel>
                <Input
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleInputChange}
                />
              </FormControl>

              <Button colorScheme="blue" width="100%" onClick={handleSubmit}>
                Actualizar Pedido
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
} 