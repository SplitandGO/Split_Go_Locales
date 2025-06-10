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
  Select,
  useToast,
  IconButton,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { useSupabase } from '@/lib/supabase'
import { useState } from 'react'

interface StaffMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'waiter' | 'kitchen' | 'cashier'
  status: 'active' | 'inactive'
  avatar_url?: string
  phone?: string
  hire_date: string
  salary?: number
}

interface StaffListProps {
  staff: StaffMember[]
  onStaffAdd?: (member: Omit<StaffMember, 'id'>) => void
  onStaffEdit?: (member: StaffMember) => void
  onStaffDelete?: (member: StaffMember) => void
}

export default function StaffList({
  staff,
  onStaffAdd,
  onStaffEdit,
  onStaffDelete
}: StaffListProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { supabase } = useSupabase()
  const toast = useToast()

  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    email: '',
    role: 'waiter',
    status: 'active',
    phone: '',
    salary: 0
  })

  const handleMemberClick = (member: StaffMember) => {
    setSelectedMember(member)
    setFormData(member)
    setIsEditing(true)
    onOpen()
  }

  const handleAddClick = () => {
    setSelectedMember(null)
    setFormData({
      name: '',
      email: '',
      role: 'waiter',
      status: 'active',
      phone: '',
      salary: 0
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

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedMember) {
        const { error } = await supabase
          .from('staff')
          .update(formData)
          .eq('id', selectedMember.id)

        if (error) throw error

        toast({
          title: 'Empleado actualizado',
          description: 'El empleado ha sido actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })

        if (onStaffEdit) {
          onStaffEdit({ ...selectedMember, ...formData })
        }
      } else {
        const { error } = await supabase.from('staff').insert([formData])

        if (error) throw error

        toast({
          title: 'Empleado agregado',
          description: 'El empleado ha sido agregado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        })

        if (onStaffAdd) {
          onStaffAdd(formData as Omit<StaffMember, 'id'>)
        }
      }

      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el empleado',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleDelete = async (member: StaffMember) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', member.id)

      if (error) throw error

      toast({
        title: 'Empleado eliminado',
        description: 'El empleado ha sido eliminado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      if (onStaffDelete) {
        onStaffDelete(member)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el empleado',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const getRoleColor = (role: StaffMember['role']) => {
    switch (role) {
      case 'admin':
        return 'purple'
      case 'waiter':
        return 'blue'
      case 'kitchen':
        return 'orange'
      case 'cashier':
        return 'green'
      default:
        return 'gray'
    }
  }

  const getRoleText = (role: StaffMember['role']) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'waiter':
        return 'Mesero'
      case 'kitchen':
        return 'Cocina'
      case 'cashier':
        return 'Cajero'
      default:
        return 'Desconocido'
    }
  }

  return (
    <>
      <VStack spacing={4} align="stretch">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Empleado</Th>
              <Th>Rol</Th>
              <Th>Estado</Th>
              <Th>Fecha de Contratación</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {staff.map((member) => (
              <Tr key={member.id}>
                <Td>
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      name={member.name}
                      src={member.avatar_url}
                    />
                    <Box>
                      <Text fontWeight="bold">{member.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {member.email}
                      </Text>
                    </Box>
                  </HStack>
                </Td>
                <Td>
                  <Badge colorScheme={getRoleColor(member.role)}>
                    {getRoleText(member.role)}
                  </Badge>
                </Td>
                <Td>
                  <Badge
                    colorScheme={member.status === 'active' ? 'green' : 'red'}
                  >
                    {member.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </Td>
                <Td>
                  {new Date(member.hire_date).toLocaleDateString()}
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Editar empleado"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => handleMemberClick(member)}
                    />
                    <IconButton
                      aria-label="Eliminar empleado"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(member)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAddClick}
          alignSelf="flex-start"
        >
          Agregar Empleado
        </Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Editar Empleado' : 'Agregar Empleado'}
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
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Rol</FormLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="admin">Administrador</option>
                  <option value="waiter">Mesero</option>
                  <option value="kitchen">Cocina</option>
                  <option value="cashier">Cajero</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Estado</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Teléfono</FormLabel>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Salario</FormLabel>
                <Input
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleInputChange}
                />
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