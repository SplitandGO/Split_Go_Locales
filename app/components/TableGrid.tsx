'use client'

import { useState } from 'react'
import {
  Grid,
  GridItem,
  Box,
  Text,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  IconButton,
  useToast
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { useSupabase } from '@/lib/supabase'

interface Table {
  id: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  current_order?: string
}

interface TableGridProps {
  tables: Table[]
  onTableClick?: (table: Table) => void
  onAddTable?: () => void
  onEditTable?: (table: Table) => void
  onDeleteTable?: (table: Table) => void
}

export default function TableGrid({
  tables,
  onTableClick,
  onAddTable,
  onEditTable,
  onDeleteTable
}: TableGridProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const { supabase } = useSupabase()
  const toast = useToast()

  const handleTableClick = (table: Table) => {
    setSelectedTable(table)
    onOpen()
    if (onTableClick) {
      onTableClick(table)
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
        return 'Desconocido'
    }
  }

  const handleDeleteTable = async (table: Table) => {
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', table.id)

      if (error) throw error

      toast({
        title: 'Mesa eliminada',
        description: 'La mesa ha sido eliminada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      if (onDeleteTable) {
        onDeleteTable(table)
      }
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

  return (
    <>
      <Grid
        templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
        gap={6}
        p={4}
      >
        {tables.map((table) => (
          <GridItem key={table.id}>
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              cursor="pointer"
              onClick={() => handleTableClick(table)}
              _hover={{ shadow: 'md' }}
            >
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontSize="xl" fontWeight="bold">
                    Mesa {table.number}
                  </Text>
                  <Badge colorScheme={getStatusColor(table.status)}>
                    {getStatusText(table.status)}
                  </Badge>
                </HStack>
                <Text>Capacidad: {table.capacity} personas</Text>
                {table.current_order && (
                  <Text fontSize="sm" color="gray.500">
                    Pedido actual: #{table.current_order}
                  </Text>
                )}
                <HStack justify="flex-end" spacing={2}>
                  <IconButton
                    aria-label="Editar mesa"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onEditTable) onEditTable(table)
                    }}
                  />
                  <IconButton
                    aria-label="Eliminar mesa"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTable(table)
                    }}
                  />
                </HStack>
              </VStack>
            </Box>
          </GridItem>
        ))}
        <GridItem>
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            cursor="pointer"
            onClick={onAddTable}
            _hover={{ shadow: 'md' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            minHeight="150px"
          >
            <VStack spacing={2}>
              <AddIcon boxSize={6} />
              <Text>Agregar Mesa</Text>
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Mesa {selectedTable?.number}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedTable && (
              <VStack spacing={4} align="stretch">
                <Text>
                  <strong>Estado:</strong>{' '}
                  {getStatusText(selectedTable.status)}
                </Text>
                <Text>
                  <strong>Capacidad:</strong>{' '}
                  {selectedTable.capacity} personas
                </Text>
                {selectedTable.current_order && (
                  <Text>
                    <strong>Pedido actual:</strong>{' '}
                    #{selectedTable.current_order}
                  </Text>
                )}
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    onClose()
                    if (onTableClick) onTableClick(selectedTable)
                  }}
                >
                  Ver Detalles
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
} 