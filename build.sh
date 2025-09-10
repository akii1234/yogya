#!/usr/bin/env bash
# Build script for Render deployment

echo "🚀 Starting Yogya deployment on Render..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
pip install -r requirements.txt
pip install dj-database-url==2.1.0

# Run Django migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if needed (optional)
# echo "👤 Creating superuser..."
# python manage.py createsuperuser --noinput

echo "✅ Backend build completed!"

# Build frontend
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build

echo "✅ Frontend build completed!"
echo "🎉 Yogya deployment ready!"
