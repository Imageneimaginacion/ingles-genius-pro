# Mapa del Sitio e I.A. (Arquitectura de Información)

## Reglas de Navegación
1. **Acceso Universal**: Landing Page es el punto de entrada.
2. **Exploración Libre**: No se requiere login para ver el dashboard (modo invitado).
3. **Persistencia Híbrida**: 
   - Invitados: localStorage.
   - Usuarios: Cloud Sync.
4. **Modos de Perfil**:
   - **Kids**: UI simplificada, gamificación alta, texto grande.
   - **Adults**: UI profesional (tipo SaaS), métricas claras, sin mascotas intrusivas.

## Sitemap

### 1. Pública / Onboarding
- **/** (Landing Page)
  - Hero (Propuesta de valor)
  - Demo interactiva (Pequeño juego/reto)
  - Testimonios / Social Proof
  - CTA -> /select-mode

- **/select-mode** (Selector de Perfil)
  - Opción A: Kids -> Redirige a /onboarding/kids
  - Opción B: Teens/Adults -> Redirige a /onboarding/adults

- **/onboarding/:profile**
  - Paso 1: Objetivo (Viaje, Trabajo, Examen, Hobby)
  - Paso 2: Nivel (Test rápido o Auto-selección)
  - Paso 3: Configuración (Nombre de Cadete/Avatar)
  - Fin -> Redirige a /dashboard

### 2. Aplicación Principal (Modo: Galaxia)
- **/dashboard** (Mapa Galáctico)
  - Vista de Sistemas Solares (Niveles: A1, A2, B1...)
  - Nodos de Misión (Lecciones)
  - Sidebar/Bottombar: Accesos rápidos (Misiones, Práctica, Perfil)

- **/mission/:id** (Vista Previa de Misión)
  - Objetivo de aprendizaje
  - Recompensas (XP, Monedas)
  - CTA: "Despegar" -> /lesson/:id

- **/lesson/:id** (Core Learning Flow)
  - **Fase 1: Intro** (Contexto, Vocabulario clave)
  - **Fase 2: Input** (Listening/Reading con AudioPlayer)
  - **Fase 3: Practice** (Quizzes, Pares, Ordenar frases)
  - **Fase 4: Speaking** (Micrófono - Pronunciación)
  - **Fase 5: Resultados** (Feedback, XP animado)

### 3. Herramientas y Soporte
- **/practice** (Gimnasio)
  - Listening Station (Audio drills)
  - Speaking Lab (Retos de pronunciación)
  - Vocab review (Flashcards espaciadas)

- **/profile**
  - Estadísticas (Racha, XP)
  - Configuración (Tema, Accesibilidad, Cuenta)
  - Logros (Insignias)

## Diagrama de Flujo (User Flow: Invitado a Primer Lección)

[LANDING] 
  |-> Clic "Empezar"
[SELECTOR PERFIL]
  |-> Clic "Adults"
[ONBOARDING]
  |-> Define Nivel A1
[DASHBOARD]
  |-> Ve Nivel A1 desbloqueado
  |-> Clic en Misión 1 "Hello World"
[LESSON PLAYER]
  |-> Completa actividades
  |-> Pantalla Victoria
[REGISTRO OPCIONAL]
  |-> "Guarda tu progreso para no perderlo"
