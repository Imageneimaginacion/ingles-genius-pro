# Instrucciones de Ejecución y Despliegue

## Entorno Local

### Backend (Python/FastAPI)

1. Abrir PowerShell como Administrador.
2. Navegar a la carpeta del proyecto.
3. Activar política de ejecución (si es necesario):
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
4. Crear y activar entorno virtual (si no existe):
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate
   ```
5. Instalar dependencias:
   ```powershell
   pip install -r backend_fastapi/requirements.txt
   ```
6. Ejecutar el servidor (desde la raíz o carpeta backend_fastapi, ajustar path):
   ```powershell
   # Si estás en la raíz y main.py está en backend_fastapi:
   uvicorn backend_fastapi.main:app --reload --port 8000
   ```
   Verificar ping: [http://127.0.0.1:8000/ping](http://127.0.0.1:8000/ping)

### Frontend (React/Vite)

1. Abrir una nueva terminal.
2. Navegar a la carpeta raíz.
3. Instalar dependencias:
   ```bash
   npm install
   ```
4. Ejecutar entorno de desarrollo:
   ```bash
   npm run dev
   ```
   El frontend estará en [http://localhost:3000](http://localhost:3000) (o puerto similar).
   Las llamadas a `/api/*` serán redirigidas automáticamente a `http://127.0.0.1:8000` gracias al proxy en `vite.config.ts`.

---

## Despliegue en cPanel

### Frontend

1. Configurar variables de entorno para producción en `.env.production`:
   ```env
   VITE_API_URL=https://inglesgeniuspro.com/backend
   ```
2. Ejecutar build:
   ```bash
   npm run build
   ```
3. Subir el contenido de la carpeta `dist/` a `public_html/`.
4. Asegurar que el archivo `.htaccess` esté presente en `public_html/` para manejar el routing de la SPA (React Router).

### Backend (Python)

1. Usar la herramienta "Setup Python App" en cPanel.
2. Configurar la raíz de la aplicación (ej. `backend_fastapi` subido fuera de `public_html` si es posible, o en una carpeta protegida).
3. URL de la aplicación: `inglésgeniuspro.com/backend` (o crear un subdominio `api.inglesgeniuspro.com`).
   * *Si la URL es /backend, asegurar que `VITE_API_URL` apunte ahí.*
4. Archivo de inicio: `main.py` (o `passenger_wsgi.py` según el host).
5. Instalar dependencias desde `requirements.txt` usando la interfaz de cPanel.

### .htaccess

El archivo `.htaccess` en `public_html` debe permitir el acceso a la carpeta donde esté montado el backend (ej. `/backend` o `/api`) sin redirigir al `index.html` de React.

```apache
RewriteEngine On
RewriteBase /

# Redirigir HTTP a HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Ignorar reglas SPA para rutas de API/Backend
RewriteCond %{REQUEST_URI} !^/backend/
RewriteCond %{REQUEST_URI} !^/api/

# Reglas SPA (React)
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-l
RewriteRule . /index.html [L]
```
