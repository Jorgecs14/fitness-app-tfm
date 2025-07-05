# 🏋️ Fitness App TFM - Sistema de Gestión Fitness Completo

Aplicación web full-stack desarrollada como **Trabajo de Fin de Máster** para la gestión integral de entrenadores fitness. Permite administrar clientes, crear dietas personalizadas, diseñar rutinas de ejercicio y gestionar un catálogo de productos fitness.

Desarrollado con **React 19**, **TypeScript**, **Node.js**, **Express**, **Supabase** y desplegado en **Vercel**.

## 🏗️ Documentación de Arquitectura

Para entender cómo está construido el sistema, revisa estos documentos:

- **[Arquitectura General](./ARQUITECTURA.md)** - Visión completa del sistema, tecnologías y decisiones de diseño
- **[Arquitectura Frontend](./ARQUITECTURA_FRONTEND.md)** - Estructura detallada de la aplicación React
- **[Arquitectura Backend](./ARQUITECTURA_BACKEND.md)** - Diseño de la API REST y base de datos

## 📚 Documentación y Tutoriales

Este proyecto incluye documentación detallada para aprender paso a paso:

1. **[TypeScript y Componentes](./1_TYPESCRIPT_Y_COMPONENTES.md)** - Aprende a configurar TypeScript en React y crear componentes reutilizables
2. **[Backend para TypeScript](./2_BACKEND_PARA_TYPESCRIPT.md)** - Cómo crear un backend Express que funcione con TypeScript
3. **[Navegación con React Router](./3_NAVEGACION_REACT_ROUTER.md)** - Implementa navegación entre páginas con React Router
4. **[Docker y PostgreSQL](./4_DOCKER_POSTGRES_TUTORIAL.md)** - Tutorial para migrar de memoria a base de datos PostgreSQL con Docker
5. **[Autentificación Supabase](./5_AUTENTICACION_SUPABASE.md)** - Tutorial para implementar Auth con Supabase
6. **[Crear una Landing Page](./6_LANDING_PAGE.md)** - Implementar una Landing Page para el usuario
7. **[Añadir Google Auth con Supabase](./7_AUTENTICACION_GOOGLE.md)** - Integrar Google Auth provider con Supabase

## 🚀 Características Principales

- 🔐 **Sistema de autenticación completo** con Supabase Auth (email/password + Google OAuth)
- 👥 **Gestión avanzada de usuarios** con roles, perfiles y estadísticas detalladas
- 🏋️ **Rutinas de ejercicios personalizables** con biblioteca completa de ejercicios
- 🥗 **Planificación nutricional avanzada** con seguimiento calórico y macronutrientes
- 🛒 **Catálogo de productos fitness** tipo e-commerce con gestión completa
- 📊 **Dashboard interactivo** con métricas, gráficos y estadísticas en tiempo real
- 📄 **Exportación de datos** en formatos PDF, Excel y CSV
- 📱 **Diseño responsive** optimizado para móviles, tablets y desktop
- 🎨 **Interfaz moderna** con Material Design System
- ☁️ **Infraestructura cloud** con Supabase y despliegue automático en Vercel

## 🛠️ Stack Tecnológico

### Frontend

- **React 19.1.0** - Biblioteca de UI con las últimas características
- **TypeScript 5.8.3** - JavaScript con tipado estático para mayor robustez
- **Vite 6.3.5** - Build tool ultrarrápido con HMR
- **React Router DOM 7.6.2** - Enrutamiento SPA con navegación dinámica
- **Material-UI v7.0.1** - Sistema de diseño moderno y componentes profesionales
- **Supabase Client 2.50.2** - Cliente oficial para autenticación y base de datos
- **Axios 1.10.0** - Cliente HTTP para comunicación con APIs
- **ApexCharts 4.5.0** - Biblioteca de gráficos interactivos y visualización
- **jsPDF & XLSX** - Exportación de documentos en múltiples formatos
- **ESLint 9.25.0** - Análisis estático de código para calidad y consistencia

### Backend

