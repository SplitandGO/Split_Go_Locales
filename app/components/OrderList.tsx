'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'
import { Order, OrderItem, Product } from '@/lib/supabase'

interface OrderWithItems extends Order {
  items: (OrderItem & {
    products: Product
  })[]
}

export default function OrderList() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
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

  const handleOrderClick = (order: OrderWithItems) => {
    setSelectedOrder(order)
    onOpen()
  }

  const handleStatusChange = async (newStatus: 'pendiente' | 'preparando' | 'listo' | 'entregado') => {
    if (!selectedOrder) return

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', selectedOrder.id)

      if (error) throw error

      await fetchOrders()
      onClose()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'yellow'
      case 'preparando':
        return 'blue'
      case 'listo':
        return 'green'
      case 'entregado':
        return 'gray'
      default:
        return 'gray'
    }
  }

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Mesa</Th>
              <Th>Estado</Th>
              <Th>Total</Th>
              <Th>Fecha</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order) => (
              <Tr
                key={order.id}
                cursor="pointer"
                onClick={() => handleOrderClick(order)}
                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              >
                <Td>Mesa {order.table_id}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </Td>
                <Td>${calculateTotal(order.items).toFixed(2)}</Td>
                <Td>
                  {new Date(order.created_at).toLocaleString('es-ES', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </Td>
                <Td>
                  <Button size="sm" colorScheme="blue">
                    Ver Detalles
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Pedido - Mesa {selectedOrder?.table_id}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Estado Actual:
                  </Text>
                  <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)}
                  </Badge>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Productos:
                  </Text>
                  {selectedOrder.items.map((item) => (
                    <Box
                      key={item.id}
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                      mb={2}
                    >
                      <Text>
                        {item.quantity}x {item.products.name}
                      </Text>
                      <Text color="gray.600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </Box>
                  ))}
                </Box>

                <Box>
                  <Text fontWeight="bold">
                    Total: ${calculateTotal(selectedOrder.items).toFixed(2)}
                  </Text>
                </Box>

                <VStack spacing={2}>
                  <Button
                    colorScheme="yellow"
                    width="100%"
                    onClick={() => handleStatusChange('pendiente')}
                    isDisabled={selectedOrder.status === 'pendiente'}
                  >
                    Marcar como Pendiente
                  </Button>
                  <Button
                    colorScheme="blue"
                    width="100%"
                    onClick={() => handleStatusChange('preparando')}
                    isDisabled={selectedOrder.status === 'preparando'}
                  >
                    Marcar como Preparando
                  </Button>
                  <Button
                    colorScheme="green"
                    width="100%"
                    onClick={() => handleStatusChange('listo')}
                    isDisabled={selectedOrder.status === 'listo'}
                  >
                    Marcar como Listo
                  </Button>
                  <Button
                    colorScheme="gray"
                    width="100%"
                    onClick={() => handleStatusChange('entregado')}
                    isDisabled={selectedOrder.status === 'entregado'}
                  >
                    Marcar como Entregado
                  </Button>
                </VStack>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
} 