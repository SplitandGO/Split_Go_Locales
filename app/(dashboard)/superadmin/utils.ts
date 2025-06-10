import { supabase } from '@/lib/supabase'
import { redis } from '@/lib/redis'
import {
  UserType,
  Plan,
  SuperadminUtils
} from '@/app/features/premium/types'
import {
  UserStats,
  OrderStats,
  RevenueStats,
  UsageStats,
  SupportStats,
  SecurityStats,
  CustomizationStats,
  AllStats,
  statsUtils
} from '@/app/features/premium/stats'
import {
  roles,
  premiumFeatures,
  limits,
  analytics,
  integrations,
  support,
  security,
  customization
} from './config'

// Funciones de utilidad para el panel de superadmin
export const superadminUtils: SuperadminUtils = {
  // Verificar permisos
  checkPermission: (role: string, permission: string) => {
    const roleConfig = roles[role as keyof typeof roles]
    return roleConfig?.permissions.includes('*') || roleConfig?.permissions.includes(permission)
  },

  // Obtener nivel de rol
  getRoleLevel: (role: string) => {
    return roles[role as keyof typeof roles]?.level || 0
  },

  // Verificar si un usuario tiene acceso a una característica
  hasFeatureAccess: (userType: UserType, plan: Plan, feature: string) => {
    const features = premiumFeatures[userType][plan as keyof typeof premiumFeatures[typeof userType]]
    return features?.features.includes(feature) || false
  },

  // Verificar límites
  checkLimit: (userType: UserType, plan: Plan, limit: string) => {
    const userLimits = limits[userType][plan as keyof typeof limits[typeof userType]]
    if (userType === 'restaurant') {
      return (userLimits as typeof limits.restaurant.basic)[limit as keyof typeof limits.restaurant.basic]
    } else {
      return (userLimits as typeof limits.customer.basic)[limit as keyof typeof limits.customer.basic]
    }
  },

  // Obtener métricas disponibles
  getAvailableMetrics: (userType: UserType, plan: Plan) => {
    return analytics[userType][plan as keyof typeof analytics[typeof userType]]
  },

  // Obtener integraciones disponibles
  getAvailableIntegrations: (userType: UserType, plan: Plan) => {
    return integrations[userType][plan as keyof typeof integrations[typeof userType]]
  },

  // Obtener configuración de soporte
  getSupportConfig: (userType: UserType, plan: Plan) => {
    return support[userType][plan as keyof typeof support[typeof userType]]
  },

  // Obtener configuración de seguridad
  getSecurityConfig: (userType: UserType, plan: Plan) => {
    return security[userType][plan as keyof typeof security[typeof userType]]
  },

  // Obtener configuración de personalización
  getCustomizationConfig: (userType: UserType, plan: Plan) => {
    return customization[userType][plan as keyof typeof customization[typeof userType]]
  }
}

