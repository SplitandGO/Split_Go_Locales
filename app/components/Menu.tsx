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
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Image,
  useToast,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { useSupabase } from '@/lib/supabase'
import { useState } from 'react'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  available: boolean
  allergens?: string[]
  nutritional_info?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

interface MenuProps {
  restaurantId: string
}

export default function Menu({ restaurantId }: MenuProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { supabase } = useSupabase()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState<Partial<MenuItem>>({})
  const [isUploading, setIsUploading] = useState(false)

  const categories = [
    'Entrantes',
    'Platos Principales',
    'Postres',
    'Bebidas',
    'Especialidades'
  ]

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('category', { ascending: true })

      if (error) throw error

      setMenuItems(data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los elementos del menú',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${restaurantId}-${Math.random()}.${fileExt}`
      const filePath = `menu/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('menu')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('menu')
        .getPublicUrl(filePath)

      setFormData((prev) => ({
        ...prev,
        image_url: publicUrl
      }))

      toast({
        title: 'Imagen subida',
        description: 'La imagen se ha subido correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo subir la imagen',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (selectedItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(formData)
          .eq('id', selectedItem.id)

        if (error) throw error

        toast({
          title: 'Elemento actualizado',
          description: 'El elemento del menú ha sido actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert([{ ...formData, restaurant_id: restaurantId }])

        if (error) throw error

        toast({
          title: 'Elemento creado',
          description: 'El elemento del menú ha sido creado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      }

      fetchMenuItems()
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el elemento del menú',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setMenuItems((prev) => prev.filter((item) => item.id !== itemId))

      toast({
        title: 'Elemento eliminado',
        description: 'El elemento del menú ha sido eliminado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el elemento del menú',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const openEditModal = (item: MenuItem) => {
    setSelectedItem(item)
    setFormData(item)
    onOpen()
  }

  const openCreateModal = () => {
    setSelectedItem(null)
    setFormData({})
    onOpen()
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">
          Menú
        </Text>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={openCreateModal}
        >
          Añadir Elemento
        </Button>
      </HStack>

      <VStack spacing={6} align="stretch">
        {categories.map((category) => (
          <Box key={category}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              {category}
            </Text>
            <VStack spacing={4} align="stretch">
              {menuItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <Box
                    key={item.id}
                    p={4}
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    shadow="sm"
                  >
                    <HStack spacing={4}>
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          boxSize="100px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      )}
                      <VStack align="start" flex={1}>
                        <HStack justify="space-between" width="100%">
                          <Text fontSize="lg" fontWeight="bold">
                            {item.name}
                          </Text>
                          <HStack>
                            <IconButton
                              aria-label="Editar elemento"
                              icon={<EditIcon />}
                              size="sm"
                              onClick={() => openEditModal(item)}
                            />
                            <IconButton
                              aria-label="Eliminar elemento"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDelete(item.id)}
                            />
                          </HStack>
                        </HStack>
                        <Text color="gray.500">{item.description}</Text>
                        <Text fontWeight="bold">
                          {item.price.toFixed(2)} €
                        </Text>
                        {item.allergens && (
                          <Text fontSize="sm" color="gray.500">
                            Alérgenos: {item.allergens.join(', ')}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                ))}
            </VStack>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedItem ? 'Editar Elemento' : 'Nuevo Elemento'}
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
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Precio</FormLabel>
                <NumberInput
                  value={formData.price}
                  onChange={(value) => handleNumberChange('price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Categoría</FormLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Imagen</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Alérgenos</FormLabel>
                <Input
                  name="allergens"
                  value={formData.allergens?.join(', ')}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allergens: e.target.value.split(',').map((a) => a.trim())
                    }))
                  }
                  placeholder="Separados por comas"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Información Nutricional</FormLabel>
                <HStack>
                  <NumberInput
                    value={formData.nutritional_info?.calories}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        nutritional_info: {
                          ...prev.nutritional_info,
                          calories: parseFloat(value)
                        }
                      }))
                    }
                    min={0}
                  >
                    <NumberInputField placeholder="Calorías" />
                  </NumberInput>
                  <NumberInput
                    value={formData.nutritional_info?.protein}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        nutritional_info: {
                          ...prev.nutritional_info,
                          protein: parseFloat(value)
                        }
                      }))
                    }
                    min={0}
                  >
                    <NumberInputField placeholder="Proteínas" />
                  </NumberInput>
                  <NumberInput
                    value={formData.nutritional_info?.carbs}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        nutritional_info: {
                          ...prev.nutritional_info,
                          carbs: parseFloat(value)
                        }
                      }))
                    }
                    min={0}
                  >
                    <NumberInputField placeholder="Carbohidratos" />
                  </NumberInput>
                  <NumberInput
                    value={formData.nutritional_info?.fat}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        nutritional_info: {
                          ...prev.nutritional_info,
                          fat: parseFloat(value)
                        }
                      }))
                    }
                    min={0}
                  >
                    <NumberInputField placeholder="Grasas" />
                  </NumberInput>
                </HStack>
              </FormControl>

              <Button
                colorScheme="blue"
                width="100%"
                onClick={handleSubmit}
                isLoading={isUploading}
              >
                {selectedItem ? 'Actualizar' : 'Crear'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
} 