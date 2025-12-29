# Inglés Genius Pro LMS

## 🚀 Local Development Workflow

### 1. Backend Setup (FastAPI)
The backend manages the database, user authentication, and LMS logic.

```powershell
# Navigate to backend folder
cd backend_fastapi

# Create Virtual Environment (Optional but recommended)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install Dependencies
pip install -r requirements.txt

# Run Server (Auto-reload enabled on port 8000)
uvicorn main:app --reload
```

> **Note:** On first run, the server will automatically create `sql_app.db` and seed the courses (A1, A2, B2).

### 2. Frontend Setup (React/Vite)
The frontend connects to `http://127.0.0.1:8000` via valid API calls.

```powershell
# Install dependencies
npm install

# Run Dev Server (Port 5173 or 5500)
npm run dev
```

### 3. Verification (Smoke Test)
You can verify the backend is running correctly using the included PowerShell script:

```powershell
.\smoke_test.ps1
```

---

## 🌍 cPanel Deployment

1. **Build Frontend**:
   ```powershell
   npm run build
   # Creates /dist folder
   ```

2. **Prepare Files**:
   - Upload contents of `/dist` to `public_html`.
   - Create/Upload `.htaccess` to handle SPA routing:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```

3. **Backend Deployment**:
   - Upload `backend_fastapi` folder outside `public_html` (e.g., `/home/user/backend`).
   - Configure Python App in cPanel pointing to `main:app`.
