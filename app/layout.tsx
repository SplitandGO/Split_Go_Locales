import { ChakraProvider } from '@chakra-ui/react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Split&Go - Gestión de Restaurantes',
  description: 'Aplicación moderna para la gestión de restaurantes y bares',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </body>
    </html>
  )
} 