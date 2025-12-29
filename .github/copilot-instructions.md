# Copilot Instructions

This document provides guidance for AI coding agents to effectively contribute to the Inglés Genius Pro codebase.

## Project Overview

Inglés Genius Pro is a Language Learning Management System (LMS) built with a React/Vite frontend and a FastAPI backend. The application is designed to help users learn English through a gamified experience with courses, missions, and achievements.

## Architecture

### Frontend

- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context and local state are used for managing application state.
- **Key Directories**:
  - `src/components`: Reusable UI components.
  - `src/pages`: Top-level page components.
  - `src/services`: Modules for interacting with the backend API (`api.ts`) and other external services.
  - `src/data`: Static data, such as mission details.

### Backend

- **Framework**: FastAPI
- **Language**: Python
- **Database**: SQLite with SQLAlchemy ORM.
- **Authentication**: JWT-based authentication.
- **Key Files**:
  - `backend_fastapi/main.py`: The main application file containing API endpoints, CORS configuration, and database seeding logic.
  - `backend_fastapi/models.py`: SQLAlchemy models that define the database schema.
  - `backend_fastapi/database.py`: Database connection and session management.

## Development Workflow

### Backend Setup

1.  Navigate to the `backend_fastapi` directory.
2.  Create a virtual environment and activate it.
3.  Install dependencies: `pip install -r requirements.txt`
4.  Run the server: `uvicorn main:app --reload`

The backend server runs on `http://127.0.0.1:8000`.

### Frontend Setup

1.  Navigate to the root directory.
2.  Install dependencies: `npm install`
3.  Run the development server: `npm run dev`

The frontend development server runs on `http://localhost:5173` or `http://localhost:5500`.

## Conventions

-   **API Communication**: The frontend communicates with the backend via the `src/services/api.ts` module. All API requests should be centralized here.
-   **Styling**: Use Tailwind CSS for styling. Custom styles are in `src/index.css`.
-   **Components**: Create reusable UI components in the `src/components/ui` directory.
-   **Data Fetching**: Use the `apiService` object in `src/services/api.ts` for all backend communication.
-   **Authentication**: The JWT token is stored in `localStorage`. The `getHeaders` function in `api.ts` automatically includes the token in requests.
