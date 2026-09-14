# Plan Maestro: Remanufacturación Total Apple iOS & Mobile-First (v3.0)

Este documento define la estrategia integral para rehacer por completo el diseño de la aplicación, eliminando cualquier rastro de plantilla de IA antigua y adoptando el estándar estético y funcional del equipo de diseño de **Apple (Apple Human Interface Guidelines - HIG)**, optimizado para su uso en teléfonos móviles (iPhone / Android) y navegadores modernos.

---

## 1. Diagnóstico de Problemas Detectados en Móvil (iPhone Real)

1. **Auto-Zoom en Formularios**:
   - En iOS Safari, cualquier entrada de texto con tamaño menor a `16px` provoca un zoom forzado de la pantalla. Esto descoloca la interfaz, desalinea los encabezados y obliga al usuario a pellizcar la pantalla para regresar.
2. **Viewport sin Ajuste de Pantalla Completa**:
   - Falta el atributo `viewport-fit=cover` en `index.html`, impidiendo que la aplicación se extienda de forma natural hasta los bordes del Dynamic Island o el notch y la barra de inicio de iOS.
3. **Colores y Sombras Artificiales "Tipo IA"**:
   - El exceso de gradientes cian neón (`#22d3ee`), sombras con brillo de color borroso y fondos azul grisáceo genéricos transmiten una sensación descuidada y sintética.
4. **Colisión de Navegación (Doble Menú)**:
   - Coexistencia de un menú lateral (drawer) activado por botón hamburguesa con un dock flotante inferior. En un teléfono móvil, este patrón genera confusión, solapamiento y pérdida de espacio vertical útil.
5. **Diálogos de Escritorio en Pantalla Móvil**:
   - Los modales emergentes (`MuiDialog`) se abren como cajas centradas flotantes que quedan bloqueadas o cortadas verticalmente al abrirse el teclado del teléfono.

---

## 2. Decisiones de Librerías y Arquitectura Front-End

- **Depuración de Librerías Residuales**:
  - Se elimina `minimal-shared` de las dependencias de `package.json` (código muerto de plantillas anteriores).
  - Se consolidan y limpian los archivos CSS fragmentados (`global.css`, `components.css`, `liquid-glass.css`), sustituyéndolos por el nuevo motor de diseño `apple-design-system.css`.
- **Nuevas Librerías Integradas**:
  - `lucide-react`: Iconografía vectorial limpia con grosor consistente de 1.5px/2px idéntica a los iconos **SF Symbols de Apple**.
  - `framer-motion`: Para transiciones elásticas nativas (`spring physics`), respuesta táctil al pulsar botones (`whileTap={{ scale: 0.96 }}`) y hojas deslizantes inferiores (*Bottom Sheets*).

---

## 3. Especificación del Sistema de Diseño Nativo Apple HIG

### Paleta de Colores Oficial (OLED Dark Mode)
- **Fondo Base**: `#000000` (Negro OLED puro para fundirse con el bisel del iPhone).
- **Contenedores y Tarjetas Agrupadas**: `#1C1C1E` con borde ultrafino de 0.5px `rgba(255, 255, 255, 0.1)`.
- **Rellenos Secundarios y Píldoras**: `#2C2C2E` / `#3A3A3C`.
- **Acentos del Sistema Apple**:
  - **Azul Sistema**: `#007AFF` (Acción interactiva principal).
  - **Verde Sistema**: `#34C759` (Series completadas, anillos de actividad, estados exitosos).
  - **Naranja Sistema**: `#FF9500` (Calorías activas, series en curso).
  - **Rojo Sistema**: `#FF3B30` (Avisos críticos, descansos, cardio).
  - **Botón Hero Blanco**: `#FFFFFF` con texto `#000000` (Estilo Apple Fitness+ / Apple Store).

### Ergonomía y Tipografía
- Tipografía del sistema: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif`.
- **Inputs**: Altura estándar de `50px`, esquinas redondeadas de `14px`, relleno sutil `#1C1C1E` y **fuente obligatoria de 16px** (erradicando el zoom de iOS).
- **Zonas Táctiles**: Área activa mínima garantizada de **44x44 px** en todos los controles interactivos.

---

## 4. Fases de Ejecución

### Fase 1: Shell Móvil, Viewport & Apple Theme Foundation
1. Actualización de `index.html` con `viewport-fit=cover`, `maximum-scale=1.0, user-scalable=no` y barra de estado translúcida.
2. Instalación de `lucide-react` y `framer-motion`.
3. Creación del núcleo CSS `apple-design-system.css`.
4. Reconstrucción total de `theme-provider.tsx` bajo la paleta y componentes de Apple HIG.

### Fase 2: Arquitectura de Navegación Nativa (NavBar + TabBar)
1. **Top Navigation Bar (`HeaderSection.tsx`)**: Altura nativa con safe-area top inset (`env(safe-area-inset-top)`), logo minimalista y eliminación del menú hamburguesa en móvil.
2. **Bottom Tab Bar (`MobileTabBar.tsx`)**: Barra de navegación fija inferior respetando `env(safe-area-inset-bottom)`, iconos Lucide retina y 5 secciones clave adaptadas al rol (Alumno o Entrenador).
3. **Reserva de Espacio en `DashboardLayout.tsx`**: Padding inferior dinámico para impedir que el contenido quede oculto bajo la barra.

### Fase 3: Formularios Inset Grouped & Bottom Sheets
1. Reemplazo de modales centrados por hojas inferiores (*Bottom Sheets*) que emergen desde abajo con barra de arrastre (*drag handle*).
2. Rediseño de las pantallas de acceso y registro (`SignInPage.tsx`, `SignUpPage.tsx`) con Segmented Control estilo iOS ("Soy Alumno" / "Soy Entrenador").
3. Integración de inputs con botón de borrado rápido `(X)` e icono de visibilidad de contraseña.

### Fase 4: Rediseño de Dashboards de Alumno y Entrenador
1. **Dashboard Alumno (`ClientHomePage.tsx`)**: Tarjeta Hero del día con botón Apple Hero "Empezar Entrenamiento", anillos de actividad y Widget anatómico del BodyMap sin saturaciones estridentes.
2. **Panel Entrenador (`HomePage.tsx`, `CrmPage.tsx`, `UsersPage.tsx`)**: Tarjetas de métricas en rejilla móvil y listado de alumnos en formato Inset List.

### Fase 5: Experiencia de Entrenamiento en Vivo & Nutrición
1. **Modo Live Workout (`LiveWorkoutDialog.tsx`)**: Pantalla completa dedicada, cronómetro visible de descanso con vibración háptica suave y fila de serie compacta (Kg / Reps / Check) ajustada a los 390px del iPhone.
2. **Calculador de Discos (`BarCalculatorModal.tsx`)**: Visualización gráfica de la barra con discos de código de color internacional.
3. **Nutrición Diaria (`ClientMyDietPage.tsx`)**: Checklist de comidas con casillas circulares de selección táctil y barras de macros.

### Fase 6: Auditoría Visual, Responsive & Despliegue
1. Verificación de compilación de producción limpia con `npm run build` (código de salida 0).
2. Comprobación en múltiples viewports móviles (320px, 375px, 390px, 430px) y teclado en pantalla.
3. Sincronización y confirmación de cambios en `origin/main`.
