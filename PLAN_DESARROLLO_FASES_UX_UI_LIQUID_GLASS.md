# Plan Maestro: Remanufacturación Total Apple iOS & Mobile-First (v4.0)

Este documento define la estrategia integral para rehacer por completo el diseño de la aplicación, eliminando cualquier rastro de plantillas antiguas y adoptando el estándar estético y funcional del equipo de diseño de **Apple (Apple Human Interface Guidelines - HIG)**, optimizado para su uso en teléfonos móviles (iPhone / Android) y navegadores modernos.

---

## 1. Diagnóstico y Auditoría UX/UI de la Aplicación

1. **Burbuja Flotante de Chat (`FloatingChat.tsx`)**:
   - **Problema**: El botón flotante `Fab` situado en `bottom: 24, right: 24` se superpone sobre la pestaña de **Perfil** en la barra inferior móvil (`FloatingMobileDock`). Esto genera bloqueos táctiles e impide acceder con normalidad al perfil del usuario.
   - **Solución**: Eliminar el botón flotante de la pantalla y reubicar el acceso a **Chat / Asistente IA** como botón integrado en la barra de navegación inferior móvil (`FloatingMobileDock`) justo al lado de la pestaña **Perfil**, además de un botón de acceso rápido en el header de escritorio. Al pulsarlo, el chat se abrirá como un modal translúcido estilo Apple Intelligence / iMessage.

2. **Módulo de Rutinas y Entrenamientos (`Workouts`)**:
   - **`WorkoutForm.tsx`**: Modales con bordes antiguos, selectores desalineados en pantallas estrechas y selector de ejercicios no responsive.
   - **`workout-exercises-manager.tsx`**: Tabla rígida de 7 columnas que se desborda horizontalmente en pantallas móviles. Se adaptará a vista de tarjetas táctiles en móviles y tabla refinada en desktop.
   - **`WorkoutDetail.tsx` & `WorkoutUserDialog.tsx`**: Diálogos con estilos heredados sin el diseño Liquid Glass.
   - **`ClientWorkoutBuilderModal.tsx`**: Creador de rutinas con necesidad de ajuste en inputs (16px) y selección de plantillas.

3. **Módulo de Dietas y Nutrición (`Diet`)**:
   - **`DietForm.tsx` & `DietFoodsManager.tsx`**: Formularios que requieren campos Inset Grouped, inputs con altura ergonómica y vista responsive para tablas de alimentos.
   - **`ClientDietBuilderModal.tsx` & `CalorieCalculatorModal.tsx`**: Integración con el sistema de diseño Apple con barras de progreso y cálculo dinámico de macros.

4. **Formularios de Usuarios y Clientes (`User`)**:
   - **`UserForm.tsx` & `AssignTrainerModal.tsx`**: Campos nativos con validaciones en línea y selector visual de roles.

5. **Responsividad Global de Inputs y Teclado Móvil**:
   - Forzar `font-size: 16px` en todos los controles de entrada para evitar el zoom forzado en Safari iOS.
   - Ajustar espaciado seguro inferior (`env(safe-area-inset-bottom)`) en todos los layouts.

---

## 2. Fases de Ejecución

### Fase A: Reubicación del Chat y Conversión a Apple Intelligence Sheet
- Eliminar el FAB flotante en `FloatingChat.tsx` y transformarlo en modal/hoja inferior.
- Añadir la pestaña de Chat en `FloatingMobileDock.tsx` (al lado de Perfil) para Alumno y Entrenador.
- Añadir botón de Chat en `HeaderSection.tsx` para versión de escritorio.
- Aplicar diseño Apple iMessage / Liquid Glass al cuerpo del chat.

### Fase B: Remodelación Total del Módulo de Rutinas y Creadores de Ejercicios
- Rediseño de `WorkoutForm.tsx` con secciones Inset Grouped y campos de 16px.
- Rediseño de `workout-exercises-manager.tsx` con vista híbrida (tarjetas interactivas en móvil y tabla en escritorio).
- Rediseño de `WorkoutDetail.tsx`, `WorkoutUserDialog.tsx` y `ClientWorkoutBuilderModal.tsx`.

### Fase C: Remodelación de Dietas, Calculadoras y Gestores de Alimentos
- Rediseño de `DietForm.tsx`, `DietFoodsManager.tsx`, `CalorieCalculatorModal.tsx` y `ClientDietBuilderModal.tsx`.

### Fase D: Remodelación de Formularios de Usuario y Asignación
- Rediseño de `UserForm.tsx` y `AssignTrainerModal.tsx`.

### Fase E: Ajustes Globales de Inputs, Responsive y Safe Areas
- Verificación exhaustiva de tamaños de fuente, áreas táctiles $\ge 44\text{px}$ y safe areas.

### Fase F: Verificación, Build de Producción y Git Push
- Ejecución de `npm run build` y subida a `origin/main` en GitHub.
