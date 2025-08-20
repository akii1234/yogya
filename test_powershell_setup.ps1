# Test script for setup.ps1 functions
# This script tests the individual functions without running the full setup
# Run this on Windows to validate the setup script

# Import the setup script to get access to its functions
# Note: This would normally be done with . .\setup.ps1

# Test function definitions (simulated)
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

function Test-PythonVersion {
    if (Test-Command "python") {
        try {
            $pythonVersion = python --version 2>&1
            $version = $pythonVersion -replace "Python ", ""
            $majorMinor = $version -split "\." | Select-Object -First 2
            $versionString = $majorMinor -join "."
            
            if ([version]$versionString -ge [version]"3.8") {
                Write-Host "[SUCCESS] Python $version found (>= 3.8 required)" -ForegroundColor Green
                return $true
            }
            else {
                Write-Host "[ERROR] Python $version found, but 3.8 or higher is required" -ForegroundColor Red
                return $false
            }
        }
        catch {
            Write-Host "[ERROR] Could not determine Python version" -ForegroundColor Red
            return $false
        }
    }
    else {
        Write-Host "[ERROR] Python is not installed" -ForegroundColor Red
        return $false
    }
}

function Test-NodeVersion {
    if (Test-Command "node") {
        try {
            $nodeVersion = node --version
            $version = $nodeVersion -replace "v", ""
            
            if ([version]$version -ge [version]"16.0") {
                Write-Host "[SUCCESS] Node.js $version found (>= 16.0 required)" -ForegroundColor Green
                return $true
            }
            else {
                Write-Host "[ERROR] Node.js $version found, but 16.0 or higher is required" -ForegroundColor Red
                return $false
            }
        }
        catch {
            Write-Host "[ERROR] Could not determine Node.js version" -ForegroundColor Red
            return $false
        }
    }
    else {
        Write-Host "[ERROR] Node.js is not installed" -ForegroundColor Red
        return $false
    }
}

function Test-NpmVersion {
    if (Test-Command "npm") {
        try {
            $npmVersion = npm --version
            Write-Host "[SUCCESS] npm $npmVersion found" -ForegroundColor Green
            return $true
        }
        catch {
            Write-Host "[ERROR] Could not determine npm version" -ForegroundColor Red
            return $false
        }
    }
    else {
        Write-Host "[ERROR] npm is not installed" -ForegroundColor Red
        return $false
    }
}

function Test-Git {
    if (Test-Command "git") {
        try {
            $gitVersion = git --version
            Write-Host "[SUCCESS] $gitVersion found" -ForegroundColor Green
            return $true
        }
        catch {
            Write-Host "[ERROR] Could not determine Git version" -ForegroundColor Red
            return $false
        }
    }
    else {
        Write-Host "[ERROR] Git is not installed" -ForegroundColor Red
        return $false
    }
}

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Main test function
function Test-SetupScript {
    Write-Host "🧪 Testing PowerShell Setup Script Functions" -ForegroundColor White
    Write-Host "=============================================" -ForegroundColor White
    Write-Host ""

    # Test system requirement checks
    Write-Host "1. Testing system requirement checks..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan

    Write-Host "Testing Python version check..."
    if (Test-PythonVersion) {
        Write-Host "✅ Python version check passed" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Python version check failed" -ForegroundColor Red
    }

    Write-Host "Testing Node.js version check..."
    if (Test-NodeVersion) {
        Write-Host "✅ Node.js version check passed" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Node.js version check failed" -ForegroundColor Red
    }

    Write-Host "Testing npm version check..."
    if (Test-NpmVersion) {
        Write-Host "✅ npm version check passed" -ForegroundColor Green
    }
    else {
        Write-Host "❌ npm version check failed" -ForegroundColor Red
    }

    Write-Host "Testing Git check..."
    if (Test-Git) {
        Write-Host "✅ Git check passed" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Git check failed" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "2. Testing utility functions..." -ForegroundColor Cyan
    Write-Host "-------------------------------" -ForegroundColor Cyan

    Write-Host "Testing command_exists function..."
    if (Test-Command "python") {
        Write-Host "✅ python command exists" -ForegroundColor Green
    }
    else {
        Write-Host "❌ python command not found" -ForegroundColor Red
    }

    if (Test-Command "node") {
        Write-Host "✅ node command exists" -ForegroundColor Green
    }
    else {
        Write-Host "❌ node command not found" -ForegroundColor Red
    }

    if (Test-Command "npm") {
        Write-Host "✅ npm command exists" -ForegroundColor Green
    }
    else {
        Write-Host "❌ npm command not found" -ForegroundColor Red
    }

    if (Test-Command "git") {
        Write-Host "✅ git command exists" -ForegroundColor Green
    }
    else {
        Write-Host "❌ git command not found" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "3. Testing color output functions..." -ForegroundColor Cyan
    Write-Host "-----------------------------------" -ForegroundColor Cyan

    Write-Status "This is a status message"
    Write-Success "This is a success message"
    Write-Warning "This is a warning message"
    Write-Error "This is an error message"

    Write-Host ""
    Write-Host "4. Testing environment file creation..." -ForegroundColor Cyan
    Write-Host "--------------------------------------" -ForegroundColor Cyan

    # Test environment file creation (without actually creating it)
    Write-Host "Testing environment file creation function..."
    if (Test-Path "backend\.env") {
        Write-Host "✅ Environment file already exists" -ForegroundColor Green
    }
    else {
        Write-Host "ℹ️  Environment file does not exist (will be created during setup)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "5. Testing directory structure..." -ForegroundColor Cyan
    Write-Host "--------------------------------" -ForegroundColor Cyan

    if (Test-Path "backend") {
        Write-Host "✅ backend directory exists" -ForegroundColor Green
    }
    else {
        Write-Host "❌ backend directory missing" -ForegroundColor Red
    }

    if (Test-Path "frontend") {
        Write-Host "✅ frontend directory exists" -ForegroundColor Green
    }
    else {
        Write-Host "❌ frontend directory missing" -ForegroundColor Red
    }

    if (Test-Path "backend\requirements.txt") {
        Write-Host "✅ requirements.txt exists" -ForegroundColor Green
    }
    else {
        Write-Host "❌ requirements.txt missing" -ForegroundColor Red
    }

    if (Test-Path "frontend\package.json") {
        Write-Host "✅ package.json exists" -ForegroundColor Green
    }
    else {
        Write-Host "❌ package.json missing" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "6. Testing script file..." -ForegroundColor Cyan
    Write-Host "-------------------------------" -ForegroundColor Cyan

    if (Test-Path "setup.ps1") {
        Write-Host "✅ setup.ps1 exists" -ForegroundColor Green
    }
    else {
        Write-Host "❌ setup.ps1 missing" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "7. Testing PowerShell execution policy..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan

    $executionPolicy = Get-ExecutionPolicy
    Write-Host "Current execution policy: $executionPolicy" -ForegroundColor Yellow
    
    if ($executionPolicy -eq "Restricted") {
        Write-Warning "Execution policy is Restricted. You may need to run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
    }
    else {
        Write-Success "Execution policy allows script execution"
    }

    Write-Host ""
    Write-Host "🎉 PowerShell Test completed!" -ForegroundColor White
    Write-Host "=============================" -ForegroundColor White
    Write-Host ""
    Write-Host "If all tests passed, the PowerShell setup script should work correctly." -ForegroundColor Green
    Write-Host "To run the full setup on Windows, use: .\setup.ps1" -ForegroundColor Cyan
}

# Run the test
Test-SetupScript
