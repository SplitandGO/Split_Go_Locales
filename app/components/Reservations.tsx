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

interface Reservation {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  date: string
  time: string
  party_size: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  special_requests?: string
  table_id?: string
  created_at: string
}

interface ReservationsProps {
  restaurantId: string
}

export default function Reservations({ restaurantId }: ReservationsProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { supabase } = useSupabase()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [formData, setFormData] = useState<Partial<Reservation>>({})
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchReservations()
    subscribeToReservations()
  }, [restaurantId])

  const fetchReservations = async () => {
    try {
      let query = supabase
        .from('reservations')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      if (dateFilter) {
        query = query.eq('date', dateFilter)
      }

      const { data, error } = await query

      if (error) throw error

      setReservations(data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reservas',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const subscribeToReservations = () => {
    const channel = supabase
      .channel('reservations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        () => {
          fetchReservations()
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
      if (selectedReservation) {
        const { error } = await supabase
          .from('reservations')
          .update(formData)
          .eq('id', selectedReservation.id)

        if (error) throw error

        toast({
          title: 'Reserva actualizada',
          description: 'La reserva ha sido actualizada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      }

      fetchReservations()
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la reserva',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleStatusChange = async (reservationId: string, newStatus: Reservation['status']) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservationId)

      if (error) throw error

      toast({
        title: 'Estado actualizado',
        description: 'El estado de la reserva ha sido actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      fetchReservations()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la reserva',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return 'yellow'
      case 'confirmed':
        return 'green'
      case 'cancelled':
        return 'red'
      case 'completed':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getStatusText = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'confirmed':
        return 'Confirmada'
      case 'cancelled':
        return 'Cancelada'
      case 'completed':
        return 'Completada'
      default:
        return status
    }
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Reservas
          </Text>
          <HStack>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="completed">Completadas</option>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <Button onClick={fetchReservations}>Filtrar</Button>
          </HStack>
        </HStack>

        <VStack spacing={4} align="stretch">
          {reservations.map((reservation) => (
            <Box
              key={reservation.id}
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
                      {reservation.customer_name}
                    </Text>
                    <Badge colorScheme={getStatusColor(reservation.status)}>
                      {getStatusText(reservation.status)}
                    </Badge>
                  </HStack>
                  <Text>
                    {new Date(reservation.date).toLocaleDateString()} a las{' '}
                    {reservation.time}
                  </Text>
                  <Text>Personas: {reservation.party_size}</Text>
                  <Text>Teléfono: {reservation.customer_phone}</Text>
                  <Text>Email: {reservation.customer_email}</Text>
                  {reservation.special_requests && (
                    <Text>Notas: {reservation.special_requests}</Text>
                  )}
                </VStack>
                <VStack>
                  {reservation.status === 'pending' && (
                    <>
                      <IconButton
                        aria-label="Confirmar reserva"
                        icon={<CheckIcon />}
                        colorScheme="green"
                        onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                      />
                      <IconButton
                        aria-label="Cancelar reserva"
                        icon={<CloseIcon />}
                        colorScheme="red"
                        onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                      />
                    </>
                  )}
                  {reservation.status === 'confirmed' && (
                    <IconButton
                      aria-label="Marcar como completada"
                      icon={<CheckIcon />}
                      colorScheme="blue"
                      onClick={() => handleStatusChange(reservation.id, 'completed')}
                    />
                  )}
                  <IconButton
                    aria-label="Editar reserva"
                    icon={<EditIcon />}
                    onClick={() => {
                      setSelectedReservation(reservation)
                      setFormData(reservation)
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
          <ModalHeader>Editar Reserva</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre del Cliente</FormLabel>
                <Input
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Teléfono</FormLabel>
                <Input
                  name="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Fecha</FormLabel>
                <Input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Hora</FormLabel>
                <Input
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Número de Personas</FormLabel>
                <Input
                  name="party_size"
                  type="number"
                  value={formData.party_size}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notas Especiales</FormLabel>
                <Input
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Estado</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="completed">Completada</option>
                </Select>
              </FormControl>

              <Button colorScheme="blue" width="100%" onClick={handleSubmit}>
                Actualizar Reserva
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
} 