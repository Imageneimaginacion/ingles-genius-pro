# Catálogo de Componentes

## Primitivos (Atoms)

### 1. Button
- **Props**: `variant` (primary, secondary, ghost, neon), `size` (sm, md, lg), `icon`, `loading`.
- **Uso**: Acciones principales. El estilo "neon" se usa para CTAs críticos en modo espacial.

### 2. Card
- **Props**: `variant` (glass, solid, outlined), `padding`.
- **Uso**: Contenedor principal para módulos y contenido. Glassmorphism preferido en fondos oscuros.

### 3. Typography (Text, Heading)
- **Props**: `size`, `weight`, `color` (gradient support for Headings).
- **Uso**: Unificar estilos de texto para soportar escalas de accesibilidad.

### 4. Badge
- **Props**: `type` (success, warning, error, info, level).
- **Uso**: Etiquetas de estado, niveles (A1, B1), o tipo de misión.

## Compuestos (Molecules)

### 1. MissionCard
- **Props**: `missionTitle`, `status` (locked, unlocked, complete), `xpReward`.
- **Componentes**: Card + Icon + Text + Badge + ProgressBar (mini).

### 2. AudioPlayer
- **Props**: `src`, `onComplete`.
- **Componentes**: PlayButton, Timeline (Range input), SpeedToggle.

### 3. Navbar / SidebarItem
- **Props**: `active`, `icon`, `label`, `onClick`.
- **Uso**: Navegación.

## Organismos (Organisms)

### 1. GalaxyMap
- **Props**: `systems` (Array de niveles), `currentProgress`.
- **Uso**: Visualización principal del dashboard. Renderiza nodos conectados por líneas SVG.

### 2. LessonPlayer
- **Props**: `lessonData`, `onFinish`.
- **Uso**: Orquestador de la lección paso a paso. Maneja el estado interno de "slides" o "activities".

### 3. OnboardingFlow
- **Props**: `onComplete`.
- **Uso**: Wizard de pasos múltiples para configuración inicial.
