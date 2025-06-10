import { PlanType, PremiumFeature, UserPlan } from './types'

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'inventario',
    name: 'Gestión de Inventario',
    description: 'Control de stock, alertas y gestión de proveedores',
    availableIn: ['free', 'premium', 'enterprise'],
    icon: '📦'
  },
  {
    id: 'estadisticas',
    name: 'Estadísticas Avanzadas',
    description: 'Análisis en tiempo real y reportes personalizados',
    availableIn: ['premium', 'enterprise'],
    icon: '📊'
  },
  {
    id: 'gestion',
    name: 'Gestión de Personal',
    description: 'Control de empleados, horarios y nómina',
    availableIn: ['premium', 'enterprise'],
    icon: '👥'
  },
  {
    id: 'marketing',
    name: 'Marketing y Fidelización',
    description: 'Programa de lealtad y campañas promocionales',
    availableIn: ['premium', 'enterprise'],
    icon: '🎯'
  },
  {
    id: 'integraciones',
    name: 'Integraciones',
    description: 'Conexión con sistemas POS y software contable',
    availableIn: ['enterprise'],
    icon: '🔌'
  },
  {
    id: 'soporte',
    name: 'Soporte Premium',
    description: 'Atención prioritaria y gestor dedicado',
    availableIn: ['premium', 'enterprise'],
    icon: '🎧'
  },
  {
    id: 'seguridad',
    name: 'Seguridad Avanzada',
    description: 'Autenticación avanzada y encriptación de datos',
    availableIn: ['premium', 'enterprise'],
    icon: '🔒'
  },
  {
    id: 'personalizacion',
    name: 'Personalización',
    description: 'Marca blanca y características personalizadas',
    availableIn: ['enterprise'],
    icon: '🎨'
  }
]

export const USER_PLANS: UserPlan[] = [
  {
    type: 'free',
    features: PREMIUM_FEATURES.filter(f => f.availableIn.includes('free')),
    price: 0,
    currency: 'USD',
    billingCycle: 'monthly'
  },
  {
    type: 'premium',
    features: PREMIUM_FEATURES.filter(f => f.availableIn.includes('premium')),
    price: 49.99,
    currency: 'USD',
    billingCycle: 'monthly'
  },
  {
    type: 'enterprise',
    features: PREMIUM_FEATURES.filter(f => f.availableIn.includes('enterprise')),
    price: 149.99,
    currency: 'USD',
    billingCycle: 'monthly'
  }
]

export const getPlanFeatures = (planType: PlanType): PremiumFeature[] => {
  const plan = USER_PLANS.find(p => p.type === planType)
  return plan ? plan.features : []
}

export const getPlanPrice = (planType: PlanType): number => {
  const plan = USER_PLANS.find(p => p.type === planType)
  return plan ? plan.price : 0
} 