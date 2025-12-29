# Guía de Despliegue para Bluehost

Esta guía te ayudará a preparar y subir tu aplicación "Inglés Genius Pro" a tu hosting en Bluehost.

## 1. Preparación del Entorno Local

Antes de empezar, necesitas tener instalado **Node.js** en tu computadora. El error "npm no se reconoce" indica que no lo tienes instalado.

1.  Ve a [nodejs.org](https://nodejs.org/) y descarga la versión **LTS** (Recommended for most users).
2.  Instálalo (dale a "Siguiente" a todo).
3.  **IMPORTANTE:** Cierra y vuelve a abrir tu editor de código o terminal para que los cambios surtan efecto.
4.  Verifica la instalación escribiendo `node -v` en la terminal.

Una vez instalado Node.js, ejecuta los siguientes comandos en la carpeta del proyecto:

```bash
npm install
npm install -D tailwindcss@3.4.17 postcss autoprefixer
npm install framer-motion clsx tailwind-merge
```

## 2. Construcción del Proyecto (Build)

Para crear la versión optimizada para producción, ejecuta:

```bash
npm run build
```

Este comando creará una carpeta llamada `dist` en la raíz de tu proyecto. Esta carpeta contiene todos los archivos necesarios para tu sitio web (HTML, CSS, JavaScript e imágenes).

## 3. Subida a Bluehost

### Opción A: Administrador de Archivos (File Manager)

1.  Inicia sesión en tu panel de control de Bluehost.
2.  Ve a **Advanced** > **File Manager** (Administrador de Archivos).
3.  Navega a la carpeta `public_html`.
    *   Si es tu dominio principal, sube los archivos directamente aquí.
    *   **CASO ESPECIAL: Si ves archivos de WordPress (`wp-admin`, `wp-content`, etc.):**
        1.  Crea una carpeta llamada `respaldo_antiguo`.
        2.  Mueve **TODOS** los archivos existentes de WordPress dentro de esa carpeta.
        3.  Ahora que el directorio está "limpio", sube tus nuevos archivos.

4.  Haz clic en **Upload** (Cargar).
5.  Sube **todo el contenido** de la carpeta `dist` que creaste en el paso 2.
    *   **Importante:** No subas la carpeta `dist` en sí, sino *lo que hay dentro* (el archivo `index.html`, la carpeta `assets`, etc.).
6.  Una vez subidos, asegúrate de que `index.html` esté en la raíz de tu directorio público.

### Opción B: FTP (FileZilla)

1.  Usa un cliente FTP como FileZilla.
2.  Conéctate con tus credenciales de FTP de Bluehost.
3.  Navega a `public_html` en el servidor (lado derecho).
4.  Navega a la carpeta `dist` en tu computadora (lado izquierdo).
5.  Arrastra todos los archivos desde `dist` hacia `public_html`.

## 4. Configuración Adicional (Si es necesario)

### Rutas (React Router)
Como esta es una "Single Page Application" (SPA), si recargas la página en una ruta interna (ej. `/chat`), el servidor podría dar un error 404. Para solucionar esto en Bluehost (servidor Apache):

1.  En el Administrador de Archivos de Bluehost, dentro de la carpeta donde subiste tu web, crea un archivo nuevo llamado `.htaccess`.
2.  Edita el archivo y pega el siguiente código:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

3.  Guarda los cambios. Esto redirigirá todas las peticiones al `index.html` para que React maneje las rutas.

## 5. Verificación

Visita tu dominio en el navegador. Deberías ver la nueva versión de Inglés Genius Pro con el diseño premium y las animaciones funcionando.

---

**Nota:** Si ves una pantalla blanca o errores, abre la consola del navegador (F12 > Console) para ver si hay errores de carga de archivos. Asegúrate de que todos los archivos de la carpeta `assets` se hayan subido correctamente.
