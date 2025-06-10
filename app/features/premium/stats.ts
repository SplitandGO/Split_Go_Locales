// Tipos para estadísticas de usuarios
export interface UserStats {
  total: number
  byType: {
    restaurant: number
    customer: number
  }
  byPlan: {
    basic: number
    premium: number
    enterprise: number
  }
}

// Tipos para estadísticas de pedidos
export interface OrderStats {
  total: number
  byStatus: {
    pending: number
    processing: number
    completed: number
    cancelled: number
  }
  byType: {
    restaurant: number
    customer: number
  }
}

// Tipos para estadísticas de ingresos
export interface RevenueStats {
  total: number
  byPlan: {
    basic: number
    premium: number
    enterprise: number
  }
  byType: {
    restaurant: number
    customer: number
  }
}

// Tipos para estadísticas de uso
export interface UsageStats {
  total: number
  active: number
  byPlan: {
    basic: number
    premium: number
    enterprise: number
  }
  byType: {
    restaurant: number
    customer: number
  }
}

// Tipos para estadísticas de soporte
export interface SupportStats {
  total: number
  byStatus: {
    open: number
    inProgress: number
    closed: number
  }
  byPriority: {
    low: number
    medium: number
    high: number
  }
  byType: {
    restaurant: number
    customer: number
  }
}

// Tipos para estadísticas de seguridad
export interface SecurityStats {
  total: number
  byType: {
    login: number
    logout: number
    passwordChange: number
    mfa: number
  }
  byStatus: {
    success: number
    failure: number
  }
}

// Tipos para estadísticas de personalización
export interface CustomizationStats {
  total: number
  byFeature: {
    branding: number
    themes: number
    customDomain: number
    whiteLabel: number
  }
  byType: {
    restaurant: number
    customer: number
  }
}

// Tipos para todas las estadísticas
export interface AllStats {
  users: UserStats
  orders: OrderStats
  revenue: RevenueStats
  usage: UsageStats
  support: SupportStats
  security: SecurityStats
  customization: CustomizationStats
}

// Funciones de utilidad para estadísticas
export const statsUtils = {
  // Calcular porcentaje
  calculatePercentage: (value: number, total: number) => {
    return total === 0 ? 0 : (value / total) * 100
  },

  // Calcular crecimiento
  calculateGrowth: (current: number, previous: number) => {
    return previous === 0 ? 0 : ((current - previous) / previous) * 100
  },

  // Calcular promedio
  calculateAverage: (values: number[]) => {
    return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length
  },

  // Calcular mediana
  calculateMedian: (values: number[]) => {
    if (values.length === 0) return 0
    const sorted = values.sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle]
  },

  // Calcular moda
  calculateMode: (values: number[]) => {
    if (values.length === 0) return 0
    const counts = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    return Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
  },

  // Calcular desviación estándar
  calculateStandardDeviation: (values: number[]) => {
    if (values.length === 0) return 0
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const squareDiffs = values.map(value => {
      const diff = value - avg
      return diff * diff
    })
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length
    return Math.sqrt(avgSquareDiff)
  },

  // Calcular rango
  calculateRange: (values: number[]) => {
    if (values.length === 0) return 0
    return Math.max(...values) - Math.min(...values)
  },

  // Calcular cuartiles
  calculateQuartiles: (values: number[]) => {
    if (values.length === 0) return { q1: 0, q2: 0, q3: 0 }
    const sorted = values.sort((a, b) => a - b)
    const q2 = statsUtils.calculateMedian(sorted)
    const lowerHalf = sorted.filter(x => x < q2)
    const upperHalf = sorted.filter(x => x > q2)
    return {
      q1: statsUtils.calculateMedian(lowerHalf),
      q2,
      q3: statsUtils.calculateMedian(upperHalf)
    }
  },

  // Calcular percentiles
  calculatePercentile: (values: number[], percentile: number) => {
    if (values.length === 0) return 0
    const sorted = values.sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index - lower
    return sorted[lower] * (1 - weight) + sorted[upper] * weight
  }
} 