- **Node.js** - Runtime JavaScript del lado del servidor
- **Express.js 5.1.0** - Framework web minimalista y flexible
- **Supabase 2.50.1** - Backend-as-a-Service completo
- **PostgreSQL** - Base de datos relacional robusta (gestionada por Supabase)
- **JWT (JSON Web Tokens)** - Autenticación y autorización segura
- **CORS 2.8.5** - Middleware para peticiones cross-origin
- **Nodemon 3.1.10** - Auto-restart en desarrollo
- **dotenv 16.5.0** - Gestión de variables de entorno

### Infraestructura y Despliegue

- **Supabase Cloud** - BaaS con PostgreSQL, Auth, Storage y Edge Functions
- **Vercel** - Plataforma de despliegue con CI/CD automático
- **Docker** - Contenedorización para desarrollo local (opcional)
- **GitHub** - Control de versiones y integración continua

## 📁 Estructura del Proyecto

```
fitness-app-tfm/
├── 📄 README.md                 # Documentación principal
├── 📄 docker-compose.yml        # Configuración Docker para PostgreSQL local
├── 📄 ARQUITECTURA*.md          # Documentación técnica detallada
├── 📄 *_TUTORIAL.md             # Tutoriales paso a paso
├── 📁 backend/                  # API REST con Express.js
│   ├── 📄 index.js             # Servidor principal y configuración
│   ├── 📄 package.json         # Dependencias backend
│   ├── 📄 vercel.json          # Configuración despliegue Vercel
│   ├── 📁 database/            # Configuración y esquemas de BD
│   │   ├── 📄 schema.sql       # Schema PostgreSQL completo
│   │   ├── 📄 fix_trigger.sql  # Scripts de mantenimiento
│   │   └── 📄 supabaseClient.js # Cliente Supabase configurado
│   ├── 📁 middleware/          # Middlewares de Express
│   │   └── 📄 auth.js          # Autenticación JWT y Supabase
│   └── 📁 routes/              # Endpoints de la API REST
│       ├── 📄 users.js         # CRUD usuarios
│       ├── 📄 diets.js         # CRUD dietas
│       ├── 📄 workouts.js      # CRUD rutinas
│       ├── 📄 exercises.js     # CRUD ejercicios
│       ├── 📄 foods.js         # CRUD alimentos
│       ├── 📄 diet_foods.js    # Relación dietas-alimentos
│       ├── 📄 workouts_exercises.js # Relación rutinas-ejercicios
│       └── 📄 ecommerce.js     # CRUD productos
└── 📁 frontend/                # Aplicación React con TypeScript
    ├── 📄 package.json         # Dependencias frontend
    ├── 📄 vercel.json          # Configuración despliegue Vercel
    ├── 📄 vite.config.ts       # Configuración Vite
    ├── 📄 tsconfig.json        # Configuración TypeScript
    ├── 📁 public/              # Assets estáticos
    │   └── 🖼️ logo_*.png        # Logos de la aplicación
    └── 📁 src/                 # Código fuente React
        ├── 📄 App.tsx          # Componente raíz y rutas
        ├── 📄 main.tsx         # Punto de entrada React
        ├── 📄 config-global.ts # Configuración global
        ├── 📁 components/      # Componentes reutilizables organizados por módulo
        │   ├── 📁 User/        # Componentes gestión usuarios
        │   ├── 📁 Diet/        # Componentes gestión dietas
        │   ├── 📁 Product/     # Componentes catálogo productos
        │   └── 📁 Workouts/    # Componentes rutinas ejercicios
        ├── 📁 pages/           # Páginas principales de la app
        │   ├── 📄 LandingPage.tsx    # Página inicio/marketing
        │   ├── 📄 HomePage.tsx       # Dashboard principal
        │   ├── 📄 SignInPage.tsx     # Página login
        │   ├── 📄 SignUpPage.tsx     # Página registro
        │   ├── 📄 UsersPage.tsx      # Gestión usuarios
        │   ├── 📄 DietsPage.tsx      # Gestión dietas
        │   ├── 📄 WorkoutsPage.tsx   # Gestión rutinas
        │   ├── 📄 ProductsPage.tsx   # Catálogo productos
        │   ├── 📄 ProfilePage.tsx    # Perfil usuario
        │   └── 📄 UserDetailPage.tsx # Detalle usuario específico
        ├── 📁 services/        # Servicios para llamadas API
        │   ├── 📄 userService.ts          # API calls usuarios
        │   ├── 📄 dietService.ts          # API calls dietas
        │   ├── 📄 workoutService.ts       # API calls rutinas
        │   ├── 📄 exerciseService.ts      # API calls ejercicios
        │   ├── 📄 foodService.ts          # API calls alimentos
        │   ├── 📄 productService.ts       # API calls productos
        │   ├── 📄 dietFoodService.ts      # API calls dietas-alimentos
        │   ├── 📄 workoutExerciseService.ts # API calls rutinas-ejercicios
        │   └── 📄 notificationService.ts  # Servicio notificaciones
        ├── 📁 types/           # Definiciones TypeScript
        │   ├── 📄 User.ts      # Tipos usuario
        │   ├── 📄 Diet.ts      # Tipos dieta
        │   ├── 📄 Workout.ts   # Tipos rutina
        │   ├── 📄 Exercise.ts  # Tipos ejercicio
        │   ├── 📄 Food.ts      # Tipos alimento
        │   ├── 📄 Product.ts   # Tipos producto
        │   └── 📄 *.ts         # Otros tipos y relaciones
        ├── 📁 layouts/         # Layouts y navegación
        │   ├── 📄 dashboard-layout.tsx    # Layout principal dashboard
        │   ├── 📄 nav-config-dashboard.tsx # Configuración navegación
        │   ├── 📁 dashboard/   # Componentes layout dashboard
        │   ├── 📁 core/        # Componentes core layout
        │   └── 📁 auth/        # Layout páginas autenticación
        ├── 📁 lib/             # Configuración librerías externas
        │   ├── 📄 supabase.ts  # Cliente Supabase configurado
        │   └── 📄 axios.ts     # Cliente Axios configurado
        ├── 📁 utils/           # Utilidades y helpers
        │   ├── 📁 hooks/       # Custom React hooks
        │   ├── 📁 chart/       # Utilidades gráficos ApexCharts
        │   ├── 📁 iconify/     # Configuración iconos Iconify
        │   ├── 📁 notifications/ # Sistema notificaciones toast
        │   └── 📄 dietUtils.ts # Utilidades específicas dietas
        ├── 📁 theme/           # Configuración tema Material-UI
        │   ├── 📄 theme-config.ts    # Configuración tema principal
        │   ├── 📄 create-classes.ts  # Clases CSS dinámicas
        │   └── 📄 theme-provider.tsx # Proveedor tema React
        └── 📁 styles/          # Estilos CSS globales
            ├── 📄 global.css   # Estilos globales
            └── 📄 components.css # Estilos componentes específicos
```

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** (v18 o superior)
- **npm** o **yarn** como gestor de paquetes
- **Git** para control de versiones
- **Cuenta en Supabase** (gratuita) para base de datos y autenticación
- **Cuenta en Vercel** (opcional, para despliegue)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/fitness-app-tfm.git
cd fitness-app-tfm
```

### 2. Configurar Supabase (Backend-as-a-Service)

#### Crear Proyecto en Supabase

1. Ir a [Supabase](https://supabase.com) y crear una cuenta
2. Crear un nuevo proyecto
3. Elegir región cercana (recomendado: Europe West)
4. Esperar a que se complete la configuración

#### Obtener Credenciales

En el panel de Supabase, ir a **Settings > API**:

- **Project URL**: `https://tu-proyecto.supabase.co`
- **Anon (public) key**: Para operaciones cliente
- **Service role key**: Para operaciones administrativas (backend)

