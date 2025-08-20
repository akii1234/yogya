#!/bin/bash

# Yogya Platform Setup Script
# This script sets up the complete Yogya development environment
# Compatible with macOS and Linux

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Python version
check_python_version() {
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
        REQUIRED_VERSION="3.8"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Python $PYTHON_VERSION found (>= $REQUIRED_VERSION required)"
            return 0
        else
            print_error "Python $PYTHON_VERSION found, but $REQUIRED_VERSION or higher is required"
            return 1
        fi
    else
        print_error "Python 3 is not installed"
        return 1
    fi
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_VERSION="16.0"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js $NODE_VERSION found (>= $REQUIRED_VERSION required)"
            return 0
        else
            print_error "Node.js $NODE_VERSION found, but $REQUIRED_VERSION or higher is required"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Function to check npm version
check_npm_version() {
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION found"
        return 0
    else
        print_error "npm is not installed"
        return 1
    fi
}

# Function to check Git
check_git() {
    if command_exists git; then
        GIT_VERSION=$(git --version | awk '{print $3}')
        print_success "Git $GIT_VERSION found"
        return 0
    else
        print_error "Git is not installed"
        return 1
    fi
}

# Function to install Python dependencies
setup_python_environment() {
    print_status "Setting up Python environment..."
    
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Upgrade pip
    print_status "Upgrading pip..."
    pip install --upgrade pip
    
    # Install Python dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Install spaCy model
    print_status "Installing spaCy English model..."
    python -m spacy download en_core_web_md
    
    # Run Django migrations
    print_status "Running Django migrations..."
    python manage.py migrate
    
    # Create superuser if it doesn't exist
    print_status "Creating superuser (if needed)..."
    echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin@yogya.com', 'admin123') if not User.objects.filter(email='admin@yogya.com').exists() else None" | python manage.py shell
    
    cd ..
    print_success "Python environment setup completed"
}

# Function to setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install Node.js dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    cd ..
    print_success "Frontend setup completed"
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    cd backend
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# Yogya Environment Configuration
# Copy this file to .env and update with your actual values

# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# API Keys (Optional - for AI features)
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_API_KEY=your-google-gemini-api-key-here

# Email Settings (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Redis (Optional - for WebSocket support)
REDIS_URL=redis://localhost:6379/0

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
EOF
        print_success "Environment file created at backend/.env"
        print_warning "Please update backend/.env with your actual API keys and settings"
    else
        print_status "Environment file already exists"
    fi
    
    cd ..
}

# Function to start development servers
start_servers() {
    print_status "Starting development servers..."
    
    # Start backend server in background
    cd backend
    source venv/bin/activate
    python manage.py runserver 8001 &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend server in background
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait a moment for servers to start
    sleep 3
    
    print_success "Development servers started!"
    print_status "Backend server: http://localhost:8001"
    print_status "Frontend server: http://localhost:5173"
    print_status "Admin panel: http://localhost:8001/admin"
    print_status "API documentation: http://localhost:8001/api/"
    
    print_warning "Press Ctrl+C to stop both servers"
    
    # Wait for user to stop servers
    wait
}

# Main setup function
main() {
    echo "=========================================="
    echo "    Yogya Platform Setup Script"
    echo "=========================================="
    echo ""
    
    # Check system requirements
    print_status "Checking system requirements..."
    
    if ! check_python_version; then
        print_error "Please install Python 3.8 or higher"
        print_status "Visit: https://www.python.org/downloads/"
        exit 1
    fi
    
    if ! check_node_version; then
        print_error "Please install Node.js 16.0 or higher"
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
    
    if ! check_npm_version; then
        print_error "Please install npm"
        exit 1
    fi
    
    if ! check_git; then
        print_error "Please install Git"
        print_status "Visit: https://git-scm.com/"
        exit 1
    fi
    
    print_success "All system requirements met!"
    echo ""
    
    # Setup Python environment
    setup_python_environment
    echo ""
    
    # Setup frontend
    setup_frontend
    echo ""
    
    # Create environment file
    create_env_file
    echo ""
    
    print_success "Yogya platform setup completed successfully!"
    echo ""
    
    # Ask user if they want to start servers
    read -p "Do you want to start the development servers now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_servers
    else
        print_status "To start the servers manually:"
        print_status "1. Backend: cd backend && source venv/bin/activate && python manage.py runserver 8001"
        print_status "2. Frontend: cd frontend && npm run dev"
        echo ""
        print_status "Happy coding! 🚀"
    fi
}

# Run main function
main "$@"
