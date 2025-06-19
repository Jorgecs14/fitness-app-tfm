# 🏋️ Sistema de Gestión Fitness - Full Stack Application

Sistema completo de gestión para entrenadores fitness que permite administrar clientes, dietas, rutinas de ejercicio y productos. Desarrollado con React, TypeScript, Node.js y Express.

## 📚 Documentación y Tutoriales

Este proyecto incluye documentación detallada para aprender paso a paso:

1. **[TypeScript y Componentes](./1_TYPESCRIPT_Y_COMPONENTES.md)** - Aprende a configurar TypeScript en React y crear componentes reutilizables
2. **[Backend para TypeScript](./2_BACKEND_PARA_TYPESCRIPT.md)** - Cómo crear un backend Express que funcione con TypeScript
3. **[Navegación con React Router](./3_NAVEGACION_REACT_ROUTER.md)** - Implementa navegación entre páginas con React Router
4. **[Docker y PostgreSQL](./4_DOCKER_POSTGRES_TUTORIAL.md)** - Tutorial para migrar de memoria a base de datos PostgreSQL con Docker

## 🚀 Características Principales

- **Gestión de Clientes**: CRUD completo para administrar información de clientes
- **Gestión de Dietas**: Crear y asignar planes nutricionales personalizados
- **Gestión de Rutinas**: Diseñar y organizar programas de entrenamiento
- **Catálogo de Productos**: Administrar productos fitness y suplementos
- **Interfaz Moderna**: UI responsive y amigable con React
- **API RESTful**: Backend robusto con Express.js
- **TypeScript**: Código tipado para mayor seguridad y mantenibilidad

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.1.0** - Biblioteca de UI
- **TypeScript 5.8.3** - JavaScript con tipos estáticos
- **Vite 6.3.5** - Herramienta de build ultrarrápida
- **React Router DOM 7.6.2** - Enrutamiento del lado del cliente
- **ESLint** - Linter para mantener calidad del código

### Backend
- **Node.js** - Entorno de ejecución JavaScript
- **Express.js 5.1.0** - Framework web minimalista
- **CORS** - Middleware para peticiones cross-origin
- **Nodemon** - Herramienta de desarrollo con auto-restart

## 📁 Estructura del Proyecto

```
RepoEjemplo/
├── backend/                    # Servidor API Node.js/Express
│   ├── index.js               # Archivo principal del servidor
│   ├── routes/                # Endpoints de la API
│   │   ├── clients.js         # Rutas de gestión de clientes
│   │   ├── diets.js           # Rutas de gestión de dietas
│   │   ├── workouts.js        # Rutas de gestión de rutinas
│   │   └── ecommerce.js       # Rutas de productos/e-commerce
│   └── package.json           # Dependencias del backend
│
├── frontend/                   # Aplicación React/TypeScript
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── Client/        # Componentes de clientes
│   │   │   ├── Diet/          # Componentes de dietas
│   │   │   ├── Product/       # Componentes de productos
│   │   │   └── Workouts/      # Componentes de rutinas
│   │   ├── pages/             # Páginas de la aplicación
│   │   ├── services/          # Capa de servicios API
│   │   ├── types/             # Definiciones de tipos TypeScript
│   │   ├── Layout.tsx         # Layout principal con navegación
│   │   └── main.tsx           # Punto de entrada de la app
│   └── vite.config.js         # Configuración de Vite
│
└── Documentación              # Archivos de tutorial y guías
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js (v14 o superior)
- npm o yarn
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone [url-del-repositorio]
cd RepoEjemplo
```

2. **Configurar el Backend**

Abrir terminal 1:
```bash
cd backend
npm install
npm run dev
```
El servidor estará disponible en `http://localhost:3001`

3. **Configurar el Frontend**

Abrir terminal 2:
```bash
cd frontend
npm install
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

## 📚 Documentación de la API

### Endpoints Disponibles

#### Clientes
- `GET /api/clients` - Obtener todos los clientes
- `GET /api/clients/:id` - Obtener un cliente específico
- `POST /api/clients` - Crear nuevo cliente
- `PUT /api/clients/:id` - Actualizar cliente existente
- `DELETE /api/clients/:id` - Eliminar cliente

#### Dietas
- `GET /api/diets` - Obtener todas las dietas
- `GET /api/diets/:id` - Obtener una dieta específica
- `POST /api/diets` - Crear nueva dieta
- `PUT /api/diets/:id` - Actualizar dieta existente
- `DELETE /api/diets/:id` - Eliminar dieta

#### Rutinas
- `GET /api/workouts` - Obtener todas las rutinas
- `GET /api/workouts/:id` - Obtener una rutina específica
- `POST /api/workouts` - Crear nueva rutina
- `PUT /api/workouts/:id` - Actualizar rutina existente
- `DELETE /api/workouts/:id` - Eliminar rutina

#### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto específico
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:id` - Actualizar producto existente
- `DELETE /api/products/:id` - Eliminar producto

## 🎯 Funcionalidades por Módulo

### Módulo de Clientes
- Registro de información personal (nombre, email, teléfono)
- Establecimiento de objetivos fitness
- Historial de progreso
- Asignación de dietas y rutinas

### Módulo de Dietas
- Creación de planes nutricionales personalizados
- Cálculo de macronutrientes
- Gestión de comidas diarias
- Seguimiento de adherencia

### Módulo de Rutinas
- Diseño de programas de entrenamiento
- Biblioteca de ejercicios
- Planificación semanal
- Registro de progreso

### Módulo de Productos
- Catálogo de productos fitness
- Gestión de inventario
- Información nutricional
- Precios y disponibilidad

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev     # Inicia el servidor con nodemon
```

### Frontend
```bash
npm run dev     # Inicia el servidor de desarrollo
```

## 💡 Próximos Pasos y Mejoras

1. **Base de Datos**: Integrar Postgres
2. **Autenticación**: Implementar Supabase Auth
3. **Dashboard**: Panel de métricas y estadísticas
6. **Tests**: Añadir pruebas unitarias e integración
7. **CI/CD**: Pipeline de despliegue automatizado

## 📝 Notas para Desarrolladores

- El proyecto usa almacenamiento en memoria (sin base de datos persistente)
- Sigue las mejores prácticas de TypeScript y React

## 🤝 Contribuciones

Si deseas contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request