'use client'

import { useState, useEffect } from 'react'
import {
  SimpleGrid,
  Box,
  Image,
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
  Textarea,
  Select,
  VStack,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/supabase'

export default function MenuGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    available: true,
  })
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category')

      if (error) throw error

      setProducts(data || [])
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

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    onOpen()
  }

  const handleAddProduct = async () => {
    try {
      const { error } = await supabase.from('products').insert([
        {
          ...newProduct,
          price: parseFloat(newProduct.price),
        },
      ])

      if (error) throw error

      await fetchProducts()
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        available: true,
      })
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

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return

    try {
      const { error } = await supabase
        .from('products')
        .update({
          available: !selectedProduct.available,
        })
        .eq('id', selectedProduct.id)

      if (error) throw error

      await fetchProducts()
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

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {products.map((product) => (
          <Box
            key={product.id}
            p={6}
            bg={bgColor}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            cursor="pointer"
            onClick={() => handleProductClick(product)}
            _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
            transition="all 0.3s"
          >
            <Image
              src={product.image_url}
              alt={product.name}
              borderRadius="md"
              mb={4}
              height="200px"
              width="100%"
              objectFit="cover"
            />
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              {product.name}
            </Text>
            <Text color="gray.600" mb={2}>
              {product.description}
            </Text>
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              ${product.price}
            </Text>
            <Badge colorScheme={product.available ? 'green' : 'red'}>
              {product.available ? 'Disponible' : 'No Disponible'}
            </Badge>
          </Box>
        ))}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedProduct ? selectedProduct.name : 'Nuevo Producto'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProduct ? (
              <VStack spacing={4}>
                <Button
                  colorScheme={selectedProduct.available ? 'red' : 'green'}
                  width="100%"
                  onClick={handleUpdateProduct}
                >
                  {selectedProduct.available
                    ? 'Marcar como No Disponible'
                    : 'Marcar como Disponible'}
                </Button>
              </VStack>
            ) : (
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Descripción</FormLabel>
                  <Textarea
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Precio</FormLabel>
                  <NumberInput
                    value={newProduct.price}
                    onChange={(value) =>
                      setNewProduct({ ...newProduct, price: value })
                    }
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
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                  >
                    <option value="">Seleccione una categoría</option>
                    <option value="entradas">Entradas</option>
                    <option value="platos_principales">Platos Principales</option>
                    <option value="postres">Postres</option>
                    <option value="bebidas">Bebidas</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>URL de la Imagen</FormLabel>
                  <Input
                    value={newProduct.image_url}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, image_url: e.target.value })
                    }
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            {!selectedProduct && (
              <Button colorScheme="blue" mr={3} onClick={handleAddProduct}>
                Agregar Producto
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