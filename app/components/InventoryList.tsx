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
  IconButton
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { useSupabase } from '@/lib/supabase'
import { useState } from 'react'

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  min_quantity: number
  supplier?: string
  last_restock?: string
  price: number
}

interface InventoryListProps {
  items: InventoryItem[]
  onItemAdd?: (item: Omit<InventoryItem, 'id'>) => void
  onItemEdit?: (item: InventoryItem) => void
  onItemDelete?: (item: InventoryItem) => void
}

export default function InventoryList({
  items,
  onItemAdd,
  onItemEdit,
  onItemDelete
}: InventoryListProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { supabase } = useSupabase()
  const toast = useToast()

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    min_quantity: 0,
    supplier: '',
    price: 0
  })

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item)
    setFormData(item)
    setIsEditing(true)
    onOpen()
  }

  const handleAddClick = () => {
    setSelectedItem(null)
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      min_quantity: 0,
      supplier: '',
      price: 0
    })
    setIsEditing(false)
    onOpen()
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
      [name]: parseFloat(value)
    }))
  }

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedItem) {
        const { error } = await supabase
          .from('inventory')
          .update(formData)
          .eq('id', selectedItem.id)

        if (error) throw error

        toast({
          title: 'Item actualizado',
          description: 'El item ha sido actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })

        if (onItemEdit) {
          onItemEdit({ ...selectedItem, ...formData })
        }
      } else {
        const { error } = await supabase.from('inventory').insert([formData])

        if (error) throw error

        toast({
          title: 'Item agregado',
          description: 'El item ha sido agregado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })

        if (onItemAdd) {
          onItemAdd(formData as Omit<InventoryItem, 'id'>)
        }
      }

      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el item',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleDelete = async (item: InventoryItem) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', item.id)

      if (error) throw error

      toast({
        title: 'Item eliminado',
        description: 'El item ha sido eliminado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      if (onItemDelete) {
        onItemDelete(item)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el item',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const getStockStatus = (quantity: number, min_quantity: number) => {
    if (quantity <= 0) return { color: 'red', text: 'Sin stock' }
    if (quantity <= min_quantity) return { color: 'yellow', text: 'Stock bajo' }
    return { color: 'green', text: 'Stock OK' }
  }

  return (
    <>
      <VStack spacing={4} align="stretch">
        {items.map((item) => {
          const stockStatus = getStockStatus(item.quantity, item.min_quantity)
          return (
            <Box
              key={item.id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              _hover={{ shadow: 'md' }}
            >
              <HStack justify="space-between" mb={2}>
                <Text fontSize="lg" fontWeight="bold">
                  {item.name}
                </Text>
                <Badge colorScheme={stockStatus.color}>
                  {stockStatus.text}
                </Badge>
              </HStack>
              <Text>Categoría: {item.category}</Text>
              <Text>
                Cantidad: {item.quantity} {item.unit}
              </Text>
              <Text>Mínimo: {item.min_quantity} {item.unit}</Text>
              {item.supplier && <Text>Proveedor: {item.supplier}</Text>}
              <Text>Precio: ${item.price.toFixed(2)}</Text>
              <HStack mt={2} justify="flex-end" spacing={2}>
                <IconButton
                  aria-label="Editar item"
                  icon={<EditIcon />}
                  size="sm"
                  onClick={() => handleItemClick(item)}
                />
                <IconButton
                  aria-label="Eliminar item"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(item)}
                />
              </HStack>
            </Box>
          )
        })}
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          cursor="pointer"
          onClick={handleAddClick}
          _hover={{ shadow: 'md' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          minHeight="150px"
        >
          <VStack spacing={2}>
            <AddIcon boxSize={6} />
            <Text>Agregar Item</Text>
          </VStack>
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Editar Item' : 'Agregar Item'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Categoría</FormLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="alimentos">Alimentos</option>
                  <option value="utensilios">Utensilios</option>
                  <option value="limpieza">Limpieza</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Cantidad</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.quantity}
                  onChange={(value) => handleNumberChange('quantity', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Unidad</FormLabel>
                <Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar unidad</option>
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kilogramo</option>
                  <option value="l">Litro</option>
                  <option value="g">Gramo</option>
                  <option value="ml">Mililitro</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Cantidad Mínima</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.min_quantity}
                  onChange={(value) => handleNumberChange('min_quantity', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Proveedor</FormLabel>
                <Input
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Precio</FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  value={formData.price}
                  onChange={(value) => handleNumberChange('price', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Button colorScheme="blue" width="100%" onClick={handleSubmit}>
                {isEditing ? 'Actualizar' : 'Agregar'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
} 