#### Configurar Base de Datos

1. En Supabase, ir a **SQL Editor**
2. Ejecutar el script completo `backend/database/schema.sql`
3. Verificar que todas las tablas se crearon correctamente

#### Configurar Autenticación

1. En **Authentication > Settings**:

   - Habilitar **Email confirmation** si deseas verificación por email
   - Configurar **Site URL**: `http://localhost:5173` (desarrollo)
   - Para producción: `https://tu-app.vercel.app`

2. **Proveedores OAuth** (opcional):
   - Ir a **Authentication > Providers**
   - Configurar Google OAuth si deseas login con Google
   - Añadir **Client ID** y **Client Secret** de Google Console

### 3. Configurar Variables de Entorno

#### Backend (.env)

Crear archivo `.env` en la carpeta `backend/`:

```env
# Configuración Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Configuración Servidor
PORT=5000
NODE_ENV=development

# JWT (Opcional - se usa Supabase Auth)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
```

#### Frontend (.env)

Crear archivo `.env` en la carpeta `frontend/`:

```env
# Configuración Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Configuración API
VITE_API_URL=http://localhost:5000
VITE_API_URL_PROD=https://tu-backend.vercel.app

# Configuración App
VITE_APP_NAME=Fitness App TFM
VITE_APP_VERSION=1.0.0
```

