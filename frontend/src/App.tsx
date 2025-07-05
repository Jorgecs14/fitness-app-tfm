/**
 * Componente raíz de la aplicación fitness-app-tfm
 * Envuelve toda la aplicación con el ThemeProvider para gestión de temas
 */

import './styles/global.css'

import { ThemeProvider } from './theme/theme-provider'

type AppProps = {
  children: React.ReactNode
}

export default function App({ children }: AppProps) {
  return <ThemeProvider>{children}</ThemeProvider>
}
