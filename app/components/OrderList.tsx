'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast
} from '@chakra-ui/react'
import { CheckIcon, CloseIcon, TimeIcon } from '@chakra-ui/icons'
import { useSupabase } from '@/lib/supabase'
import { useState } from 'react'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  notes?: string
}

interface Order {
  id: string
  table_number: number
  items: OrderItem[]
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  created_at: string
  total: number
}

interface OrderListProps {
  orders: Order[]
  onOrderStatusChange?: (orderId: string, newStatus: Order['status']) => void
}

export default function OrderList({ orders, onOrderStatusChange }: OrderListProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { supabase } = useSupabase()
  const toast = useToast()

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    onOpen()
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'yellow'
      case 'preparing':
        return 'blue'
      case 'ready':
        return 'green'
      case 'delivered':
        return 'gray'
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
      case 'preparing':
        return 'Preparando'
      case 'ready':
        return 'Listo'
      case 'delivered':
        return 'Entregado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Desconocido'
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

      if (onOrderStatusChange) {
        onOrderStatusChange(orderId, newStatus)
      }
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

  return (
    <>
      <VStack spacing={4} align="stretch">
        {orders.map((order) => (
          <Box
            key={order.id}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            cursor="pointer"
            onClick={() => handleOrderClick(order)}
            _hover={{ shadow: 'md' }}
          >
            <HStack justify="space-between" mb={2}>
              <Text fontSize="lg" fontWeight="bold">
                Pedido #{order.id.slice(0, 8)}
              </Text>
              <Badge colorScheme={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </HStack>
            <Text>Mesa: {order.table_number}</Text>
            <Text>Total: ${order.total.toFixed(2)}</Text>
            <Text fontSize="sm" color="gray.500">
              {new Date(order.created_at).toLocaleString()}
            </Text>
            <HStack mt={2} spacing={2}>
              {order.status === 'pending' && (
                <>
                  <IconButton
                    aria-label="Preparar pedido"
                    icon={<TimeIcon />}
                    size="sm"
                    colorScheme="blue"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusChange(order.id, 'preparing')
                    }}
                  />
                  <IconButton
                    aria-label="Cancelar pedido"
                    icon={<CloseIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusChange(order.id, 'cancelled')
                    }}
                  />
                </>
              )}
              {order.status === 'preparing' && (
                <IconButton
                  aria-label="Marcar como listo"
                  icon={<CheckIcon />}
                  size="sm"
                  colorScheme="green"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange(order.id, 'ready')
                  }}
                />
              )}
            </HStack>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Pedido #{selectedOrder?.id.slice(0, 8)}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedOrder && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text>
                    <strong>Mesa:</strong> {selectedOrder.table_number}
                  </Text>
                  <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </HStack>
                <Text>
                  <strong>Fecha:</strong>{' '}
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </Text>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Item</Th>
                      <Th isNumeric>Cantidad</Th>
                      <Th isNumeric>Precio</Th>
                      <Th isNumeric>Subtotal</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {selectedOrder.items.map((item) => (
                      <Tr key={item.id}>
                        <Td>
                          {item.name}
                          {item.notes && (
                            <Text fontSize="sm" color="gray.500">
                              Notas: {item.notes}
                            </Text>
                          )}
                        </Td>
                        <Td isNumeric>{item.quantity}</Td>
                        <Td isNumeric>${item.price.toFixed(2)}</Td>
                        <Td isNumeric>
                          ${(item.quantity * item.price).toFixed(2)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Text fontSize="lg" fontWeight="bold" textAlign="right">
                  Total: ${selectedOrder.total.toFixed(2)}
                </Text>
                {selectedOrder.status === 'pending' && (
                  <HStack justify="flex-end" spacing={2}>
                    <Button
                      leftIcon={<TimeIcon />}
                      colorScheme="blue"
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, 'preparing')
                        onClose()
                      }}
                    >
                      Preparar
                    </Button>
                    <Button
                      leftIcon={<CloseIcon />}
                      colorScheme="red"
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, 'cancelled')
                        onClose()
                      }}
                    >
                      Cancelar
                    </Button>
                  </HStack>
                )}
                {selectedOrder.status === 'preparing' && (
                  <Button
                    leftIcon={<CheckIcon />}
                    colorScheme="green"
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, 'ready')
                      onClose()
                    }}
                  >
                    Marcar como Listo
                  </Button>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
} 