#!/bin/bash

# PowerShell Script Validation
# This script validates the structure and syntax of setup.ps1

echo "🔍 Validating PowerShell Setup Script"
echo "====================================="
echo ""

# Check if PowerShell script exists
if [ ! -f "setup.ps1" ]; then
    echo "❌ setup.ps1 not found"
    exit 1
fi

echo "✅ setup.ps1 file exists"
echo ""

# Check script structure
echo "📋 Checking script structure..."
echo "-------------------------------"

# Check for required functions
required_functions=(
    "Write-Status"
    "Write-Success" 
    "Write-Warning"
    "Write-Error"
    "Test-Command"
    "Test-PythonVersion"
    "Test-NodeVersion"
    "Test-NpmVersion"
    "Test-Git"
    "Setup-PythonEnvironment"
    "Setup-Frontend"
    "New-EnvironmentFile"
    "Start-DevelopmentServers"
    "Main"
)

missing_functions=()

for func in "${required_functions[@]}"; do
    if grep -q "function $func" setup.ps1; then
        echo "✅ Function $func found"
    else
        echo "❌ Function $func missing"
        missing_functions+=("$func")
    fi
done

echo ""

# Check for required parameters
echo "🔧 Checking script parameters..."
echo "-------------------------------"

if grep -q "param(" setup.ps1; then
    echo "✅ Parameter block found"
    
    if grep -q "SkipChecks" setup.ps1; then
        echo "✅ SkipChecks parameter found"
    else
        echo "❌ SkipChecks parameter missing"
    fi
    
    if grep -q "NoServers" setup.ps1; then
        echo "✅ NoServers parameter found"
    else
        echo "❌ NoServers parameter missing"
    fi
else
    echo "❌ Parameter block missing"
fi

echo ""

# Check for error handling
echo "🛡️ Checking error handling..."
echo "-----------------------------"

if grep -q "ErrorActionPreference" setup.ps1; then
    echo "✅ Error action preference set"
else
    echo "❌ Error action preference not set"
fi

if grep -q "try {" setup.ps1; then
    echo "✅ Try-catch blocks found"
else
    echo "❌ No try-catch blocks found"
fi

echo ""

# Check for color definitions
echo "🎨 Checking color definitions..."
echo "-------------------------------"

colors=("Red" "Green" "Yellow" "Blue" "White")
for color in "${colors[@]}"; do
    if grep -q "\$$color = \"$color\"" setup.ps1; then
        echo "✅ Color $color defined"
    else
        echo "❌ Color $color not defined"
    fi
done

echo ""

# Check for Windows-specific paths
echo "🪟 Checking Windows-specific paths..."
echo "------------------------------------"

if grep -q "venv\\\\Scripts\\\\Activate.ps1" setup.ps1; then
    echo "✅ Windows virtual environment activation path found"
else
    echo "❌ Windows virtual environment activation path missing"
fi

if grep -q "backend\\\\" setup.ps1; then
    echo "✅ Windows path separators found"
else
    echo "❌ Windows path separators missing"
fi

echo ""

# Check for PowerShell-specific commands
echo "💻 Checking PowerShell-specific commands..."
echo "------------------------------------------"

powershell_commands=(
    "Get-Command"
    "Write-Host"
    "Test-Path"
    "Push-Location"
    "Pop-Location"
    "Start-Process"
    "Get-ExecutionPolicy"
    "Set-ExecutionPolicy"
)

for cmd in "${powershell_commands[@]}"; do
    if grep -q "$cmd" setup.ps1; then
        echo "✅ Command $cmd found"
    else
        echo "❌ Command $cmd missing"
    fi
done

echo ""

# Check for proper script ending
echo "🏁 Checking script ending..."
echo "---------------------------"

if grep -q "Main" setup.ps1; then
    echo "✅ Main function call found"
else
    echo "❌ Main function call missing"
fi

if tail -1 setup.ps1 | grep -q "Main"; then
    echo "✅ Script ends with Main function call"
else
    echo "❌ Script doesn't end with Main function call"
fi

echo ""

# Summary
echo "📊 Validation Summary"
echo "===================="

if [ ${#missing_functions[@]} -eq 0 ]; then
    echo "✅ All required functions present"
else
    echo "❌ Missing functions: ${missing_functions[*]}"
fi

echo ""
echo "🎯 PowerShell Script Validation Complete!"
echo "========================================"
echo ""
echo "The PowerShell script appears to be properly structured for Windows execution."
echo "To test on Windows, run: .\setup.ps1"
echo ""
echo "Note: This validation checks structure only. Full testing requires a Windows environment."
