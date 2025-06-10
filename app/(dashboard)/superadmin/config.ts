import { supabase } from '@/lib/supabase'
import { redis } from '@/lib/redis'
import {
  Plan,
  UserType,
  Roles,
  SuperadminUtils,
  PremiumFeatures,
  PremiumLimits,
  PremiumAnalytics,
  PremiumIntegrations,
  PremiumSupport,
  PremiumSecurity,
  PremiumCustomization
} from '@/app/features/premium/types'

// Configuración de roles y permisos
export const roles: Roles = {
  superadmin: {
    level: 100,
    permissions: ['*']
  },
  admin: {
    level: 80,
    permissions: [
      'manage_restaurants',
      'manage_users',
      'view_analytics',
      'manage_settings'
    ]
  },
  restaurant_owner: {
    level: 60,
    permissions: [
      'manage_own_restaurant',
      'view_own_analytics',
      'manage_own_staff'
    ]
  },
  staff: {
    level: 40,
    permissions: [
      'view_own_restaurant',
      'manage_orders',
      'view_own_analytics'
    ]
  },
  customer: {
    level: 20,
    permissions: [
      'place_orders',
      'view_own_orders',
      'manage_own_profile'
    ]
  }
}

// Configuración de características premium
export const premiumFeatures: PremiumFeatures = {
  restaurant: {
    basic: {
      price: 0,
      features: [
        'basic_analytics',
        'basic_orders',
        'basic_menu'
      ]
    },
    premium: {
      price: 99.99,
      features: [
        'advanced_analytics',
        'priority_orders',
        'custom_menu',
        'staff_management',
        'inventory_management',
        'marketing_tools'
      ]
    },
    enterprise: {
      price: 299.99,
      features: [
        'all_premium_features',
        'dedicated_support',
        'custom_integrations',
        'white_label',
        'api_access'
      ]
    }
  },
  customer: {
    basic: {
      price: 0,
      features: [
        'basic_orders',
        'basic_profile',
        'basic_history'
      ]
    },
    premium: {
      price: 9.99,
      features: [
        'priority_orders',
        'advanced_profile',
        'detailed_history',
        'exclusive_offers',
        'loyalty_program'
      ]
    }
  }
}

// Configuración de límites y cuotas
export const limits: PremiumLimits = {
  restaurant: {
    basic: {
      orders_per_day: 100,
      staff_members: 5,
      menu_items: 50,
      storage: '1GB'
    },
    premium: {
      orders_per_day: 1000,
      staff_members: 20,
      menu_items: 200,
      storage: '10GB'
    },
    enterprise: {
      orders_per_day: 'unlimited',
      staff_members: 'unlimited',
      menu_items: 'unlimited',
      storage: '100GB'
    }
  },
  customer: {
    basic: {
      orders_per_day: 10,
      storage: '100MB'
    },
    premium: {
      orders_per_day: 50,
      storage: '1GB'
    }
  }
}

// Configuración de análisis y métricas
export const analytics: PremiumAnalytics = {
  restaurant: {
    basic: [
      'daily_orders',
      'revenue',
      'popular_items'
    ],
    premium: [
      'all_basic_metrics',
      'customer_insights',
      'staff_performance',
      'inventory_analytics',
      'marketing_effectiveness'
    ],
    enterprise: [
      'all_premium_metrics',
      'predictive_analytics',
      'custom_reports',
      'api_access'
    ]
  },
  customer: {
    basic: [
      'order_history',
      'spending_summary'
    ],
    premium: [
      'all_basic_metrics',
      'detailed_history',
      'preferences_analysis',
      'recommendations'
    ]
  }
}

// Configuración de integraciones
export const integrations: PremiumIntegrations = {
  restaurant: {
    basic: [
      'stripe',
      'email'
    ],
    premium: [
      'all_basic_integrations',
      'pos_systems',
      'inventory_systems',
      'marketing_tools'
    ],
    enterprise: [
      'all_premium_integrations',
      'custom_integrations',
      'api_access'
    ]
  },
  customer: {
    basic: [
      'stripe',
      'email'
    ],
    premium: [
      'all_basic_integrations',
      'social_media',
      'loyalty_programs'
    ]
  }
}

// Configuración de soporte
export const support: PremiumSupport = {
  restaurant: {
    basic: {
      response_time: '48h',
      channels: ['email'],
      hours: '9-17'
    },
    premium: {
      response_time: '24h',
      channels: ['email', 'chat', 'phone'],
      hours: '24/7'
    },
    enterprise: {
      response_time: '4h',
      channels: ['email', 'chat', 'phone', 'dedicated_manager'],
      hours: '24/7'
    }
  },
  customer: {
    basic: {
      response_time: '48h',
      channels: ['email'],
      hours: '9-17'
    },
    premium: {
      response_time: '24h',
      channels: ['email', 'chat'],
      hours: '24/7'
    }
  }
}

// Configuración de seguridad
export const security: PremiumSecurity = {
  restaurant: {
    basic: {
      authentication: 'email_password',
      mfa: false,
      audit_logs: false
    },
    premium: {
      authentication: 'email_password',
      mfa: true,
      audit_logs: true
    },
    enterprise: {
      authentication: 'sso',
      mfa: true,
      audit_logs: true
    }
  },
  customer: {
    basic: {
      authentication: 'email_password',
      mfa: false
    },
    premium: {
      authentication: 'email_password',
      mfa: true
    }
  }
}

// Configuración de personalización
export const customization: PremiumCustomization = {
  restaurant: {
    basic: {
      branding: false,
      themes: false,
      custom_domain: false
    },
    premium: {
      branding: true,
      themes: true,
      custom_domain: true
    },
    enterprise: {
      branding: true,
      themes: true,
      custom_domain: true,
      white_label: true
    }
  },
  customer: {
    basic: {
      themes: false,
      preferences: false
    },
    premium: {
      themes: true,
      preferences: true
    }
  }
}

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
    const features = premiumFeatures[userType][plan]
    return features?.features.includes(feature) || false
  },

  // Verificar límites
  checkLimit: (userType: UserType, plan: Plan, limit: string) => {
    return limits[userType][plan][limit as keyof typeof limits.restaurant.basic]
  },

  // Obtener métricas disponibles
  getAvailableMetrics: (userType: UserType, plan: Plan) => {
    return analytics[userType][plan]
  },

  // Obtener integraciones disponibles
  getAvailableIntegrations: (userType: UserType, plan: Plan) => {
    return integrations[userType][plan]
  },

  // Obtener configuración de soporte
  getSupportConfig: (userType: UserType, plan: Plan) => {
    return support[userType][plan]
  },

  // Obtener configuración de seguridad
  getSecurityConfig: (userType: UserType, plan: Plan) => {
    return security[userType][plan]
  },

  // Obtener configuración de personalización
  getCustomizationConfig: (userType: UserType, plan: Plan) => {
    return customization[userType][plan]
  }
} 