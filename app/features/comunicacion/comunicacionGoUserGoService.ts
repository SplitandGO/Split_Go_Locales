// Comunicación GoUser ↔ GoService

export interface LlamadaMesero {
  mesa: number;
  motivo: 'atencion' | 'cuenta' | 'otro';
  timestamp: string;
}

export interface NotificacionGoService {
  mesa: number;
  tipo: 'llamada' | 'pedido-listo' | 'alerta';
  mensaje: string;
  timestamp: string;
}

// Simulación de llamada desde GoUser
export function llamarMesero(mesa: number, motivo: 'atencion' | 'cuenta' | 'otro'): LlamadaMesero {
  return {
    mesa,
    motivo,
    timestamp: new Date().toISOString()
  };
}

// Simulación de notificación a GoService
export function notificarGoService(mesa: number, tipo: 'llamada' | 'pedido-listo' | 'alerta', mensaje: string): NotificacionGoService {
  return {
    mesa,
    tipo,
    mensaje,
    timestamp: new Date().toISOString()
  };
} 