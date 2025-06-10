'use client'

import { useState, useEffect } from 'react'
import {
  SimpleGrid,
  Box,
  Text,
  Badge,
  useColorModeValue,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'
import { Table } from '@/lib/supabase'

export default function TableGrid() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [tableNumber, setTableNumber] = useState('')
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('number')

      if (error) throw error

      setTables(data || [])
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

  const handleTableClick = (table: Table) => {
    setSelectedTable(table)
    onOpen()
  }

  const handleStatusChange = async (newStatus: 'libre' | 'ocupada' | 'reservada') => {
    if (!selectedTable) return

    try {
      const { error } = await supabase
        .from('tables')
        .update({ status: newStatus })
        .eq('id', selectedTable.id)

      if (error) throw error

      await fetchTables()
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

  const handleAddTable = async () => {
    if (!tableNumber) return

    try {
      const { error } = await supabase.from('tables').insert([
        {
          number: parseInt(tableNumber),
          status: 'libre',
        },
      ])

      if (error) throw error

      await fetchTables()
      setTableNumber('')
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
      case 'libre':
        return 'green'
      case 'ocupada':
        return 'red'
      case 'reservada':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  return (
    <>
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
        {tables.map((table) => (
          <Box
            key={table.id}
            p={6}
            bg={bgColor}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            cursor="pointer"
            onClick={() => handleTableClick(table)}
            _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
            transition="all 0.3s"
          >
            <Text fontSize="2xl" fontWeight="bold" mb={2}>
              Mesa {table.number}
            </Text>
            <Badge colorScheme={getStatusColor(table.status)}>
              {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
            </Badge>
          </Box>
        ))}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedTable ? `Mesa ${selectedTable.number}` : 'Nueva Mesa'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTable ? (
              <VStack spacing={4}>
                <Button
                  colorScheme="green"
                  width="100%"
                  onClick={() => handleStatusChange('libre')}
                  isDisabled={selectedTable.status === 'libre'}
                >
                  Marcar como Libre
                </Button>
                <Button
                  colorScheme="red"
                  width="100%"
                  onClick={() => handleStatusChange('ocupada')}
                  isDisabled={selectedTable.status === 'ocupada'}
                >
                  Marcar como Ocupada
                </Button>
                <Button
                  colorScheme="yellow"
                  width="100%"
                  onClick={() => handleStatusChange('reservada')}
                  isDisabled={selectedTable.status === 'reservada'}
                >
                  Marcar como Reservada
                </Button>
              </VStack>
            ) : (
              <FormControl>
                <FormLabel>Número de Mesa</FormLabel>
                <Input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Ingrese el número de mesa"
                />
              </FormControl>
            )}
          </ModalBody>

          <ModalFooter>
            {!selectedTable && (
              <Button colorScheme="blue" mr={3} onClick={handleAddTable}>
                Agregar Mesa
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
} 