# Wireframes (Conceptuales)

## 1. Landing Page
```
+-------------------------------------------------------+
| [Logo]                           [Login] [EMPEZAR]    |
+-------------------------------------------------------+
|                                                       |
|   EXPLORA EL INGLÉS. A TU RITMO. GRATIS.              |
|   [ Héroe / Ilustración Espacial 3D ]                 |
|                                                       |
|   +-------------------+   +-------------------+       |
|   | Soy Niño/a 🚀     |   | Soy Adulto 👨‍🚀     |       |
|   +-------------------+   +-------------------+       |
|                                                       |
+-------------------------------------------------------+
```

## 2. Galactic Dashboard (Home)
```
+----------------+--------------------------------------+
| [Sidebar]      |  [Header: Nivel A1 - Progreso 20%]   |
| - Misiones     |                                      |
| - Práctica     |        (Sol: Basic English)          |
| - Perfil       |             O                        |
|                |           /   \                      |
|                |     (Planeta 1)  (Planeta 2)         |
|                |      Unlocked      Locked            |
|                |                                      |
|                |    [FAB: Continuar Misión]           |
+----------------+--------------------------------------+
```

## 3. Lesson Core (Player)
```
+-------------------------------------------------------+
| [X Salir]      Progreso: [==========      ]           |
+-------------------------------------------------------+
|                                                       |
|              "Listen and Repeat"                      |
|                                                       |
|           [ AUDIO WAVEFORM / PLAYER ]                 |
|             ( > )  ( 1x )  ( CC )                     |
|                                                       |
|              "Hola, mi nombre es..."                  |
|                                                       |
|          [ MIC BUTTON ] "Grabar voz"                  |
|                                                       |
+-------------------------------------------------------+
| [AYUDA]                             [CONTINUAR >]     |
+-------------------------------------------------------+
```

## 4. Componentes Clave

### Galaxy Node (Component)
- Estado: Locked (Gris, Candado), Active (Brillante, Pulso), Completed (Dorado, Check).
- Interacción: Hover muestra tooltip con título de lección.

### Audio Player (Component)
- Controles: Play/Pause, Slider de tiempo.
- Toggles: Velocidad (.75x, 1x, 1.25x), Texto oculto/visible.

### Progress Bar (Component)
- Contexto: Muestra avance en lección o nivel.
- Estilo: Barra de neón con brillo.
