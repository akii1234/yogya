# Yogya Platform Setup Scripts

This directory contains automated setup scripts to get the Yogya platform running on your local machine with minimal effort.

## 📋 Prerequisites

Before running the setup scripts, ensure you have the following installed:

### Required Software
- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 16.0+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **npm** (comes with Node.js)

### System Requirements
- **macOS/Linux**: Any modern distribution
- **Windows**: Windows 10/11 with PowerShell 5.0+

## 🚀 Quick Start

### For macOS/Linux Users

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd yogya
   ```

2. **Run the setup script**:
   ```bash
   ./setup.sh
   ```

3. **Follow the prompts** - The script will:
   - Check system requirements
   - Set up Python virtual environment
   - Install all dependencies
   - Configure the database
   - Set up the frontend
   - Create environment configuration
   - Optionally start development servers

### For Windows Users

1. **Clone the repository** (if not already done):
   ```powershell
   git clone <repository-url>
   cd yogya
   ```

2. **Run the PowerShell script**:
   ```powershell
   .\setup.ps1
   ```

3. **Follow the prompts** - The script will perform the same setup as the bash script

## 📁 What the Scripts Do

### System Checks
- ✅ Verify Python 3.8+ is installed
- ✅ Verify Node.js 16.0+ is installed
- ✅ Verify npm is available
- ✅ Verify Git is installed

### Backend Setup
- 🐍 Create Python virtual environment
- 📦 Install all Python dependencies from `requirements.txt`
- 🤖 Install spaCy English language model
- 🗄️ Run Django database migrations
- 👤 Create default admin user (`admin@yogya.com` / `admin123`)
- ⚙️ Create environment configuration file

### Frontend Setup
- 📦 Install Node.js dependencies
- 🔧 Configure development environment

### Environment Configuration
- 📝 Create `.env` file with default settings
- 🔑 Set up placeholder API keys
- 🌐 Configure CORS settings
- 📧 Set up email configuration

## 🎯 Available Scripts

| Script | Platform | Description |
|--------|----------|-------------|
| `setup.sh` | macOS/Linux | Complete setup script with colored output |
| `setup.ps1` | Windows | PowerShell equivalent with same features |

## ⚙️ Script Options

### Windows PowerShell Options

```powershell
# Run with system checks (default)
.\setup.ps1

# Skip system requirement checks
.\setup.ps1 -SkipChecks

# Setup without starting servers
.\setup.ps1 -NoServers

# Combine options
.\setup.ps1 -SkipChecks -NoServers
```

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually or the scripts don't work for you:

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m spacy download en_core_web_md
python manage.py migrate
python manage.py runserver 8001
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access Points

After successful setup, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Main application |
| Backend API | http://localhost:8001 | Django REST API |
| Admin Panel | http://localhost:8001/admin | Django admin |
| API Docs | http://localhost:8001/api/ | API documentation |

## 🔑 Default Credentials

The setup scripts create a default admin user:

- **Email**: `admin@yogya.com`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

## 📝 Environment Configuration

The scripts create a `.env` file in the `backend/` directory. Update it with your actual values:

```env
# Required for AI features
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_API_KEY=your-google-gemini-api-key-here

# Optional: Email configuration
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Optional: Redis for WebSocket support
REDIS_URL=redis://localhost:6379/0
```

## 🐛 Troubleshooting

### Common Issues

#### Python Version Issues
```bash
# Check Python version
python3 --version

# If using Python 3.9+, you might need to use 'python' instead of 'python3'
```

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Update Node.js if needed
# Visit: https://nodejs.org/
```

#### Permission Issues (macOS/Linux)
```bash
# Make script executable
chmod +x setup.sh

# Run with sudo if needed (rare)
sudo ./setup.sh
```

#### PowerShell Execution Policy (Windows)
```powershell
# Check execution policy
Get-ExecutionPolicy

# Set execution policy if needed
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Virtual Environment Issues
```bash
# Remove and recreate virtual environment
rm -rf backend/venv
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Port Conflicts
If ports 8001 or 5173 are in use:
```bash
# Check what's using the ports
lsof -i :8001
lsof -i :5173

# Kill processes if needed
kill -9 <PID>
```

### Getting Help

1. **Check the logs** - The scripts provide detailed output
2. **Verify prerequisites** - Ensure all required software is installed
3. **Check file permissions** - Ensure scripts are executable
4. **Review error messages** - Most errors include helpful information

## 🔄 Updating Dependencies

To update dependencies after setup:

### Backend
```bash
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

### Frontend
```bash
cd frontend
npm update
```

## 📚 Additional Resources

- [Project Documentation](./docs/README.md)
- [API Documentation](./docs/API_INTEGRATION_STATUS.md)
- [Testing Guide](./docs/TESTING_GUIDE.md)
- [Setup Guide](./docs/SETUP_GUIDE.md)

## 🤝 Contributing

If you encounter issues with the setup scripts:

1. Check the troubleshooting section above
2. Review the script output for specific error messages
3. Try manual setup as an alternative
4. Report issues with detailed system information

---

**Happy coding! 🚀**

The Yogya Platform Team
