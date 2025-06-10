'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  useToast,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'

interface Producto {
  id: string
  nombre: string
  categoria: string
  stock: number
  stockMinimo: number
  unidad: string
  proveedor: string
  ultimaActualizacion: Date
}

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const toast = useToast()

  const handleAddProducto = () => {
    setProductoSeleccionado(null)
    setIsModalOpen(true)
  }

  const handleEditProducto = (producto: Producto) => {
    setProductoSeleccionado(producto)
    setIsModalOpen(true)
  }

  const handleDeleteProducto = (id: string) => {
    // Implementar lógica de eliminación
    toast({
      title: 'Producto eliminado',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleSaveProducto = (producto: Producto) => {
    // Implementar lógica de guardado
    toast({
      title: 'Producto guardado',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
    setIsModalOpen(false)
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Gestión de Inventario</Heading>
            <Text mt={2} color="gray.600">
              Controla tu stock y gestiona proveedores
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddProducto}
          >
            Nuevo Producto
          </Button>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Categoría</Th>
                <Th>Stock</Th>
                <Th>Stock Mínimo</Th>
                <Th>Unidad</Th>
                <Th>Proveedor</Th>
                <Th>Última Actualización</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {productos.map((producto) => (
                <Tr key={producto.id}>
                  <Td>{producto.nombre}</Td>
                  <Td>{producto.categoria}</Td>
                  <Td>
                    <Badge
                      colorScheme={producto.stock <= producto.stockMinimo ? 'red' : 'green'}
                    >
                      {producto.stock}
                    </Badge>
                  </Td>
                  <Td>{producto.stockMinimo}</Td>
                  <Td>{producto.unidad}</Td>
                  <Td>{producto.proveedor}</Td>
                  <Td>{producto.ultimaActualizacion.toLocaleDateString()}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Editar producto"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleEditProducto(producto)}
                      />
                      <IconButton
                        aria-label="Eliminar producto"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteProducto(producto.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input placeholder="Nombre del producto" />
              </FormControl>

              <FormControl>
                <FormLabel>Categoría</FormLabel>
                <Select placeholder="Seleccionar categoría">
                  <option value="bebidas">Bebidas</option>
                  <option value="alimentos">Alimentos</option>
                  <option value="utensilios">Utensilios</option>
                  <option value="limpieza">Limpieza</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Stock</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Stock Mínimo</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Unidad</FormLabel>
                <Select placeholder="Seleccionar unidad">
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kilogramo</option>
                  <option value="l">Litro</option>
                  <option value="g">Gramo</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Proveedor</FormLabel>
                <Input placeholder="Nombre del proveedor" />
              </FormControl>

              <Button colorScheme="blue" mr={3} onClick={() => handleSaveProducto}>
                Guardar
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
} 