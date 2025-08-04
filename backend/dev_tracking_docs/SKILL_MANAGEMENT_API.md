# Skill Management API Guide

## 🎯 **New Auto-Skill Population System**

Your insight was correct! Skills are now automatically populated from resumes, and candidates can add/remove additional skills as needed.

## 📋 **How It Works**

### **1. Automatic Skill Extraction**
When a resume is uploaded:
- Skills are automatically extracted from the resume text
- These skills are added to the candidate's skill profile
- No duplicate skills are added (case-insensitive)

### **2. Manual Skill Management**
Candidates can add or remove skills after auto-population:
- Add skills they forgot to mention in resume
- Remove skills that are outdated or irrelevant
- Keep their skill profile up-to-date

### **3. Enhanced Matching**
The matching system now uses:
- **Candidate skills** (resume skills + manually added skills)
- **Job description skills** (extracted from JD)
- This provides more accurate and comprehensive matching

## 🚀 **API Endpoints**

### **1. Upload Resume (Auto-Populates Skills)**
```bash
POST /api/resumes/
Content-Type: multipart/form-data

{
    "candidate": 1,
    "file": <resume_file>
}
```

**Response:**
```json
{
    "id": 1,
    "candidate": 1,
    "file": "/media/resumes/resume.pdf",
    "extracted_skills": ["Python", "Django", "REST API", "PostgreSQL"],
    "message": "Resume uploaded and skills auto-populated"
}
```

### **2. View Candidate Skills**
```bash
GET /api/candidates/{candidate_id}/skills/
```

**Response:**
```json
{
    "candidate_id": "CAN-ABC123",
    "candidate_name": "Michael Chen",
    "skills": ["Python", "Django", "REST API", "PostgreSQL", "Docker"],
    "total_skills": 5
}
```

### **3. Add Skills to Candidate**
```bash
POST /api/candidates/{candidate_id}/manage-skills/
Content-Type: application/json

{
    "action": "add",
    "skills": ["AWS", "Kubernetes", "Microservices"]
}
```

**Response:**
```json
{
    "message": "Successfully added 3 new skills",
    "added_skills": ["AWS", "Kubernetes", "Microservices"],
    "total_skills": 8,
    "all_skills": ["Python", "Django", "REST API", "PostgreSQL", "Docker", "AWS", "Kubernetes", "Microservices"]
}
```

### **4. Remove Skills from Candidate**
```bash
POST /api/candidates/{candidate_id}/manage-skills/
Content-Type: application/json

{
    "action": "remove",
    "skills": ["Docker", "Kubernetes"]
}
```

**Response:**
```json
{
    "message": "Successfully removed 2 skills",
    "removed_skills": ["Docker", "Kubernetes"],
    "total_skills": 6,
    "all_skills": ["Python", "Django", "REST API", "PostgreSQL", "AWS", "Microservices"]
}
```

## 🎯 **Benefits of This Approach**

### **1. Reduced Data Entry**
- No need to manually enter skills when creating candidate profile
- Skills are automatically extracted from resume
- Eliminates typos and inconsistencies

### **2. Complete Skill Profile**
- Captures ALL skills mentioned in resume
- Candidates can add skills they forgot to mention
- More comprehensive matching

### **3. Better Matching Accuracy**
- Uses complete candidate skill profile
- Includes both resume skills and manually added skills
- More accurate ATS-like scoring

### **4. User-Friendly**
- Candidates can manage their skills easily
- No need to re-upload resume to update skills
- Flexible skill management

## 🔄 **Workflow Example**

### **Step 1: Create Candidate**
```bash
POST /api/candidates/
{
    "first_name": "Michael",
    "last_name": "Chen",
    "email": "michael@example.com"
}
```

### **Step 2: Upload Resume (Auto-Populates Skills)**
```bash
POST /api/resumes/
# Upload resume file
# Skills automatically extracted and added to candidate
```

### **Step 3: View Auto-Populated Skills**
```bash
GET /api/candidates/1/skills/
# Shows skills extracted from resume
```

### **Step 4: Add Additional Skills**
```bash
POST /api/candidates/1/manage-skills/
{
    "action": "add",
    "skills": ["AWS", "Docker", "Kubernetes"]
}
```

### **Step 5: Match with Job Description**
```bash
POST /api/resumes/1/match/
{
    "job_description_id": 1
}
# Uses complete candidate skill profile for matching
```

## 🎉 **Result**

- **Automatic skill extraction** from resumes
- **Manual skill management** for candidates
- **Enhanced matching accuracy** using complete skill profiles
- **Better user experience** with less manual work
- **More accurate ATS-like scoring**

This system now works like a real-world ATS where skills are automatically populated but can be customized as needed! 🚀 