#!/usr/bin/env python3
"""
Test script to verify API documentation and CORS are working correctly.
"""

import requests
import json
import sys

def test_api_endpoint():
    """Test the main API endpoint."""
    try:
        response = requests.get(
            "http://127.0.0.1:8000/api/job_descriptions/",
            headers={
                "Content-Type": "application/json",
                "Origin": "http://localhost:8080"
            }
        )
        
        if response.status_code == 200:
            print("✅ API endpoint is working!")
            print(f"📊 Response status: {response.status_code}")
            print(f"🔗 CORS headers: {dict(response.headers)}")
            
            # Check for CORS headers
            cors_headers = [k for k in response.headers.keys() if 'access-control' in k.lower()]
            if cors_headers:
                print(f"✅ CORS headers found: {cors_headers}")
            else:
                print("⚠️  No CORS headers found")
                
            return True
        else:
            print(f"❌ API endpoint failed with status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server. Make sure it's running on port 8000.")
        return False
    except Exception as e:
        print(f"❌ Error testing API: {e}")
        return False

def test_documentation_server():
    """Test the documentation server."""
    try:
        response = requests.get("http://localhost:8080/api_docs.html")
        
        if response.status_code == 200:
            print("✅ Documentation server is working!")
            print(f"📊 Response status: {response.status_code}")
            return True
        else:
            print(f"❌ Documentation server failed with status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to documentation server. Make sure it's running on port 8080.")
        return False
    except Exception as e:
        print(f"❌ Error testing documentation: {e}")
        return False

def test_openapi_spec():
    """Test the OpenAPI specification."""
    try:
        response = requests.get("http://localhost:8080/openapi.yaml")
        
        if response.status_code == 200:
            print("✅ OpenAPI specification is accessible!")
            print(f"📊 Response status: {response.status_code}")
            
            # Check if it's valid YAML
            import yaml
            try:
                yaml.safe_load(response.text)
                print("✅ OpenAPI YAML is valid!")
                return True
            except yaml.YAMLError as e:
                print(f"❌ OpenAPI YAML is invalid: {e}")
                return False
        else:
            print(f"❌ OpenAPI specification failed with status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to documentation server.")
        return False
    except Exception as e:
        print(f"❌ Error testing OpenAPI spec: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Testing Yogya API Documentation Setup")
    print("=" * 50)
    
    tests = [
        ("API Endpoint", test_api_endpoint),
        ("Documentation Server", test_documentation_server),
        ("OpenAPI Specification", test_openapi_spec),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 50)
    print("📋 Test Results Summary:")
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test_name}: {status}")
        if not result:
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All tests passed! Your API documentation is working correctly.")
        print("\n🌐 You can now access your API documentation at:")
        print("   http://localhost:8080/api_docs.html")
        print("\n🔗 Your API is available at:")
        print("   http://127.0.0.1:8000/api/")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 