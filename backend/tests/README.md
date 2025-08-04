# Yogya Backend Tests

This directory contains test scripts for the Yogya backend API.

## Test Files

### `test_api_docs.py`
- **Purpose**: Tests API documentation and CORS functionality
- **Usage**: `python tests/test_api_docs.py`
- **What it tests**: 
  - API endpoint connectivity
  - CORS headers
  - Documentation server
  - OpenAPI specification validity

### `test_application_tracking.py`
- **Purpose**: Comprehensive test of the Application Tracking System
- **Usage**: `python tests/test_application_tracking.py`
- **What it tests**:
  - Job description creation
  - Candidate management
  - Resume upload and processing
  - Matching algorithms
  - Application lifecycle
  - Analytics and reporting

### `test_skill_management.py`
- **Purpose**: Tests automatic skill extraction and management
- **Usage**: `python tests/test_skill_management.py`
- **What it tests**:
  - Resume skill extraction
  - Candidate skill management
  - Auto-population features

### `manual_test_demo.py`
- **Purpose**: Demonstrates core NLP functionality without Django server
- **Usage**: `python tests/manual_test_demo.py`
- **What it demonstrates**:
  - Skill extraction from text
  - JD skill extraction
  - Skill matching algorithms
  - Auto-population workflow

## Running Tests

### Quick API Test
```bash
python tests/test_api_docs.py
```

### Full Application Test
```bash
python tests/test_application_tracking.py
```

### Skill Management Test
```bash
python tests/test_skill_management.py
```

### NLP Demo
```bash
python tests/manual_test_demo.py
```

## Test Requirements

- Django server running on port 8000
- Documentation server running on port 8080
- All dependencies installed from requirements.txt

## Notes

- These are integration tests, not unit tests
- They require the Django server to be running
- They create test data that may need cleanup
- Use for development and verification purposes 