# 🏋️ CRUD de Clientes con TypeScript - Entrenador Fitness

Este proyecto es un ejemplo completo de una aplicación CRUD (Create, Read, Update, Delete) para gestionar clientes de un entrenador fitness, implementado con TypeScript y componentes React separados.

## 📚 Tutoriales

### [1. TypeScript y Separación de Componentes (Frontend)](./1_TYPESCRIPT_Y_COMPONENTES.md)
- ✅ Configurar TypeScript en React
- ✅ Definir interfaces y tipos seguros
- ✅ Separar la aplicación en componentes reutilizables
- ✅ Crear un servicio API centralizado
- ✅ Manejar estados con tipos de TypeScript

### [2. Backend para TypeScript](./2_BACKEND_PARA_TYPESCRIPT.md)
- ✅ Cómo adaptar el backend Express para TypeScript
- ✅ Configuración de CORS para comunicación frontend-backend
- ✅ Estructura de datos que coincide con los tipos del frontend
- ✅ Endpoints RESTful para el CRUD completo

## 🚀 Inicio Rápido

### Requisitos previos
- Node.js instalado
- npm o yarn
- Dos terminales disponibles

### Instalación y ejecución

**Terminal 1 - Backend:**
```bash
cd backend
npm install
node index.js
# Servidor corriendo en http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
# Aplicación disponible en http://localhost:5173
```

## 📁 Estructura del Proyecto

```
RepoEjemplo/
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React separados
│   │   │   ├── ClientForm.tsx
│   │   │   ├── ClientList.tsx
│   │   │   └── ClientCard.tsx
│   │   ├── services/         # Comunicación con API
│   │   │   └── api.ts
│   │   ├── types/            # Definiciones TypeScript
│   │   │   └── Client.ts
│   │   └── App.tsx           # Componente principal
│   └── tsconfig.json         # Configuración TypeScript
├── backend/
│   └── index.js              # Servidor Express con endpoints
└── README.md                 # Este archivo
```

## 🎯 Características

- **TypeScript**: Prevención de errores en tiempo de compilación
- **Componentes Separados**: Código organizado y reutilizable
- **API RESTful**: Endpoints claros y estándares HTTP
- **Gestión de Estado**: React hooks con tipos seguros
- **Validaciones**: Tanto en frontend como backend
- **CRUD Completo**: Crear, leer, actualizar y eliminar clientes

## 💡 Próximos Pasos

Este ejemplo está diseñado para que los estudiantes puedan:
1. Adaptarlo a otros módulos (rutinas, dietas, pagos)
2. Integrar múltiples módulos en una sola aplicación
3. Añadir autenticación y autorización
4. Conectar a una base de datos real
5. Desplegar en producción