### 4. Instalar Dependencias y Ejecutar

#### Backend

```bash
cd backend
npm install
npm run dev
```

✅ Servidor disponible en `http://localhost:5000`

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Aplicación disponible en `http://localhost:5173`

### 5. Desarrollo Local con Docker (Alternativo)

Si prefieres usar PostgreSQL local en lugar de Supabase Cloud:

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Ejecutar schema en PostgreSQL local
cd backend/database
psql -h localhost -U fitness_user -d fitness_db -f schema.sql
```

Actualizar variables de entorno para usar base de datos local:

```env
# En backend/.env
DATABASE_URL=postgresql://fitness_user:fitness_pass@localhost:5432/fitness_db
USE_LOCAL_DB=true
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### 👥 `users` - Gestión de Usuarios

```sql
CREATE TABLE public.users (
  id integer PRIMARY KEY,
  email character varying,
  name character varying,
  surname character varying,
  birth_date date,
  created_at timestamp DEFAULT now(),
  role character varying,
  auth_user_id uuid UNIQUE,
  CONSTRAINT fk_users_auth_user_id FOREIGN KEY (auth_user_id)
    REFERENCES auth.users(id)
);
```

#### 🏋️ `workouts` - Rutinas de Ejercicio

```sql
CREATE TABLE public.workouts (
  id integer PRIMARY KEY,
  user_id integer,
  name character varying,
  category character varying,
  notes text,
  CONSTRAINT workouts_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id)
);
```

#### 💪 `exercises` - Catálogo de Ejercicios

```sql
CREATE TABLE public.exercises (
  id integer PRIMARY KEY,
  name character varying,
  description text,
  execution_time integer
);
```

#### 🔗 `workout_exercises` - Ejercicios por Rutina

```sql
CREATE TABLE public.workout_exercises (
  id integer PRIMARY KEY,
  workout_id integer,
  exercise_id integer,
  sets integer,
  reps integer,
  CONSTRAINT workout_exercises_workout_id_fkey FOREIGN KEY (workout_id)
    REFERENCES public.workouts(id),
  CONSTRAINT workout_exercises_exercise_id_fkey FOREIGN KEY (exercise_id)
    REFERENCES public.exercises(id)
);
```

#### 🥗 `diets` - Planes Nutricionales

```sql
CREATE TABLE public.diets (
  id integer PRIMARY KEY,
  name character varying,
  description text,
  calories smallint
);
```

#### 🍎 `foods` - Catálogo de Alimentos

```sql
CREATE TABLE public.foods (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text,
  calories integer NOT NULL
);
```

#### 🔗 `diet_foods` - Alimentos por Dieta

```sql
CREATE TABLE public.diet_foods (
  id integer PRIMARY KEY,
  diet_id integer,
  food_id integer,
  quantity integer NOT NULL,
  CONSTRAINT diet_foods_diet_id_fkey FOREIGN KEY (diet_id)
    REFERENCES public.diets(id),
  CONSTRAINT diet_foods_food_id_fkey FOREIGN KEY (food_id)
    REFERENCES public.foods(id)
);
```

#### 📋 `user_diets` - Asignación de Dietas

```sql
CREATE TABLE public.user_diets (
  id integer PRIMARY KEY,
  user_id integer NOT NULL,
  diet_id integer NOT NULL,
  assigned_at timestamp DEFAULT now(),
  CONSTRAINT user_diets_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id),
  CONSTRAINT user_diets_diet_id_fkey FOREIGN KEY (diet_id)
    REFERENCES public.diets(id)
);
```

#### 🛒 `products` - Catálogo E-commerce

```sql
CREATE TABLE public.products (
  id integer PRIMARY KEY,
  name character varying,
  description text,
  price numeric
);
```

### Relaciones del Esquema

