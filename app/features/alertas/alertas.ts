// Utilidades de alertas y notificaciones

export type Destinatario = 'gokitchen' | 'goservice' | 'gouser';

export interface Alerta {
  destinatario: Destinatario;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
}

export function enviarAlerta(destinatario: Destinatario, mensaje: string, tipo: 'info' | 'warning' | 'success' | 'error' = 'info'): Alerta {
  return {
    destinatario,
    mensaje,
    tipo,
    timestamp: new Date().toISOString()
  };
}

// Ejemplo de uso:
// enviarAlerta('gokitchen', 'Nuevo pedido delivery recibido', 'success')
// enviarAlerta('goservice', 'El cliente de la mesa 5 llamó al mesero', 'info')
// enviarAlerta('gouser', 'Tu pedido está listo para retirar', 'success') 