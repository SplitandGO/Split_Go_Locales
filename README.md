# Split&Go - Aplicación para Clientes

Split&Go es una aplicación moderna diseñada para mejorar la experiencia de pago en restaurantes y bares, permitiendo a los comensales dividir la cuenta de forma sencilla, precisa e independiente.

## Características para Clientes

* Acceso mediante código QR único por mesa
* Visualización de carta digital
* Selección individual de productos consumidos
* División automática de cuenta
* Pago individual mediante tarjeta, Apple Pay o Google Pay
* Historial de pedidos
* Soporte multiidioma

## Tecnologías Utilizadas

* Frontend: Next.js, React
* Backend: Supabase
* Pagos: Stripe
* Despliegue: Vercel
* Base de datos: PostgreSQL
* Autenticación: Supabase Auth
* Notificaciones: Firebase Cloud Messaging

## Requisitos del Sistema

* Node.js 18.x o superior
* npm 9.x o superior
* Cuenta de Supabase
* Cuenta de Stripe
* Cuenta de Vercel

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/SplitandGO/Split_Go_Clientes.git
```

2. Instalar dependencias:
```bash
cd Split_Go_Clientes
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
Split_Go_Clientes/
├── app/                    # Directorio principal de la aplicación
│   ├── (auth)/            # Rutas de autenticación
│   ├── carta/             # Carta digital
│   ├── pedidos/           # Gestión de pedidos
│   └── components/        # Componentes reutilizables
├── lib/                   # Utilidades y configuraciones
└── public/               # Archivos estáticos
```

## Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE.md para más detalles.

## Contacto

Split&Go Team - @SplitandGO

Link del Proyecto: https://github.com/SplitandGO/Split_Go_Clientes