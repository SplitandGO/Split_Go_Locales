// Simulación de integración con apps de delivery externas
export type DeliveryApp = 'uber' | 'pedidosya' | 'rappi';

export interface ExternalOrder {
  id: string;
  external_app: DeliveryApp;
  type: 'delivery';
  table_number?: number;
  customer_name: string;
  address: string;
  items: { name: string; quantity: number }[];
  status: 'pendiente' | 'preparando' | 'listo' | 'entregado';
  created_at: string;
}

// Mock: función para simular la llegada de un pedido externo
export function mockExternalOrder(app: DeliveryApp): ExternalOrder {
  return {
    id: Math.random().toString(36).substring(2, 10),
    external_app: app,
    type: 'delivery',
    customer_name: 'Cliente Delivery',
    address: 'Calle Falsa 123',
    items: [
      { name: 'Pizza Margarita', quantity: 2 },
      { name: 'Bebida', quantity: 1 }
    ],
    status: 'pendiente',
    created_at: new Date().toISOString()
  };
} 