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
    price: number
  }
}

interface Order {
  id: string
  table_id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  items: OrderItem[]
  total: number
  created_at: string
  updated_at: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  special_requests?: string
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_method?: 'cash' | 'card' | 'transfer'
}

interface OrdersProps {
  restaurantId: string
}

export default function Orders({ restaurantId }: OrdersProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { supabase } = useSupabase()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [formData, setFormData] = useState<Partial<Order>>({})
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'>('all')
  const [dateFilter, setDateFilter] = useState('')

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
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      if (dateFilter) {
        query = query.eq('created_at', dateFilter)
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

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
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

  const handlePaymentStatusChange = async (orderId: string, newStatus: Order['payment_status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: 'Estado de pago actualizado',
        description: 'El estado de pago ha sido actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      fetchOrders()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de pago',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'yellow'
      case 'confirmed':
        return 'blue'
      case 'preparing':
        return 'orange'
      case 'ready':
        return 'green'
      case 'delivered':
        return 'purple'
      case 'cancelled':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'confirmed':
        return 'Confirmado'
      case 'preparing':
        return 'Preparando'
      case 'ready':
        return 'Listo'
      case 'delivered':
        return 'Entregado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getPaymentStatusColor = (status: Order['payment_status']) => {
    switch (status) {
      case 'pending':
        return 'yellow'
      case 'paid':
        return 'green'
      case 'refunded':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getPaymentStatusText = (status: Order['payment_status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'paid':
        return 'Pagado'
      case 'refunded':
        return 'Reembolsado'
      default:
        return status
    }
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Pedidos
          </Text>
          <HStack>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmados</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Listos</option>
              <option value="delivered">Entregados</option>
              <option value="cancelled">Cancelados</option>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <Button onClick={fetchOrders}>Filtrar</Button>
          </HStack>
        </HStack>

        <VStack spacing={4} align="stretch">
          {orders.map((order) => (
            <Box
              key={order.id}
              p={4}
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              shadow="sm"
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Text fontSize="lg" fontWeight="bold">
                      Pedido #{order.id.slice(-6)}
                    </Text>
                    <Badge colorScheme={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                    <Badge colorScheme={getPaymentStatusColor(order.payment_status)}>
                      {getPaymentStatusText(order.payment_status)}
                    </Badge>
                  </HStack>
                  <Text>
                    Mesa: {order.table_id}
                  </Text>
                  <Text>
                    Fecha: {new Date(order.created_at).toLocaleString()}
                  </Text>
                  <Text>
                    Total: {order.total.toFixed(2)} €
                  </Text>
                  {order.customer_name && (
                    <Text>Cliente: {order.customer_name}</Text>
                  )}
                  {order.special_requests && (
                    <Text>Notas: {order.special_requests}</Text>
                  )}
                  <VStack align="start" mt={2}>
                    {order.items.map((item) => (
                      <HStack key={item.id}>
                        <Text>
                          {item.quantity}x {item.menu_item.name}
                        </Text>
                        {item.notes && (
                          <Text color="gray.500">({item.notes})</Text>
                        )}
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
                <VStack>
                  {order.status === 'pending' && (
                    <>
                      <IconButton
                        aria-label="Confirmar pedido"
                        icon={<CheckIcon />}
                        colorScheme="green"
                        onClick={() => handleStatusChange(order.id, 'confirmed')}
                      />
                      <IconButton
                        aria-label="Cancelar pedido"
                        icon={<CloseIcon />}
                        colorScheme="red"
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                      />
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <IconButton
                      aria-label="Marcar como preparando"
                      icon={<CheckIcon />}
                      colorScheme="orange"
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                    />
                  )}
                  {order.status === 'preparing' && (
                    <IconButton
                      aria-label="Marcar como listo"
                      icon={<CheckIcon />}
                      colorScheme="green"
                      onClick={() => handleStatusChange(order.id, 'ready')}
                    />
                  )}
                  {order.status === 'ready' && (
                    <IconButton
                      aria-label="Marcar como entregado"
                      icon={<CheckIcon />}
                      colorScheme="purple"
                      onClick={() => handleStatusChange(order.id, 'delivered')}
                    />
                  )}
                  {order.payment_status === 'pending' && (
                    <IconButton
                      aria-label="Marcar como pagado"
                      icon={<CheckIcon />}
                      colorScheme="green"
                      onClick={() => handlePaymentStatusChange(order.id, 'paid')}
                    />
                  )}
                  <IconButton
                    aria-label="Editar pedido"
                    icon={<EditIcon />}
                    onClick={() => {
                      setSelectedOrder(order)
                      setFormData(order)
                      onOpen()
                    }}
                  />
                </VStack>
              </HStack>
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

              <FormControl isRequired>
                <FormLabel>Estado de Pago</FormLabel>
                <Select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                  <option value="refunded">Reembolsado</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Método de Pago</FormLabel>
                <Select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
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