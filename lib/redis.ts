import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL

if (!redisUrl) {
  throw new Error('Falta la variable de entorno REDIS_URL')
}

const redis = new Redis(redisUrl)

// Funciones de utilidad para caché
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key)
  return data ? JSON.parse(data) : null
}

export const setCachedData = async <T>(
  key: string,
  data: T,
  ttl: number = 3600
): Promise<void> => {
  await redis.setex(key, ttl, JSON.stringify(data))
}

export const deleteCachedData = async (key: string): Promise<void> => {
  await redis.del(key)
}

// Funciones específicas para caché de datos comunes
export const getCachedRestaurante = async (id: string) => {
  return getCachedData(`restaurante:${id}`)
}

export const setCachedRestaurante = async (id: string, data: any) => {
  await setCachedData(`restaurante:${id}`, data)
}

export const getCachedProductos = async (restauranteId: string) => {
  return getCachedData(`productos:${restauranteId}`)
}

export const setCachedProductos = async (restauranteId: string, data: any[]) => {
  await setCachedData(`productos:${restauranteId}`, data)
}

export const getCachedEstadisticas = async (
  restauranteId: string,
  periodo: string
) => {
  return getCachedData(`estadisticas:${restauranteId}:${periodo}`)
}

export const setCachedEstadisticas = async (
  restauranteId: string,
  periodo: string,
  data: any
) => {
  await setCachedData(`estadisticas:${restauranteId}:${periodo}`, data)
}

export const getCachedPedidos = async (restauranteId: string) => {
  return getCachedData(`pedidos:${restauranteId}`)
}

export const setCachedPedidos = async (restauranteId: string, data: any[]) => {
  await setCachedData(`pedidos:${restauranteId}`, data)
}

export const getCachedMesas = async (restauranteId: string) => {
  return getCachedData(`mesas:${restauranteId}`)
}

export const setCachedMesas = async (restauranteId: string, data: any[]) => {
  await setCachedData(`mesas:${restauranteId}`, data)
}

export const getCachedEmpleados = async (restauranteId: string) => {
  return getCachedData(`empleados:${restauranteId}`)
}

export const setCachedEmpleados = async (restauranteId: string, data: any[]) => {
  await setCachedData(`empleados:${restauranteId}`, data)
}

export const getCachedProveedores = async (restauranteId: string) => {
  return getCachedData(`proveedores:${restauranteId}`)
}

export const setCachedProveedores = async (restauranteId: string, data: any[]) => {
  await setCachedData(`proveedores:${restauranteId}`, data)
}

export const getCachedInventario = async (restauranteId: string) => {
  return getCachedData(`inventario:${restauranteId}`)
}

export const setCachedInventario = async (restauranteId: string, data: any[]) => {
  await setCachedData(`inventario:${restauranteId}`, data)
}

export const getCachedReservas = async (restauranteId: string) => {
  return getCachedData(`reservas:${restauranteId}`)
}

export const setCachedReservas = async (restauranteId: string, data: any[]) => {
  await setCachedData(`reservas:${restauranteId}`, data)
}

export const getCachedNotificaciones = async (restauranteId: string) => {
  return getCachedData(`notificaciones:${restauranteId}`)
}

export const setCachedNotificaciones = async (restauranteId: string, data: any[]) => {
  await setCachedData(`notificaciones:${restauranteId}`, data)
}

export const getCachedConfiguracion = async (restauranteId: string) => {
  return getCachedData(`configuracion:${restauranteId}`)
}

export const setCachedConfiguracion = async (restauranteId: string, data: any) => {
  await setCachedData(`configuracion:${restauranteId}`, data)
}

export const getCachedPlan = async (restauranteId: string) => {
  return getCachedData(`plan:${restauranteId}`)
}

export const setCachedPlan = async (restauranteId: string, data: any) => {
  await setCachedData(`plan:${restauranteId}`, data)
}

