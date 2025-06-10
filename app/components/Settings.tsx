'use client'

import React, { useState, useEffect } from 'react'
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
  Switch,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'

interface OpeningHours {
  open: string
  close: string
  closed: boolean
}

interface RestaurantSettings {
  id: string
  name: string
  address: string
  phone: string
  email: string
  website?: string
  description?: string
  logo_url?: string
  opening_hours: {
    [key: string]: OpeningHours
  }
  notifications: {
    email_notifications: boolean
    sms_notifications: boolean
    push_notifications: boolean
  }
  appearance: {
    primary_color: string
    secondary_color: string
    font_family: string
    logo_position: 'left' | 'center' | 'right'
  }
  payment: {
    accepted_methods: string[]
    minimum_order: number
    delivery_fee: number
    tax_rate: number
  }
  delivery: {
    enabled: boolean
    radius: number
    minimum_order: number
    delivery_fee: number
  }
  reservations: {
    enabled: boolean
    max_party_size: number
    time_slot_duration: number
    advance_booking_days: number
  }
}

interface SettingsProps {
  restaurantId: string
}

export default function Settings({ restaurantId }: SettingsProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [formData, setFormData] = useState<Partial<RestaurantSettings>>({})
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    fetchSettings()
  }, [restaurantId])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .single()

      if (error) throw error

      setSettings(data as RestaurantSettings)
      setFormData(data as RestaurantSettings)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar la configuración',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev: Partial<RestaurantSettings>) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (section: string, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: Partial<RestaurantSettings>) => {
      const sectionData = prev[section as keyof RestaurantSettings] as Record<string, any>
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: e.target.checked
        }
      }
    })
  }

  const handleNumberChange = (section: string, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: Partial<RestaurantSettings>) => {
      const sectionData = prev[section as keyof RestaurantSettings] as Record<string, any>
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: parseFloat(e.target.value)
        }
      }
    })
  }

  const handleOpeningHoursChange = (day: string, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: Partial<RestaurantSettings>) => {
      const hours = prev.opening_hours?.[day] as OpeningHours
      return {
        ...prev,
        opening_hours: {
          ...prev.opening_hours,
          [day]: {
            ...hours,
            [field]: e.target.value
          }
        }
      }
    })
  }

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('restaurant_settings')
        .update(formData)
        .eq('restaurant_id', restaurantId)

      if (error) throw error

      toast({
        title: 'Configuración actualizada',
        description: 'La configuración ha sido actualizada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      fetchSettings()
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la configuración',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  if (!settings) {
    return (
      <Box p={4}>
        <Text>Cargando configuración...</Text>
      </Box>
    )
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Configuración
          </Text>
          <Button colorScheme="blue" onClick={onOpen}>
            Editar Configuración
          </Button>
        </HStack>

        <Tabs onChange={(index: number) => setActiveTab(index)}>
          <TabList>
            <Tab>General</Tab>
            <Tab>Horario</Tab>
            <Tab>Notificaciones</Tab>
            <Tab>Apariencia</Tab>
            <Tab>Pagos</Tab>
            <Tab>Entrega</Tab>
            <Tab>Reservas</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="start">
                <Text fontWeight="bold">Información General</Text>
                <Text>Nombre: {settings.name}</Text>
                <Text>Dirección: {settings.address}</Text>
                <Text>Teléfono: {settings.phone}</Text>
                <Text>Email: {settings.email}</Text>
                {settings.website && <Text>Sitio Web: {settings.website}</Text>}
                {settings.description && (
                  <Text>Descripción: {settings.description}</Text>
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="start">
                <Text fontWeight="bold">Horario de Apertura</Text>
                {Object.entries(settings.opening_hours).map(([day, hours]) => (
                  <HStack key={day} justify="space-between" width="100%">
                    <Text>{day}</Text>
                    {hours.closed ? (
                      <Text color="red.500">Cerrado</Text>
                    ) : (
                      <Text>
                        {hours.open} - {hours.close}
                      </Text>
                    )}
                  </HStack>
                ))}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="start">
                <Text fontWeight="bold">Notificaciones</Text>
                <HStack>
                  <Text>Notificaciones por Email:</Text>
                  <Text color={settings.notifications.email_notifications ? 'green.500' : 'red.500'}>
                    {settings.notifications.email_notifications ? 'Activadas' : 'Desactivadas'}
                  </Text>
                </HStack>
                <HStack>
                  <Text>Notificaciones SMS:</Text>
                  <Text color={settings.notifications.sms_notifications ? 'green.500' : 'red.500'}>
                    {settings.notifications.sms_notifications ? 'Activadas' : 'Desactivadas'}
                  </Text>
                </HStack>
                <HStack>
                  <Text>Notificaciones Push:</Text>
                  <Text color={settings.notifications.push_notifications ? 'green.500' : 'red.500'}>
                    {settings.notifications.push_notifications ? 'Activadas' : 'Desactivadas'}
                  </Text>
                </HStack>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="start">
                <Text fontWeight="bold">Apariencia</Text>
                <Text>Color Primario: {settings.appearance.primary_color}</Text>
                <Text>Color Secundario: {settings.appearance.secondary_color}</Text>
                <Text>Fuente: {settings.appearance.font_family}</Text>
                <Text>Posición del Logo: {settings.appearance.logo_position}</Text>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="start">
                <Text fontWeight="bold">Configuración de Pagos</Text>
                <Text>Métodos Aceptados: {settings.payment.accepted_methods.join(', ')}</Text>
                <Text>Pedido Mínimo: {settings.payment.minimum_order} €</Text>
                <Text>Gastos de Envío: {settings.payment.delivery_fee} €</Text>
                <Text>IVA: {settings.payment.tax_rate}%</Text>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="start">
                <Text fontWeight="bold">Configuración de Entrega</Text>
                <Text>Entrega a Domicilio: {settings.delivery.enabled ? 'Activada' : 'Desactivada'}</Text>
                <Text>Radio de Entrega: {settings.delivery.radius} km</Text>
                <Text>Pedido Mínimo: {settings.delivery.minimum_order} €</Text>
                <Text>Gastos de Envío: {settings.delivery.delivery_fee} €</Text>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="start">
                <Text fontWeight="bold">Configuración de Reservas</Text>
                <Text>Reservas: {settings.reservations.enabled ? 'Activadas' : 'Desactivadas'}</Text>
                <Text>Tamaño Máximo de Grupo: {settings.reservations.max_party_size} personas</Text>
                <Text>Duración de Franja: {settings.reservations.time_slot_duration} minutos</Text>
                <Text>Reserva Anticipada: {settings.reservations.advance_booking_days} días</Text>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Configuración</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs>
              <TabList>
                <Tab>General</Tab>
                <Tab>Horario</Tab>
                <Tab>Notificaciones</Tab>
                <Tab>Apariencia</Tab>
                <Tab>Pagos</Tab>
                <Tab>Entrega</Tab>
                <Tab>Reservas</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
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
                      <FormLabel>Dirección</FormLabel>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Teléfono</FormLabel>
                      <Input
                        name="phone"
                        value={formData.phone}
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
                      <FormLabel>Sitio Web</FormLabel>
                      <Input
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Descripción</FormLabel>
                      <Input
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4}>
                    {Object.entries(formData.opening_hours || {}).map(([day, hours]) => (
                      <Box key={day} width="100%">
                        <Text fontWeight="bold" mb={2}>
                          {day}
                        </Text>
                        <HStack>
                          <FormControl>
                            <FormLabel>Apertura</FormLabel>
                            <Input
                              type="time"
                              value={(hours as OpeningHours).open}
                              onChange={handleOpeningHoursChange(day, 'open')}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Cierre</FormLabel>
                            <Input
                              type="time"
                              value={(hours as OpeningHours).close}
                              onChange={handleOpeningHoursChange(day, 'close')}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Cerrado</FormLabel>
                            <Switch
                              isChecked={(hours as OpeningHours).closed}
                              onChange={(e) =>
                                setFormData((prev: Partial<RestaurantSettings>) => ({
                                  ...prev,
                                  opening_hours: {
                                    ...prev.opening_hours,
                                    [day]: {
                                      ...(prev.opening_hours?.[day] as OpeningHours),
                                      closed: e.target.checked
                                    }
                                  }
                                }))
                              }
                            />
                          </FormControl>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Notificaciones por Email</FormLabel>
                      <Switch
                        isChecked={formData.notifications?.email_notifications}
                        onChange={handleSwitchChange('notifications', 'email_notifications')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Notificaciones SMS</FormLabel>
                      <Switch
                        isChecked={formData.notifications?.sms_notifications}
                        onChange={handleSwitchChange('notifications', 'sms_notifications')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Notificaciones Push</FormLabel>
                      <Switch
                        isChecked={formData.notifications?.push_notifications}
                        onChange={handleSwitchChange('notifications', 'push_notifications')}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Color Primario</FormLabel>
                      <Input
                        name="appearance.primary_color"
                        value={formData.appearance?.primary_color}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Color Secundario</FormLabel>
                      <Input
                        name="appearance.secondary_color"
                        value={formData.appearance?.secondary_color}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Fuente</FormLabel>
                      <Input
                        name="appearance.font_family"
                        value={formData.appearance?.font_family}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Posición del Logo</FormLabel>
                      <Select
                        name="appearance.logo_position"
                        value={formData.appearance?.logo_position}
                        onChange={handleInputChange}
                      >
                        <option value="left">Izquierda</option>
                        <option value="center">Centro</option>
                        <option value="right">Derecha</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Métodos de Pago Aceptados</FormLabel>
                      <Select
                        name="payment.accepted_methods"
                        value={formData.payment?.accepted_methods}
                        onChange={handleInputChange}
                        multiple
                      >
                        <option value="cash">Efectivo</option>
                        <option value="card">Tarjeta</option>
                        <option value="transfer">Transferencia</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Pedido Mínimo</FormLabel>
                      <Input
                        type="number"
                        value={formData.payment?.minimum_order}
                        onChange={handleNumberChange('payment', 'minimum_order')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Gastos de Envío</FormLabel>
                      <Input
                        type="number"
                        value={formData.payment?.delivery_fee}
                        onChange={handleNumberChange('payment', 'delivery_fee')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>IVA</FormLabel>
                      <Input
                        type="number"
                        value={formData.payment?.tax_rate}
                        onChange={handleNumberChange('payment', 'tax_rate')}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Entrega a Domicilio</FormLabel>
                      <Switch
                        isChecked={formData.delivery?.enabled}
                        onChange={handleSwitchChange('delivery', 'enabled')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Radio de Entrega (km)</FormLabel>
                      <Input
                        type="number"
                        value={formData.delivery?.radius}
                        onChange={handleNumberChange('delivery', 'radius')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Pedido Mínimo</FormLabel>
                      <Input
                        type="number"
                        value={formData.delivery?.minimum_order}
                        onChange={handleNumberChange('delivery', 'minimum_order')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Gastos de Envío</FormLabel>
                      <Input
                        type="number"
                        value={formData.delivery?.delivery_fee}
                        onChange={handleNumberChange('delivery', 'delivery_fee')}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Reservas</FormLabel>
                      <Switch
                        isChecked={formData.reservations?.enabled}
                        onChange={handleSwitchChange('reservations', 'enabled')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Tamaño Máximo de Grupo</FormLabel>
                      <Input
                        type="number"
                        value={formData.reservations?.max_party_size}
                        onChange={handleNumberChange('reservations', 'max_party_size')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Duración de Franja (minutos)</FormLabel>
                      <Input
                        type="number"
                        value={formData.reservations?.time_slot_duration}
                        onChange={handleNumberChange('reservations', 'time_slot_duration')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Reserva Anticipada (días)</FormLabel>
                      <Input
                        type="number"
                        value={formData.reservations?.advance_booking_days}
                        onChange={handleNumberChange('reservations', 'advance_booking_days')}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Button colorScheme="blue" width="100%" mt={6} onClick={handleSubmit}>
              Guardar Cambios
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
} 