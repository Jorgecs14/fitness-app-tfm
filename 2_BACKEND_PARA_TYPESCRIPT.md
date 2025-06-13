# 2. Cambios en el Backend para TypeScript

## 🎯 ¿Qué cambios necesita el backend?

Para que nuestro frontend con TypeScript funcione correctamente, necesitamos actualizar el backend con:
1. Las rutas correctas (`/api/clientes` en vez de `/api/items`)
2. Los campos que esperan nuestros tipos de TypeScript
3. Datos de ejemplo que tengan sentido para un entrenador fitness

## 📝 Cambios realizados

### 1. Instalación de CORS
```bash
cd backend
npm install cors
```

### 2. Actualización del servidor (backend/index.js)

```javascript
const express = require('express');
const cors = require('cors');  // ← Nuevo: permite comunicación con frontend

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());         // ← Nuevo: habilita CORS
app.use(express.json()); // ← Ya existía: permite recibir JSON
```

### 3. Estructura de datos actualizada

**Antes (Item genérico):**
```javascript
let items = [
  { id: 1, name: 'Item 1', description: 'Descripción del item 1' }
];
```

**Ahora (Cliente fitness):**
```javascript
let clientes = [
  { 
    id: 1, 
    nombre: 'Juan Pérez', 
    email: 'juan@email.com',
    telefono: '555-0101',
    objetivo: 'Perder peso'
  },
  { 
    id: 2, 
    nombre: 'María García', 
    email: 'maria@email.com',
    telefono: '555-0102',
    objetivo: 'Ganar músculo'
  }
];
```

### 4. Endpoints actualizados

Todas las rutas cambiaron de `/api/items` a `/api/clientes`:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clients` | Obtener todos los clientes |
| GET | `/api/clients/:id` | Obtener un cliente específico |
| POST | `/api/clients` | Crear nuevo cliente |
| PUT | `/api/clients/:id` | Actualizar cliente existente |
| DELETE | `/api/clients/:id` | Eliminar cliente |

### 5. Validaciones actualizadas

**Ejemplo en POST/PUT:**
```javascript
app.post('/api/clients', (req, res) => {
  const { nombre, email, telefono, objetivo } = req.body;
  
  // Validamos que TODOS los campos estén presentes
  if (!nombre || !email || !telefono || !objetivo) {
    return res.status(400).json({ 
      error: 'Todos los campos son requeridos' 
    });
  }
  
  // Crear el cliente con la estructura correcta
  const newClient = {
    id: nextId++,
    nombre,    // ← Coincide con Client.ts
    email,     // ← Coincide con Client.ts
    telefono,  // ← Coincide con Client.ts
    objetivo   // ← Coincide con Client.ts
  };
  
  clients.push(newClient);
  res.status(201).json(newClient);
});
```

## 🚀 Cómo ejecutar

**Terminal 1 - Backend:**
```bash
cd backend
npm install        # Si no has instalado las dependencias
node index.js      # Inicia el servidor en puerto 3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install        # Si no has instalado las dependencias
npm run dev        # Inicia Vite en puerto 5173
```

## ⚠️ Puntos importantes

1. **Puerto del backend**: Asegúrate que sea 3001 (no 3005 como antes)
2. **CORS habilitado**: Sin esto, el navegador bloqueará las peticiones
3. **Campos obligatorios**: El backend valida que vengan TODOS los campos
4. **Estructura consistente**: Los nombres de campos en backend deben coincidir EXACTAMENTE con los tipos de TypeScript

## 💡 Para tus módulos

Si estás trabajando en otro módulo (rutinas, dietas, pagos), adapta esto:

**Ejemplo para Rutinas:**
```javascript
let rutinas = [
  { 
    id: 1, 
    nombre: 'Rutina principiante', 
    descripcion: 'Rutina de 3 días para empezar',
    duracion: '45 minutos',
    nivel: 'Principiante'
  }
];

// Rutas: /api/rutinas
// Validar: nombre, descripcion, duracion, nivel
```

**Ejemplo para Dietas:**
```javascript
let dietas = [
  { 
    id: 1, 
    nombre: 'Dieta hipocalórica', 
    calorias: 1500,
    tipo: 'Pérdida de peso',
    descripcion: 'Plan alimenticio bajo en calorías'
  }
];

// Rutas: /api/dietas
// Validar: nombre, calorias, tipo, descripcion
```

¡Recuerda que el backend y frontend deben "hablar el mismo idioma" con los tipos!