```
users (1:N) workouts (M:N) exercises
users (1:N) user_diets (M:N) diets (M:N) foods
products (independiente)
auth.users (1:1) users (integración Supabase Auth)
```

### Características de Seguridad

- **Row Level Security (RLS)** configurado en Supabase
- **Integración nativa** con Supabase Auth
- **Foreign Keys** para integridad referencial
- **Timestamps automáticos** para auditoría

## � API REST - Documentación Completa

### 🔐 Autenticación

La API utiliza **Supabase Auth** con tokens JWT. Todos los endpoints protegidos requieren header de autorización.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Endpoints de Autenticación

```
POST   /api/auth/login          # Iniciar sesión con email/password
POST   /api/auth/register       # Registrar nuevo usuario
POST   /api/auth/logout         # Cerrar sesión
GET    /api/auth/profile        # Obtener perfil usuario autenticado
POST   /api/auth/refresh        # Renovar token de acceso
POST   /api/auth/forgot         # Solicitar reset de contraseña
```

### 👥 Gestión de Usuarios

```
GET    /api/users               # Listar usuarios (admin/paginado)
GET    /api/users/:id           # Obtener usuario específico
POST   /api/users               # Crear nuevo usuario (admin)
PUT    /api/users/:id           # Actualizar datos usuario
DELETE /api/users/:id           # Eliminar usuario (soft delete)
GET    /api/users/:id/stats     # Estadísticas usuario específico
GET    /api/users/:id/workouts  # Rutinas asignadas al usuario
GET    /api/users/:id/diets     # Dietas asignadas al usuario
```

**Ejemplo Request - Crear Usuario:**

```json
POST /api/users
{
  "email": "usuario@ejemplo.com",
  "name": "Juan",
  "surname": "Pérez",
  "birth_date": "1990-05-15",
  "role": "client"
}
```

### 🏋️ Gestión de Rutinas

```
GET    /api/workouts            # Listar rutinas del usuario autenticado
POST   /api/workouts            # Crear nueva rutina
GET    /api/workouts/:id        # Obtener rutina específica con ejercicios
PUT    /api/workouts/:id        # Actualizar rutina
DELETE /api/workouts/:id        # Eliminar rutina
POST   /api/workouts/:id/assign # Asignar rutina a usuario
```

**Ejemplo Request - Crear Rutina:**

```json
POST /api/workouts
{
  "name": "Rutina Fuerza Superior",
  "category": "Fuerza",
  "notes": "Enfoque en músculos del tren superior",
  "user_id": 1
}
```

### 💪 Gestión de Ejercicios

```
GET    /api/exercises           # Listar todos los ejercicios
GET    /api/exercises/:id       # Obtener ejercicio específico
POST   /api/exercises           # Crear nuevo ejercicio
PUT    /api/exercises/:id       # Actualizar ejercicio
DELETE /api/exercises/:id       # Eliminar ejercicio
GET    /api/exercises/search    # Buscar ejercicios por nombre/categoría
```

**Ejemplo Request - Crear Ejercicio:**

```json
POST /api/exercises
{
  "name": "Press Banca",
  "description": "Ejercicio básico para pecho, tríceps y hombros",
  "execution_time": 45
}
```

### 🔗 Ejercicios en Rutinas

```
GET    /api/workouts/:id/exercises     # Obtener ejercicios de una rutina
POST   /api/workouts/:id/exercises     # Añadir ejercicio a rutina
PUT    /api/workouts/:workoutId/exercises/:exerciseId # Actualizar sets/reps
DELETE /api/workouts/:workoutId/exercises/:exerciseId # Quitar ejercicio
```

**Ejemplo Request - Añadir Ejercicio a Rutina:**

```json
POST /api/workouts/1/exercises
{
  "exercise_id": 5,
  "sets": 4,
  "reps": 12
}
```

### 🥗 Gestión de Dietas

```
GET    /api/diets               # Listar dietas del usuario autenticado
POST   /api/diets               # Crear nueva dieta
GET    /api/diets/:id           # Obtener dieta específica con alimentos
PUT    /api/diets/:id           # Actualizar dieta
DELETE /api/diets/:id           # Eliminar dieta
POST   /api/diets/:id/assign    # Asignar dieta a usuario
GET    /api/diets/:id/export    # Exportar dieta en PDF
```

