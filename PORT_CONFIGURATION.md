# Port Configuration

## Current Port Setup

### Frontend (React)
- **Port**: 5173
- **URL**: http://localhost:5173
- **Framework**: Vite + React

### Backend (Django)
- **Port**: 8001
- **URL**: http://localhost:8001
- **API Base URL**: http://localhost:8001/api
- **Framework**: Django + Django REST Framework + Daphne (ASGI)

## Configuration Files

### Frontend Configuration
- **File**: `frontend/src/services/api.js`
- **Setting**: `baseURL: 'http://localhost:8001/api'`

### Backend Configuration
- **File**: `backend/yogya_project/settings.py`
- **CORS Settings**: 
  ```python
  CORS_ALLOWED_ORIGINS = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
  ]
  ```

## Commands to Start Servers

### Backend (Django)
```bash
cd backend
source venv/bin/activate
daphne -b 0.0.0.0 -p 8001 yogya.asgi:application
```

### Frontend (React)
```bash
cd frontend
npm run dev
# or
yarn dev
```

## Testing URLs

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8001/api
- **Django Admin**: http://localhost:8001/admin
- **API Documentation**: http://localhost:8001/api/docs/

## Notes

- The frontend is configured to connect to the backend API at port 8001
- CORS is configured to allow requests from frontend port 5173
- Both servers need to be running for the application to work properly
- The backend uses Daphne (ASGI server) for WebSocket support and async capabilities
