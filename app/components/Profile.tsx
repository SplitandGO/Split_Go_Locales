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
  Avatar,
  useToast,
  Divider,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'
import { useSupabase } from '@/lib/supabase'
import { useState } from 'react'

interface UserProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'waiter' | 'kitchen' | 'cashier'
  avatar_url?: string
  phone?: string
  address?: string
  bio?: string
  preferences: {
    notifications_enabled: boolean
    email_notifications: boolean
    dark_mode: boolean
  }
}

interface ProfileProps {
  profile: UserProfile
  onProfileUpdate?: (profile: UserProfile) => void
}

export default function Profile({ profile, onProfileUpdate }: ProfileProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { supabase } = useSupabase()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const [formData, setFormData] = useState<Partial<UserProfile>>(profile)
  const [isUploading, setIsUploading] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: e.target.checked
      }
    }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setFormData((prev) => ({
        ...prev,
        avatar_url: publicUrl
      }))

      toast({
        title: 'Avatar actualizado',
        description: 'Tu foto de perfil ha sido actualizada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar tu foto de perfil',
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
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id)

      if (error) throw error

      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil ha sido actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      if (onProfileUpdate) {
        onProfileUpdate(formData as UserProfile)
      }

      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar tu perfil',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box
          p={6}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          shadow="sm"
        >
          <HStack spacing={6}>
            <Box position="relative">
              <Avatar
                size="2xl"
                name={profile.name}
                src={profile.avatar_url}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer'
                }}
                disabled={isUploading}
              />
            </Box>
            <VStack align="start" spacing={2} flex={1}>
              <Text fontSize="2xl" fontWeight="bold">
                {profile.name}
              </Text>
              <Text color="gray.500">{profile.email}</Text>
              <Text>Rol: {profile.role}</Text>
              {profile.phone && <Text>Teléfono: {profile.phone}</Text>}
              {profile.address && <Text>Dirección: {profile.address}</Text>}
              {profile.bio && <Text>Bio: {profile.bio}</Text>}
            </VStack>
            <IconButton
              aria-label="Editar perfil"
              icon={<EditIcon />}
              onClick={onOpen}
            />
          </HStack>
        </Box>

        <Box
          p={6}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          shadow="sm"
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Preferencias
          </Text>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text>Notificaciones</Text>
              <Switch
                isChecked={profile.preferences.notifications_enabled}
                isReadOnly
              />
            </HStack>
            <HStack justify="space-between">
              <Text>Notificaciones por Email</Text>
              <Switch
                isChecked={profile.preferences.email_notifications}
                isReadOnly
              />
            </HStack>
            <HStack justify="space-between">
              <Text>Modo Oscuro</Text>
              <Switch
                isChecked={profile.preferences.dark_mode}
                isReadOnly
              />
            </HStack>
          </VStack>
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Perfil</ModalHeader>
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
                <FormLabel>Dirección</FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Input
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                />
              </FormControl>

              <Divider />

              <Text fontWeight="bold">Preferencias</Text>

              <FormControl>
                <FormLabel>Notificaciones</FormLabel>
                <Switch
                  isChecked={formData.preferences?.notifications_enabled}
                  onChange={handleSwitchChange('notifications_enabled')}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notificaciones por Email</FormLabel>
                <Switch
                  isChecked={formData.preferences?.email_notifications}
                  onChange={handleSwitchChange('email_notifications')}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Modo Oscuro</FormLabel>
                <Switch
                  isChecked={formData.preferences?.dark_mode}
                  onChange={handleSwitchChange('dark_mode')}
                />
              </FormControl>

              <Button colorScheme="blue" width="100%" onClick={handleSubmit}>
                Guardar Cambios
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
} 