**Ejemplo Request - Crear Dieta:**

```json
POST /api/diets
{
  "name": "Dieta Hipocalórica",
  "description": "Plan nutricional para pérdida de peso",
  "calories": 1800
}
```

### 🍎 Gestión de Alimentos

```
GET    /api/foods               # Listar todos los alimentos
GET    /api/foods/:id           # Obtener alimento específico
POST   /api/foods               # Crear nuevo alimento
PUT    /api/foods/:id           # Actualizar alimento
DELETE /api/foods/:id           # Eliminar alimento
GET    /api/foods/search        # Buscar alimentos por nombre
```

**Ejemplo Request - Crear Alimento:**

```json
POST /api/foods
{
  "name": "Pechuga de Pollo",
  "description": "Proteína magra de alta calidad",
  "calories": 165
}
```

### 🔗 Alimentos en Dietas

```
GET    /api/diets/:id/foods            # Obtener alimentos de una dieta
POST   /api/diets/:id/foods            # Añadir alimento a dieta
PUT    /api/diets/:dietId/foods/:foodId # Actualizar cantidad de alimento
DELETE /api/diets/:dietId/foods/:foodId # Quitar alimento de dieta
```

**Ejemplo Request - Añadir Alimento a Dieta:**

```json
POST /api/diets/1/foods
{
  "food_id": 3,
  "quantity": 150
}
```

### 📋 Asignación de Dietas a Usuarios

```
GET    /api/user-diets          # Listar asignaciones de dietas
POST   /api/user-diets          # Asignar dieta a usuario
DELETE /api/user-diets/:id      # Desasignar dieta de usuario
GET    /api/users/:id/diets     # Obtener dietas asignadas a usuario
```

### 🛒 Catálogo de Productos (E-commerce)

```
GET    /api/ecommerce/products         # Listar productos con filtros y paginación
POST   /api/ecommerce/products         # Crear nuevo producto
GET    /api/ecommerce/products/:id     # Obtener producto específico
PUT    /api/ecommerce/products/:id     # Actualizar producto
DELETE /api/ecommerce/products/:id     # Eliminar producto
GET    /api/ecommerce/categories       # Listar categorías de productos
GET    /api/ecommerce/products/search  # Buscar productos por nombre/categoría
```

**Ejemplo Request - Crear Producto:**

```json
POST /api/ecommerce/products
{
  "name": "Whey Protein 2kg",
  "description": "Proteína de suero de alta calidad",
  "price": 49.99
}
```

### 📊 Estadísticas y Reportes

```
GET    /api/stats/dashboard      # Estadísticas generales del dashboard
GET    /api/stats/users          # Estadísticas de usuarios
GET    /api/stats/workouts       # Estadísticas de rutinas
GET    /api/stats/diets          # Estadísticas de dietas
GET    /api/stats/products       # Estadísticas de productos
```

### 📤 Exportación de Datos

```
GET    /api/export/users         # Exportar usuarios (Excel/CSV)
GET    /api/export/workouts      # Exportar rutinas (PDF/Excel)
GET    /api/export/diets         # Exportar dietas (PDF/Excel)
GET    /api/export/products      # Exportar productos (Excel/CSV)
```

### 🔍 Parámetros de Query Comunes

#### Paginación

```
?page=1&limit=10&offset=0
```

#### Filtros

```
?search=protein&category=supplements&sort=name&order=asc
```

#### Expansión de Relaciones

```
?include=exercises,user&expand=diet_foods
```

### 📝 Códigos de Respuesta HTTP

- **200 OK** - Solicitud exitosa
- **201 Created** - Recurso creado exitosamente
- **400 Bad Request** - Error en la solicitud del cliente
- **401 Unauthorized** - Token de autenticación inválido o ausente
- **403 Forbidden** - Sin permisos para acceder al recurso
- **404 Not Found** - Recurso no encontrado
- **409 Conflict** - Conflicto con el estado actual del recurso
- **422 Unprocessable Entity** - Error de validación
- **500 Internal Server Error** - Error interno del servidor

### 🛡️ Seguridad de la API

#### Rate Limiting

- **100 requests/minuto** para usuarios autenticados
- **20 requests/minuto** para endpoints públicos

#### Validación de Datos

