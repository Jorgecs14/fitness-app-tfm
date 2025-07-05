// Utilidad para crear nombres de clases CSS con prefijo del tema
import { themeConfig } from './theme-config'

export function createClasses(className: string): string {
  return `${themeConfig.classesPrefix}__${className}`
}
