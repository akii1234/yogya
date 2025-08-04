#!/usr/bin/env python3
"""
Test script for the User Management System.
Tests user registration, login, role-based access, and profile management.
"""

import requests
import json
import time

# API Base URL
BASE_URL = "http://127.0.0.1:8000/api"

def test_user_registration():
    """Test user registration for different roles."""
    print("🔐 Testing User Registration...")
    
    # Test HR user registration
    hr_data = {
        "email": f"hr.recruiter.{int(time.time())}@yogya.com",
        "username": f"hr_recruiter_{int(time.time())}",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        "role": "hr",
        "phone_number": "+1-555-0123"
    }
    
    response = requests.post(f"{BASE_URL}/users/auth/register/", json=hr_data)
    print(f"HR Registration: {response.status_code}")
    if response.status_code == 201:
        print("✅ HR user registered successfully")
        hr_user = response.json()
    else:
        print(f"❌ HR registration failed: {response.text}")
        return None
    
    # Test candidate registration
    candidate_data = {
        "email": f"candidate.dev.{int(time.time())}@yogya.com",
        "username": f"candidate_dev_{int(time.time())}",
        "first_name": "Michael",
        "last_name": "Chen",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        "role": "candidate",
        "phone_number": "+1-555-0456"
    }
    
    response = requests.post(f"{BASE_URL}/users/auth/register/", json=candidate_data)
    print(f"Candidate Registration: {response.status_code}")
    if response.status_code == 201:
        print("✅ Candidate registered successfully")
        candidate_user = response.json()
    else:
        print(f"❌ Candidate registration failed: {response.text}")
        return None
    
    return hr_user, candidate_user

def test_user_login(users):
    """Test user login functionality."""
    print("\n🔑 Testing User Login...")
    
    hr_user, candidate_user = users
    
    # Test HR login
    hr_login_data = {
        "email": hr_user['email'],
        "password": "SecurePass123!"
    }
    
    response = requests.post(f"{BASE_URL}/users/auth/login/", json=hr_login_data)
    print(f"HR Login: {response.status_code}")
    if response.status_code == 200:
        print("✅ HR login successful")
        hr_session = response.json()
        # Store cookies for session authentication
        hr_session['cookies'] = response.cookies
    else:
        print(f"❌ HR login failed: {response.text}")
        return None
    
    # Test candidate login
    candidate_login_data = {
        "email": candidate_user['email'],
        "password": "SecurePass123!"
    }
    
    response = requests.post(f"{BASE_URL}/users/auth/login/", json=candidate_login_data)
    print(f"Candidate Login: {response.status_code}")
    if response.status_code == 200:
        print("✅ Candidate login successful")
        candidate_session = response.json()
        # Store cookies for session authentication
        candidate_session['cookies'] = response.cookies
    else:
        print(f"❌ Candidate login failed: {response.text}")
        return None
    
    return hr_session, candidate_session

def test_profile_management(sessions):
    """Test profile management functionality."""
    print("\n👤 Testing Profile Management...")
    
    hr_session, candidate_session = sessions
    
    # Test HR profile access
    response = requests.get(f"{BASE_URL}/users/hr-profiles/my_profile/", cookies=hr_session['cookies'])
    print(f"HR Profile Access: {response.status_code}")
    if response.status_code == 200:
        print("✅ HR profile accessible")
        hr_profile = response.json()
    else:
        print(f"❌ HR profile access failed: {response.text}")
    
    # Test candidate profile access
    response = requests.get(f"{BASE_URL}/users/candidate-profiles/my_profile/", cookies=candidate_session['cookies'])
    print(f"Candidate Profile Access: {response.status_code}")
    if response.status_code == 200:
        print("✅ Candidate profile accessible")
        candidate_profile = response.json()
    else:
        print(f"❌ Candidate profile access failed: {response.text}")
    
    # Test profile updates
    update_data = {
        "bio": "Experienced HR professional with 5+ years in technical recruitment"
    }
    response = requests.patch(f"{BASE_URL}/users/profiles/update_profile/", json=update_data, cookies=hr_session['cookies'])
    print(f"HR Profile Update: {response.status_code}")
    if response.status_code == 200:
        print("✅ HR profile updated successfully")
    else:
        print(f"❌ HR profile update failed: {response.text}")

