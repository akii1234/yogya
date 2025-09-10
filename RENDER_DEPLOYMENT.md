# Render.com Deployment Guide for Yogya

## Prerequisites
- GitHub repository with your Yogya code
- Render.com account (free)

## Step 1: Prepare Your Repository

### 1.1 Add dj-database-url to requirements.txt
Add this line to `backend/requirements.txt`:
```
dj-database-url==2.1.0
```

### 1.2 Create build.sh script
Create `build.sh` in your root directory:
```bash
#!/usr/bin/env bash
cd backend
pip install -r requirements.txt
pip install dj-database-url==2.1.0
python manage.py migrate
python manage.py collectstatic --noinput
cd ../frontend
npm install
npm run build
```

### 1.3 Update frontend API configuration
In `frontend/src/services/api.js`, update the baseURL:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
```

## Step 2: Deploy on Render

### 2.1 Create New Web Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### 2.2 Configure Backend Service
- **Name**: `yogya-backend`
- **Environment**: `Python 3`
- **Build Command**: `./build.sh`
- **Start Command**: `cd backend && daphne -b 0.0.0.0 -p $PORT yogya_project.asgi:application`

### 2.3 Environment Variables
Add these environment variables:
```
DJANGO_SETTINGS_MODULE=yogya_project.settings_production
DEBUG=False
ALLOWED_HOSTS=yogya-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://yogya-frontend.onrender.com
```

### 2.4 Create Database
1. Go to "New +" → "PostgreSQL"
2. Name: `yogya-database`
3. Copy the connection string
4. Add as environment variable: `DATABASE_URL`

## Step 3: Deploy Frontend

### 3.1 Create Static Site
1. "New +" → "Static Site"
2. Connect same repository
3. **Build Command**: `cd frontend && npm install && npm run build`
4. **Publish Directory**: `frontend/dist`

### 3.2 Environment Variables
```
VITE_API_BASE_URL=https://yogya-backend.onrender.com/api
```

## Step 4: Configure Domains

### 4.1 Backend Domain
- Your backend will be: `https://yogya-backend.onrender.com`

### 4.2 Frontend Domain
- Your frontend will be: `https://yogya-frontend.onrender.com`

## Step 5: Test Deployment

1. Visit your frontend URL
2. Test all features:
   - User registration/login
   - Job browsing
   - Resume upload
   - Video calls (if implemented)

## Troubleshooting

### Common Issues:
1. **Build fails**: Check build logs in Render dashboard
2. **Database connection**: Verify DATABASE_URL environment variable
3. **CORS errors**: Check CORS_ALLOWED_ORIGINS
4. **Static files**: Ensure collectstatic runs successfully

### Logs:
- Check logs in Render dashboard
- Backend logs show Django errors
- Build logs show installation issues

## Cost
- **Free tier**: 750 hours/month
- **Paid**: $7/month for always-on service

## Support
- Render documentation: https://render.com/docs
- Django deployment: https://docs.djangoproject.com/en/5.2/howto/deployment/
