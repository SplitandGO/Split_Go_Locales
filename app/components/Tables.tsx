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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  useToast,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { useSupabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

interface Table {
  id: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  location: 'indoor' | 'outdoor' | 'bar'
  current_order_id?: string
  current_reservation_id?: string
}

interface TablesProps {
  restaurantId: string
}

export default function Tables({ restaurantId }: TablesProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { supabase } = useSupabase()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState<Partial<Table>>({})

  useEffect(() => {
    fetchTables()
    subscribeToTables()
  }, [restaurantId])

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('number', { ascending: true })

      if (error) throw error

      setTables(data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las mesas',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const subscribeToTables = () => {
    const channel = supabase
      .channel('tables')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        () => {
          fetchTables()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNumberChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value)
    }))
  }

  const handleSubmit = async () => {
    try {
      if (selectedTable) {
        const { error } = await supabase
          .from('tables')
          .update(formData)
          .eq('id', selectedTable.id)

        if (error) throw error

        toast({
          title: 'Mesa actualizada',
          description: 'La mesa ha sido actualizada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      } else {
        const { error } = await supabase
          .from('tables')
          .insert([{ ...formData, restaurant_id: restaurantId }])

        if (error) throw error

        toast({
          title: 'Mesa creada',
          description: 'La mesa ha sido creada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      }

      fetchTables()
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la mesa',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleDelete = async (tableId: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId)

      if (error) throw error

      setTables((prev) => prev.filter((table) => table.id !== tableId))

      toast({
        title: 'Mesa eliminada',
        description: 'La mesa ha sido eliminada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la mesa',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'green'
      case 'occupied':
        return 'red'
      case 'reserved':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'Disponible'
      case 'occupied':
        return 'Ocupada'
      case 'reserved':
        return 'Reservada'
      default:
        return status
    }
  }

  const getLocationText = (location: Table['location']) => {
    switch (location) {
      case 'indoor':
        return 'Interior'
      case 'outdoor':
        return 'Terraza'
      case 'bar':
        return 'Barra'
      default:
        return location
    }
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Mesas
          </Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => {
              setSelectedTable(null)
              setFormData({})
              onOpen()
            }}
          >
            Añadir Mesa
          </Button>
        </HStack>

        <VStack spacing={4} align="stretch">
          {tables.map((table) => (
            <Box
              key={table.id}
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
                      Mesa {table.number}
                    </Text>
                    <Badge colorScheme={getStatusColor(table.status)}>
                      {getStatusText(table.status)}
                    </Badge>
                  </HStack>
                  <Text>Capacidad: {table.capacity} personas</Text>
                  <Text>Ubicación: {getLocationText(table.location)}</Text>
                </VStack>
                <HStack>
                  <IconButton
                    aria-label="Editar mesa"
                    icon={<EditIcon />}
                    onClick={() => {
                      setSelectedTable(table)
                      setFormData(table)
                      onOpen()
                    }}
                  />
                  <IconButton
                    aria-label="Eliminar mesa"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleDelete(table.id)}
                  />
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedTable ? 'Editar Mesa' : 'Nueva Mesa'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Número de Mesa</FormLabel>
                <NumberInput
                  value={formData.number}
                  onChange={(value) => handleNumberChange('number', value)}
                  min={1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Capacidad</FormLabel>
                <NumberInput
                  value={formData.capacity}
                  onChange={(value) => handleNumberChange('capacity', value)}
                  min={1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Ubicación</FormLabel>
                <Select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                >
                  <option value="indoor">Interior</option>
                  <option value="outdoor">Terraza</option>
                  <option value="bar">Barra</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Estado</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="available">Disponible</option>
                  <option value="occupied">Ocupada</option>
                  <option value="reserved">Reservada</option>
                </Select>
              </FormControl>

              <Button colorScheme="blue" width="100%" onClick={handleSubmit}>
                {selectedTable ? 'Actualizar' : 'Crear'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
} 