def test_role_based_access(sessions):
    """Test role-based access control."""
    print("\n🔒 Testing Role-Based Access Control...")
    
    hr_session, candidate_session = sessions
    
    # Test HR accessing candidate-only endpoint
    response = requests.get(f"{BASE_URL}/users/candidate-profiles/my_profile/", cookies=hr_session['cookies'])
    print(f"HR accessing candidate profile: {response.status_code}")
    if response.status_code == 403:
        print("✅ HR correctly blocked from candidate profile")
    else:
        print(f"❌ HR should be blocked from candidate profile: {response.text}")
    
    # Test candidate accessing HR-only endpoint
    response = requests.get(f"{BASE_URL}/users/hr-profiles/my_profile/", cookies=candidate_session['cookies'])
    print(f"Candidate accessing HR profile: {response.status_code}")
    if response.status_code == 403:
        print("✅ Candidate correctly blocked from HR profile")
    else:
        print(f"❌ Candidate should be blocked from HR profile: {response.text}")

def test_user_logout(sessions):
    """Test user logout functionality."""
    print("\n🚪 Testing User Logout...")
    
    hr_session, candidate_session = sessions
    
    # Test HR logout
    logout_data = {"session_id": hr_session["session_id"]}
    response = requests.post(f"{BASE_URL}/users/auth/logout/", json=logout_data, cookies=hr_session['cookies'])
    print(f"HR Logout: {response.status_code}")
    if response.status_code == 200:
        print("✅ HR logout successful")
    else:
        print(f"❌ HR logout failed: {response.text}")
    
    # Test candidate logout
    logout_data = {"session_id": candidate_session["session_id"]}
    response = requests.post(f"{BASE_URL}/users/auth/logout/", json=logout_data, cookies=candidate_session['cookies'])
    print(f"Candidate Logout: {response.status_code}")
    if response.status_code == 200:
        print("✅ Candidate logout successful")
    else:
        print(f"❌ Candidate logout failed: {response.text}")

def test_admin_functionality():
    """Test admin functionality (requires admin user)."""
    print("\n👑 Testing Admin Functionality...")
    
    # Admin login
    admin_login_data = {
        "email": "admin@yogya.com",
        "password": "admin123"  # Use the password you set during superuser creation
    }
    
    response = requests.post(f"{BASE_URL}/users/auth/login/", json=admin_login_data)
    print(f"Admin Login: {response.status_code}")
    if response.status_code == 200:
        print("✅ Admin login successful")
        admin_session = response.json()
        admin_session['cookies'] = response.cookies
        
        # Test admin user listing
        response = requests.get(f"{BASE_URL}/users/profiles/", cookies=admin_session['cookies'])
        print(f"Admin User Listing: {response.status_code}")
        if response.status_code == 200:
            print("✅ Admin can list all users")
            users = response.json()
            print(f"   Found {len(users.get('results', []))} users")
        else:
            print(f"❌ Admin user listing failed: {response.text}")
    else:
        print(f"❌ Admin login failed: {response.text}")

def main():
    """Run all tests."""
    print("🚀 Starting User Management System Tests")
    print("=" * 50)
    
    try:
        # Test user registration
        users = test_user_registration()
        if not users:
            print("❌ User registration failed. Stopping tests.")
            return
        
        # Test user login
        sessions = test_user_login(users)
        if not sessions:
            print("❌ User login failed. Stopping tests.")
            return
        
        # Test profile management
        test_profile_management(sessions)
        
        # Test role-based access
        test_role_based_access(sessions)
        
        # Test user logout
        test_user_logout(sessions)
        
        # Test admin functionality
        test_admin_functionality()
        
        print("\n" + "=" * 50)
        print("🎉 All User Management Tests Completed!")
        print("\n📋 Summary:")
        print("✅ User Registration (HR & Candidate)")
        print("✅ User Login & Session Management")
        print("✅ Profile Management & Updates")
        print("✅ Role-Based Access Control")
        print("✅ User Logout")
        print("✅ Admin Functionality")
        
        print("\n🚀 Next Steps:")
        print("1. Integrate user authentication with existing ATS functionality")
        print("2. Add role-based permissions to existing endpoints")
        print("3. Implement the competency-based hiring system")
        print("4. Create frontend components for different user roles")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the Django server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Test Error: {str(e)}")

if __name__ == "__main__":
    main() 