// Función para limpiar caché de un restaurante
export const clearRestauranteCache = async (restauranteId: string) => {
  const keys = await redis.keys(`*:${restauranteId}`)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

// Función para limpiar caché de un usuario
export const clearUsuarioCache = async (usuarioId: string) => {
  const keys = await redis.keys(`usuario:${usuarioId}:*`)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

// Funciones de utilidad para caché
export const cacheUtils = {
  // Obtener datos del caché
  get: async (key: string) => {
    try {
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error al obtener datos del caché:', error)
      return null
    }
  },

  // Guardar datos en el caché
  set: async (key: string, value: any, ttl?: number) => {
    try {
      const stringValue = JSON.stringify(value)
      if (ttl) {
        await redis.setex(key, ttl, stringValue)
      } else {
        await redis.set(key, stringValue)
      }
      return true
    } catch (error) {
      console.error('Error al guardar datos en el caché:', error)
      return false
    }
  },

  // Eliminar datos del caché
  del: async (key: string) => {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error('Error al eliminar datos del caché:', error)
      return false
    }
  },

  // Limpiar todo el caché
  clear: async () => {
    try {
      await redis.flushdb()
      return true
    } catch (error) {
      console.error('Error al limpiar el caché:', error)
      return false
    }
  },

  // Obtener múltiples claves
  mget: async (keys: string[]) => {
    try {
      const data = await redis.mget(keys)
      return data.map(item => item ? JSON.parse(item) : null)
    } catch (error) {
      console.error('Error al obtener múltiples datos del caché:', error)
      return []
    }
  },

  // Guardar múltiples claves
  mset: async (items: { key: string; value: any; ttl?: number }[]) => {
    try {
      const pipeline = redis.pipeline()
      items.forEach(({ key, value, ttl }) => {
        const stringValue = JSON.stringify(value)
        if (ttl) {
          pipeline.setex(key, ttl, stringValue)
        } else {
          pipeline.set(key, stringValue)
        }
      })
      await pipeline.exec()
      return true
    } catch (error) {
      console.error('Error al guardar múltiples datos en el caché:', error)
      return false
    }
  },

  // Incrementar contador
  increment: async (key: string, amount: number = 1) => {
    try {
      return await redis.incrby(key, amount)
    } catch (error) {
      console.error('Error al incrementar contador en el caché:', error)
      return null
    }
  },

  // Decrementar contador
  decrement: async (key: string, amount: number = 1) => {
    try {
      return await redis.decrby(key, amount)
    } catch (error) {
      console.error('Error al decrementar contador en el caché:', error)
      return null
    }
  },

  // Establecer tiempo de expiración
  expire: async (key: string, ttl: number) => {
    try {
      await redis.expire(key, ttl)
      return true
    } catch (error) {
      console.error('Error al establecer tiempo de expiración en el caché:', error)
      return false
    }
  },

  // Verificar si una clave existe
  exists: async (key: string) => {
    try {
      return await redis.exists(key)
    } catch (error) {
      console.error('Error al verificar existencia de clave en el caché:', error)
      return false
    }
  }
}

// Middleware para caché de rutas
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: any, res: any, next: any) => {
    const key = `route:${req.originalUrl}`
    const cachedData = await cacheUtils.get(key)

    if (cachedData) {
      return res.json(cachedData)
    }

    res.sendResponse = res.json
    res.json = (body: any) => {
      cacheUtils.set(key, body, ttl)
      res.sendResponse(body)
    }

    next()
  }
}

// Función para invalidar caché por patrón
export const invalidateCacheByPattern = async (pattern: string) => {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    return true
  } catch (error) {
    console.error('Error al invalidar caché por patrón:', error)
    return false
  }
}

// Función para caché de consultas a base de datos
export const cacheQuery = async (key: string, queryFn: () => Promise<any>, ttl: number = 300) => {
  const cachedData = await cacheUtils.get(key)
  if (cachedData) {
    return cachedData
  }

  const data = await queryFn()
  await cacheUtils.set(key, data, ttl)
  return data
} 