- Validación de esquemas JSON con **Joi** o similar
- Sanitización de entradas para prevenir **SQL injection**
- Validación de tipos TypeScript en tiempo de compilación

#### Headers de Seguridad

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

## 🔧 Scripts de Desarrollo y Producción

### Backend Scripts

```bash
cd backend

# Desarrollo con auto-reload
npm run dev

# Ejecutar en producción
npm start

# Instalar dependencias
npm install

# Verificar sintaxis (linting)
npm run lint  # (si está configurado)

# Tests (si están implementados)
npm test
```

### Frontend Scripts

```bash
cd frontend

# Servidor de desarrollo con HMR
npm run dev

# Build optimizado para producción
npm run build

# Preview del build de producción
npm run preview

# Análisis de código con ESLint
npm run lint

# Instalar dependencias
npm install

# Tests unitarios (si están implementados)
npm test

# Coverage de tests
npm run test:coverage
```

### Scripts de Utilidad

```bash
# Desde la raíz del proyecto

# Instalar dependencias en ambos proyectos
npm run install:all  # (si está configurado)

# Build completo (frontend + backend)
npm run build:all

# Desarrollo completo (ambos servidores)
npm run dev:all

# Limpiar node_modules y reinstalar
npm run clean:install
```

## 🧪 Testing y Calidad del Código

### Testing Framework

```bash
# Frontend - Testing con Vitest
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Backend - Testing con Jest
cd backend
npm install --save-dev jest supertest @types/jest
```

### Estructura de Tests

```
frontend/src/
├── __tests__/           # Tests unitarios
├── components/
│   └── __tests__/       # Tests de componentes
├── services/
│   └── __tests__/       # Tests de servicios
└── utils/
    └── __tests__/       # Tests de utilidades

backend/
├── __tests__/           # Tests de API
├── routes/
│   └── __tests__/       # Tests de rutas
└── middleware/
    └── __tests__/       # Tests de middleware
```

### Comandos de Testing

```bash
# Frontend
npm run test              # Ejecutar todos los tests
npm run test:watch        # Modo watch para desarrollo
npm run test:coverage     # Generar reporte de cobertura
npm run test:ui           # Interfaz visual de tests

# Backend
npm test                  # Ejecutar tests de API
npm run test:integration  # Tests de integración
npm run test:e2e          # Tests end-to-end
```

### Code Quality

```bash
# ESLint para análisis estático
npm run lint
npm run lint:fix

# Prettier para formateo (si está configurado)
npm run format
npm run format:check

# TypeScript compilation check
npm run type-check
```

## 📈 Performance y Optimización

### Métricas del Frontend

- **Bundle Size**: < 500KB gzipped
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Técnicas de Optimización

```javascript
// Code Splitting con React.lazy
const LazyComponent = React.lazy(() => import('./HeavyComponent'))

// Memo para componentes pesados
const MemoizedComponent = React.memo(ExpensiveComponent)

// useMemo para cálculos costosos
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// useCallback para funciones estables
const stableCallback = useCallback(() => {
  doSomething()
}, [dependency])
```

### Optimizaciones Backend

```javascript
// Connection pooling (automático en Supabase)
// Compression middleware
app.use(compression())

// Rate limiting
const rateLimit = require('express-rate-limit')
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de requests por IP
  })
)
```

## 🛡️ Seguridad

### Frontend Security

- **Environment Variables**: Prefijo `VITE_` para variables públicas
- **XSS Protection**: Sanitización automática de React
- **CSRF Protection**: Tokens en requests sensibles
- **Content Security Policy**: Headers configurados

### Backend Security

- **Authentication**: JWT tokens con Supabase
- **Authorization**: Role-based access control
- **Input Validation**: Validación de esquemas
- **SQL Injection Prevention**: Prepared statements
- **Rate Limiting**: Protección contra DDoS

### Configuración Supabase Security

```sql
-- Row Level Security policies
CREATE POLICY "Users can only see own data" ON users
  FOR ALL USING (auth.uid() = auth_user_id);

-- Función para verificar admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM users WHERE auth_user_id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🤝 Contribución al Proyecto

### Workflow de Contribución

1. **Fork** el repositorio en GitHub
2. **Crear rama feature** desde `main`:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Desarrollar** la funcionalidad con commits descriptivos:
   ```bash
   git commit -m "feat: añadir sistema de notificaciones push"
   ```
4. **Testear** los cambios localmente
5. **Push** a tu fork:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
6. **Crear Pull Request** con descripción detallada

### Estándares de Código

#### Conventional Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo de código
refactor: refactorización sin cambios funcionales
test: añadir o corregir tests
chore: tareas de mantenimiento
```