// Funciones de utilidad para el panel de superadmin
export const superadminHelpers = {
  // Obtener estadísticas de usuarios
  async getUserStats(): Promise<UserStats> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const stats: UserStats = {
      total: users.length,
      byType: {
        restaurant: users.filter((u: any) => u.type === 'restaurant').length,
        customer: users.filter((u: any) => u.type === 'customer').length
      },
      byPlan: {
        basic: users.filter((u: any) => u.plan === 'basic').length,
        premium: users.filter((u: any) => u.plan === 'premium').length,
        enterprise: users.filter((u: any) => u.plan === 'enterprise').length
      }
    }

    return stats
  },

  // Obtener estadísticas de pedidos
  async getOrderStats(): Promise<OrderStats> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const stats: OrderStats = {
      total: orders.length,
      byStatus: {
        pending: orders.filter((o: any) => o.status === 'pending').length,
        processing: orders.filter((o: any) => o.status === 'processing').length,
        completed: orders.filter((o: any) => o.status === 'completed').length,
        cancelled: orders.filter((o: any) => o.status === 'cancelled').length
      },
      byType: {
        restaurant: orders.filter((o: any) => o.type === 'restaurant').length,
        customer: orders.filter((o: any) => o.type === 'customer').length
      }
    }

    return stats
  },

  // Obtener estadísticas de ingresos
  async getRevenueStats(): Promise<RevenueStats> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const stats: RevenueStats = {
      total: orders.reduce((acc: number, order: any) => acc + order.total, 0),
      byPlan: {
        basic: orders
          .filter((o: any) => o.plan === 'basic')
          .reduce((acc: number, order: any) => acc + order.total, 0),
        premium: orders
          .filter((o: any) => o.plan === 'premium')
          .reduce((acc: number, order: any) => acc + order.total, 0),
        enterprise: orders
          .filter((o: any) => o.plan === 'enterprise')
          .reduce((acc: number, order: any) => acc + order.total, 0)
      },
      byType: {
        restaurant: orders
          .filter((o: any) => o.type === 'restaurant')
          .reduce((acc: number, order: any) => acc + order.total, 0),
        customer: orders
          .filter((o: any) => o.type === 'customer')
          .reduce((acc: number, order: any) => acc + order.total, 0)
      }
    }

    return stats
  },

  // Obtener estadísticas de uso
  async getUsageStats(): Promise<UsageStats> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const stats: UsageStats = {
      total: users.length,
      active: users.filter((u: any) => u.last_active > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
      byPlan: {
        basic: users.filter((u: any) => u.plan === 'basic').length,
        premium: users.filter((u: any) => u.plan === 'premium').length,
        enterprise: users.filter((u: any) => u.plan === 'enterprise').length
      },
      byType: {
        restaurant: users.filter((u: any) => u.type === 'restaurant').length,
        customer: users.filter((u: any) => u.type === 'customer').length
      }
    }

    return stats
  },

  // Obtener estadísticas de soporte
  async getSupportStats(): Promise<SupportStats> {
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const stats: SupportStats = {
      total: tickets.length,
      byStatus: {
        open: tickets.filter((t: any) => t.status === 'open').length,
        inProgress: tickets.filter((t: any) => t.status === 'in_progress').length,
        closed: tickets.filter((t: any) => t.status === 'closed').length
      },
      byPriority: {
        low: tickets.filter((t: any) => t.priority === 'low').length,
        medium: tickets.filter((t: any) => t.priority === 'medium').length,
        high: tickets.filter((t: any) => t.priority === 'high').length
      },
      byType: {
        restaurant: tickets.filter((t: any) => t.type === 'restaurant').length,
        customer: tickets.filter((t: any) => t.type === 'customer').length
      }
    }

    return stats
  },

  // Obtener estadísticas de seguridad
  async getSecurityStats(): Promise<SecurityStats> {
    const { data: logs, error } = await supabase
      .from('security_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const stats: SecurityStats = {
      total: logs.length,
      byType: {
        login: logs.filter((l: any) => l.type === 'login').length,
        logout: logs.filter((l: any) => l.type === 'logout').length,
        passwordChange: logs.filter((l: any) => l.type === 'password_change').length,
        mfa: logs.filter((l: any) => l.type === 'mfa').length
      },
      byStatus: {
        success: logs.filter((l: any) => l.status === 'success').length,
        failure: logs.filter((l: any) => l.status === 'failure').length
      }
    }

    return stats
  },

  // Obtener estadísticas de personalización
  async getCustomizationStats(): Promise<CustomizationStats> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const stats: CustomizationStats = {
      total: users.length,
      byFeature: {
        branding: users.filter((u: any) => u.customization?.branding).length,
        themes: users.filter((u: any) => u.customization?.themes).length,
        customDomain: users.filter((u: any) => u.customization?.custom_domain).length,
        whiteLabel: users.filter((u: any) => u.customization?.white_label).length
      },
      byType: {
        restaurant: users.filter((u: any) => u.type === 'restaurant').length,
        customer: users.filter((u: any) => u.type === 'customer').length
      }
    }

    return stats
  },

  // Obtener todas las estadísticas
  async getAllStats(): Promise<AllStats> {
    const [
      userStats,
      orderStats,
      revenueStats,
      usageStats,
      supportStats,
      securityStats,
      customizationStats
    ] = await Promise.all([
      this.getUserStats(),
      this.getOrderStats(),
      this.getRevenueStats(),
      this.getUsageStats(),
      this.getSupportStats(),
      this.getSecurityStats(),
      this.getCustomizationStats()
    ])

    return {
      users: userStats,
      orders: orderStats,
      revenue: revenueStats,
      usage: usageStats,
      support: supportStats,
      security: securityStats,
      customization: customizationStats
    }
  }
} 