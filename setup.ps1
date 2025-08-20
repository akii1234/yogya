# Yogya Platform Setup Script for Windows
# This script sets up the complete Yogya development environment
# Run this script in PowerShell as Administrator if needed

param(
    [switch]$SkipChecks,
    [switch]$NoServers
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check Python version
function Test-PythonVersion {
    if (Test-Command "python") {
        try {
            $pythonVersion = python --version 2>&1
            $version = $pythonVersion -replace "Python ", ""
            $majorMinor = $version -split "\." | Select-Object -First 2
            $versionString = $majorMinor -join "."
            
            if ([version]$versionString -ge [version]"3.8") {
                Write-Success "Python $version found (>= 3.8 required)"
                return $true
            }
            else {
                Write-Error "Python $version found, but 3.8 or higher is required"
                return $false
            }
        }
        catch {
            Write-Error "Could not determine Python version"
            return $false
        }
    }
    else {
        Write-Error "Python is not installed"
        return $false
    }
}

# Function to check Node.js version
function Test-NodeVersion {
    if (Test-Command "node") {
        try {
            $nodeVersion = node --version
            $version = $nodeVersion -replace "v", ""
            
            if ([version]$version -ge [version]"16.0") {
                Write-Success "Node.js $version found (>= 16.0 required)"
                return $true
            }
            else {
                Write-Error "Node.js $version found, but 16.0 or higher is required"
                return $false
            }
        }
        catch {
            Write-Error "Could not determine Node.js version"
            return $false
        }
    }
    else {
        Write-Error "Node.js is not installed"
        return $false
    }
}

# Function to check npm version
function Test-NpmVersion {
    if (Test-Command "npm") {
        try {
            $npmVersion = npm --version
            Write-Success "npm $npmVersion found"
            return $true
        }
        catch {
            Write-Error "Could not determine npm version"
            return $false
        }
    }
    else {
        Write-Error "npm is not installed"
        return $false
    }
}

# Function to check Git
function Test-Git {
    if (Test-Command "git") {
        try {
            $gitVersion = git --version
            Write-Success "$gitVersion found"
            return $true
        }
        catch {
            Write-Error "Could not determine Git version"
            return $false
        }
    }
    else {
        Write-Error "Git is not installed"
        return $false
    }
}

# Function to install Python dependencies
function Setup-PythonEnvironment {
    Write-Status "Setting up Python environment..."
    
    Push-Location backend
    
    # Create virtual environment if it doesn't exist
    if (-not (Test-Path "venv")) {
        Write-Status "Creating Python virtual environment..."
        python -m venv venv
    }
    
    # Activate virtual environment
    Write-Status "Activating virtual environment..."
    & ".\venv\Scripts\Activate.ps1"
    
    # Upgrade pip
    Write-Status "Upgrading pip..."
    python -m pip install --upgrade pip
    
    # Install Python dependencies
    Write-Status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Install spaCy model
    Write-Status "Installing spaCy English model..."
    python -m spacy download en_core_web_md
    
    # Run Django migrations
    Write-Status "Running Django migrations..."
    python manage.py migrate
    
    # Create superuser if it doesn't exist
    Write-Status "Creating superuser (if needed)..."
    $createSuperuserScript = @"
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@yogya.com').exists():
    User.objects.create_superuser('admin@yogya.com', 'admin123')
"@
    echo $createSuperuserScript | python manage.py shell
    
    Pop-Location
    Write-Success "Python environment setup completed"
}

# Function to setup frontend
function Setup-Frontend {
    Write-Status "Setting up frontend..."
    
    Push-Location frontend
    
    # Install Node.js dependencies
    Write-Status "Installing Node.js dependencies..."
    npm install
    
    Pop-Location
    Write-Success "Frontend setup completed"
}

# Function to create environment file
function New-EnvironmentFile {
    Write-Status "Creating environment configuration..."
    
    Push-Location backend
    
    if (-not (Test-Path ".env")) {
        $envContent = @"
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
"@
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Success "Environment file created at backend\.env"
        Write-Warning "Please update backend\.env with your actual API keys and settings"
    }
    else {
        Write-Status "Environment file already exists"
    }
    
    Pop-Location
}

# Function to start development servers
function Start-DevelopmentServers {
    Write-Status "Starting development servers..."
    
    # Start backend server in background
    Push-Location backend
    & ".\venv\Scripts\Activate.ps1"
    Start-Process -FilePath "python" -ArgumentList "manage.py runserver 8001" -WindowStyle Hidden
    Pop-Location
    
    # Start frontend server in background
    Push-Location frontend
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Hidden
    Pop-Location
    
    # Wait a moment for servers to start
    Start-Sleep -Seconds 3
    
    Write-Success "Development servers started!"
    Write-Status "Backend server: http://localhost:8001"
    Write-Status "Frontend server: http://localhost:5173"
    Write-Status "Admin panel: http://localhost:8001/admin"
    Write-Status "API documentation: http://localhost:8001/api/"
    
    Write-Warning "Servers are running in background. Use Task Manager to stop them."
}

# Main setup function
function Main {
    Write-Host "==========================================" -ForegroundColor $White
    Write-Host "    Yogya Platform Setup Script" -ForegroundColor $White
    Write-Host "==========================================" -ForegroundColor $White
    Write-Host ""
    
    # Check system requirements
    if (-not $SkipChecks) {
        Write-Status "Checking system requirements..."
        
        if (-not (Test-PythonVersion)) {
            Write-Error "Please install Python 3.8 or higher"
            Write-Status "Visit: https://www.python.org/downloads/"
            exit 1
        }
        
        if (-not (Test-NodeVersion)) {
            Write-Error "Please install Node.js 16.0 or higher"
            Write-Status "Visit: https://nodejs.org/"
            exit 1
        }
        
        if (-not (Test-NpmVersion)) {
            Write-Error "Please install npm"
            exit 1
        }
        
        if (-not (Test-Git)) {
            Write-Error "Please install Git"
            Write-Status "Visit: https://git-scm.com/"
            exit 1
        }
        
        Write-Success "All system requirements met!"
        Write-Host ""
    }
    
    # Setup Python environment
    Setup-PythonEnvironment
    Write-Host ""
    
    # Setup frontend
    Setup-Frontend
    Write-Host ""
    
    # Create environment file
    New-EnvironmentFile
    Write-Host ""
    
    Write-Success "Yogya platform setup completed successfully!"
    Write-Host ""
    
    # Ask user if they want to start servers
    if (-not $NoServers) {
        $response = Read-Host "Do you want to start the development servers now? (y/n)"
        
        if ($response -eq "y" -or $response -eq "Y") {
            Start-DevelopmentServers
        }
        else {
            Write-Status "To start the servers manually:"
            Write-Status "1. Backend: cd backend && .\venv\Scripts\Activate.ps1 && python manage.py runserver 8001"
            Write-Status "2. Frontend: cd frontend && npm run dev"
            Write-Host ""
            Write-Status "Happy coding! 🚀"
        }
    }
    else {
        Write-Status "To start the servers manually:"
        Write-Status "1. Backend: cd backend && .\venv\Scripts\Activate.ps1 && python manage.py runserver 8001"
        Write-Status "2. Frontend: cd frontend && npm run dev"
        Write-Host ""
        Write-Status "Happy coding! 🚀"
    }
}

# Run main function
Main