#### Code Style

- **ESLint** configurado para TypeScript y React
- **Prettier** para formateo automático (opcional)
- **2 espacios** para indentación
- **camelCase** para variables y funciones
- **PascalCase** para componentes React
- **SCREAMING_SNAKE_CASE** para constantes

#### Git Hooks (Pre-commit)

```bash
# Instalar husky para hooks automáticos
npm install --save-dev husky lint-staged

# Pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

### Guidelines para Pull Requests

- **Descripción clara** del problema y solución
- **Screenshots** para cambios visuales
- **Tests** que validen la funcionalidad
- **Documentación** actualizada si es necesario
- **Backward compatibility** mantenida

## 🏆 Proyecto TFM - Información Académica

### Contexto Académico

Este proyecto fue desarrollado como **Trabajo de Fin de Máster** para demostrar competencias en:

- **Desarrollo Full-Stack** moderno
- **Arquitectura de software** escalable
- **Integración de servicios cloud** (Supabase, Vercel)
- **Metodologías ágiles** y DevOps
- **Documentación técnica** completa

### Características Destacadas del TFM

#### 🏗️ Arquitectura Técnica

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + Supabase
- **Base de Datos**: PostgreSQL con relaciones complejas
- **Autenticación**: Supabase Auth con OAuth
- **Despliegue**: CI/CD automático con Vercel

#### 📊 Métricas del Proyecto

- **Líneas de código**: ~15,000+ (frontend + backend)
- **Componentes React**: 25+ componentes reutilizables
- **Endpoints API**: 40+ endpoints RESTful
- **Tablas de BD**: 8 tablas con relaciones complejas
- **Páginas**: 10+ páginas funcionales completas

#### 🎯 Funcionalidades Implementadas

- Sistema de autenticación completo
- CRUD completo para todas las entidades
- Dashboard con gráficos interactivos
- Sistema de exportación de datos
- Interfaz responsive y moderna
- API REST documentada
- Tests unitarios y de integración

#### 📚 Documentación Técnica

- **Arquitectura del sistema** detallada
- **Guías de instalación** paso a paso
- **Documentación de API** completa
- **Tutoriales** para aprendizaje
- **Casos de uso** y user stories

### Evaluación y Resultados

- **Funcionalidad**: ✅ Implementación completa
- **Calidad del código**: ✅ Estándares profesionales
- **Documentación**: ✅ Documentación exhaustiva
- **Innovación**: ✅ Stack tecnológico moderno
- **Escalabilidad**: ✅ Arquitectura preparada para crecimiento

## � Contacto y Soporte

### 👥 Equipo de Desarrollo

- **Víctor Peinado** - [peinado.victor17@gmail.com](mailto:peinado.victor17@gmail.com)
- **Jorge Caba** - [jorgecabaserrano@gmail.com](mailto:jorgecabaserrano@gmail.com)
- **María del Mar Aponte** - [mariadelmar.aponteb@gmail.com](mailto:mariadelmar.aponteb@gmail.com)
- **David Bertos** - [davidbertos2@gmail.com](mailto:davidbertos2@gmail.com)

### 🎓 Información Académica

- **Tutor del Proyecto**: Adrián Alonso - [adrianalonsodev@gmail.com](mailto:adrianalonsodev@gmail.com)
- **Institución**: Cámara de Comercio de Granada
- **Curso Académico**: 2024-2025

---

## 🌟 Agradecimientos

- **Supabase Team** por proporcionar una plataforma BaaS excepcional
- **Vercel Team** por la infraestructura de despliegue
- **React Community** por las librerías y componentes
- **Material-UI Team** por el sistema de diseño
- **Open Source Community** por las herramientas utilizadas

---

⭐ **¡Si este proyecto te resulta útil para tu aprendizaje, no olvides darle una estrella!** ⭐

💡 **Para preguntas específicas sobre el código o implementación, crea un issue en GitHub.**
