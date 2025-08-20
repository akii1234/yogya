# Registration 400 Error Troubleshooting Guide

## Problem
Getting "POST /api/users/auth/register/ HTTP/1.1" 400 error when trying to register a new candidate.

## Root Causes & Solutions

### 1. 🔐 **Password Validation Issues**

**Common Causes:**
- Password less than 8 characters
- Using common passwords like "password123", "test123", "12345678"
- Password too similar to user information

**✅ Solution:**
```javascript
// ✅ Good passwords
"MySecurePass2024!"
"ComplexPassword123$"
"StrongP@ssw0rd2024"

// ❌ Bad passwords  
"test123"           // Too common
"password"          // Too short & common
"12345678"          // Too common
```

**Test:** Try registering with a strong password containing:
- At least 8 characters
- Mix of letters, numbers, and special characters
- Not commonly used passwords

### 2. 📧 **Duplicate Email/Username**

**Error Messages:**
```json
{
  "email": ["User with this email already exists."],
  "username": ["A user with that username already exists."]
}
```

**✅ Solutions:**
- Use a unique email address that hasn't been registered before
- Check if user already exists in the system
- Consider implementing "forgot password" flow instead of re-registering

**Test Commands:**
```bash
# Check if email exists in database
python manage.py shell
>>> from user_management.models import User
>>> User.objects.filter(email="test@example.com").exists()
```

### 3. 📝 **Missing Required Fields**

**Required Fields:**
- `email` (string, valid email format)
- `username` (string, automatically set to email)
- `password` (string, min 8 chars)
- `password_confirm` (string, must match password)
- `first_name` (string)
- `last_name` (string)
- `role` (string, defaults to "candidate")

**✅ Example Valid Request:**
```json
{
  "username": "candidate@example.com",
  "email": "candidate@example.com",
  "password": "SecurePassword2024!",
  "password_confirm": "SecurePassword2024!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "candidate"
}
```

### 4. 🔧 **Frontend Data Issues**

**Common Issues:**
- Form validation not working properly
- Data not being sent correctly to API
- Missing field mappings

**Debug Steps:**
1. Open browser Developer Tools → Network tab
2. Try to register a candidate
3. Look at the request payload in the network tab
4. Verify all required fields are being sent

### 5. 🖥️ **Server Configuration**

**Check Server Status:**
- Django server running on port 8001: ✅
- Frontend server running on port 5173: ✅

**Debug Request:**
```bash
# Test registration directly
curl -X POST "http://127.0.0.1:8001/api/users/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newcandidate@example.com",
    "email": "newcandidate@example.com",
    "password": "TestPassword123!",
    "password_confirm": "TestPassword123!",
    "first_name": "Test",
    "last_name": "Candidate",
    "role": "candidate"
  }'
```

## Enhanced Error Handling ✨

**Updated Features:**
- ✅ Specific field error messages
- ✅ Multi-line error display in frontend
- ✅ Better error parsing from API responses
- ✅ Detailed console logging for debugging

**Error Message Examples:**
```
❌ Before: "Registration failed"

✅ After: 
"Email: User with this email already exists.
Password: This password is too short. It must contain at least 8 characters."
```

## Quick Testing Steps

### 1. **Test with New Unique Email:**
```
Email: testcandidate123@example.com
Password: SecurePassword2024!
First Name: Test
Last Name: Candidate
Role: candidate
```

### 2. **Check Console Logs:**
- Open browser Developer Tools → Console
- Look for registration error details
- Check Network tab for HTTP response

### 3. **Verify Backend Response:**
```bash
# Test endpoint directly
cd /Users/akhiltripathi/dev/yogya/backend
source venv/bin/activate
curl -X POST "http://127.0.0.1:8001/api/users/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{"username":"unique@test.com","email":"unique@test.com","password":"StrongPass123!","password_confirm":"StrongPass123!","first_name":"Test","last_name":"User","role":"candidate"}'
```

## Most Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Password too weak | Use 8+ chars with letters, numbers, symbols |
| Email already exists | Use different email or reset password |
| Missing first/last name | Fill all required form fields |
| Network error | Check servers are running on correct ports |
| Form validation error | Check browser console for detailed errors |

## Prevention Tips

1. **Strong Passwords:** Always use complex passwords with 8+ characters
2. **Unique Emails:** Use fresh email addresses for testing
3. **Complete Forms:** Fill all required fields before submitting
4. **Check Console:** Always check browser console for detailed errors
5. **Test Endpoint:** Use curl to test backend directly when debugging

## Need Help?

If the issue persists:
1. Check the specific error message in the browser console
2. Test the endpoint directly with curl
3. Verify all form fields are properly filled
4. Ensure the email hasn't been used before
5. Try with a different, stronger password

The registration system is now equipped with detailed error messages to help identify the exact cause of any 400 errors! 🎯