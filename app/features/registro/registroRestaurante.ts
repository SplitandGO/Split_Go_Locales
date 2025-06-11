// Flujo de registro de restaurante
export interface RegistroRestaurante {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  tipoCocina: string;
  horarios: string;
  fotos: string[];
  razonSocial: string;
  cuit: string;
  docFiscal: string;
  comprobanteDomicilio: string;
  integraciones: string[]; // apps externas
  metodosCobro: string[];
  carta: any[];
  mesas: number;
  personal: { nombre: string; rol: string; email: string }[];
}

export function validarRegistro(datos: RegistroRestaurante): string[] {
  const errores: string[] = [];
  if (!datos.nombre) errores.push('El nombre del local es obligatorio');
  if (!datos.email) errores.push('El email es obligatorio');
  if (!datos.telefono) errores.push('El teléfono es obligatorio');
  if (!datos.direccion) errores.push('La dirección es obligatoria');
  if (!datos.razonSocial) errores.push('La razón social es obligatoria');
  if (!datos.cuit) errores.push('El CUIT/RFC/NIF es obligatorio');
  if (!datos.docFiscal) errores.push('El documento fiscal es obligatorio');
  if (!datos.comprobanteDomicilio) errores.push('El comprobante de domicilio es obligatorio');
  if (!datos.metodosCobro.length) errores.push('Debe configurar al menos un método de cobro');
  return errores;
} 