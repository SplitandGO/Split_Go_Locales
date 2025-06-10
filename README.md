# Split&Go - Aplicación de Gestión para Restaurantes

Split&Go es una aplicación moderna diseñada para mejorar la experiencia de pago y gestión en restaurantes y bares, permitiendo a los comensales dividir la cuenta de forma sencilla, precisa e independiente.

## Características Principales

### Para Clientes
- Acceso mediante código QR único por mesa
- Visualización de carta digital
- Selección individual de productos consumidos
- División automática de cuenta
- Pago individual mediante tarjeta, Apple Pay o Google Pay
- Historial de pedidos
- Soporte multiidioma

### Para Meseros
- Gestión completa de mesas
- Registro de pedidos
- Asignación de productos a clientes
- Modificación de cuentas activas
- Comunicación con cocina
- Notificaciones en tiempo real

### Para Cocina
- Visualización de pedidos por orden
- Gestión de pedidos por mesa
- Marcado de pedidos preparados
- Chat interno con meseros

### Para Administradores
- Registro y configuración del restaurante
- Gestión de usuarios y roles
- Edición de carta en tiempo real
- Control de inventario
- Gestión de reservas
- Estadísticas y reportes
- Configuración de propinas
- Modo autoservicio

## Tecnologías Utilizadas

- Frontend: Next.js, React
- Backend: Supabase
- Pagos: Stripe
- Despliegue: Vercel
- Base de datos: PostgreSQL
- Autenticación: Supabase Auth
- Notificaciones: Firebase Cloud Messaging

## Requisitos del Sistema

- Node.js 18.x o superior
- npm 9.x o superior
- Cuenta de Supabase
- Cuenta de Stripe
- Cuenta de Vercel

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/SplitandGO/COdigosfinales.git
```

2. Instalar dependencias:
```bash
cd COdigosfinales
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
COdigosfinales/
├── app/                    # Directorio principal de la aplicación
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Panel de control
│   ├── api/               # API routes
│   └── components/        # Componentes reutilizables
├── lib/                   # Utilidades y configuraciones
├── public/               # Archivos estáticos
└── styles/              # Estilos globales
```

## Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## Contacto

Split&Go Team - [@SplitandGO](https://github.com/SplitandGO)

Link del Proyecto: [https://github.com/SplitandGO/COdigosfinales](https://github.com/SplitandGO/COdigosfinales)