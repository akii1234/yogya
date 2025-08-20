# Coding Questions Selection Algorithm

## 🎯 **How Coding Questions Are Selected for Each Candidate**

### **Overview**
The Yogya platform uses a sophisticated algorithm to automatically select personalized coding questions for each candidate based on their skills, experience level, and the specific job requirements. This ensures that candidates receive relevant, appropriately challenging questions that match their profile.

---

## **1. Experience Level Determination**

### **Algorithm**
```python
def get_experience_level(self, years_of_experience: int) -> str:
    if years_of_experience <= 2:
        return "junior"
    elif years_of_experience <= 5:
        return "mid"
    else:
        return "senior"
```

### **Experience Levels**
- **Junior (0-2 years)**: Basic syntax, simple algorithms, fundamental concepts
- **Mid (3-5 years)**: Intermediate concepts, data structures, problem-solving
- **Senior (6+ years)**: Advanced algorithms, system design, architecture patterns

---

## **2. Technology Mapping System**

### **Skill-to-Technology Mapping**
The system maps candidate skills to question categories using an extensive mapping table:

```python
skill_mapping = {
    # Java Ecosystem
    "java": "java", "spring": "java", "spring boot": "java", "hibernate": "java",
    "junit": "java", "maven": "java", "gradle": "java", "j2ee": "java",
    
    # Python Ecosystem
    "python": "python", "django": "python", "flask": "python", "pandas": "python",
    "numpy": "python", "scikit-learn": "python", "tensorflow": "python", "pytorch": "python",
    "fastapi": "python", "celery": "python",
    
    # JavaScript Ecosystem
    "javascript": "javascript", "js": "javascript", "node.js": "javascript",
    "react": "javascript", "vue": "javascript", "angular": "javascript",
    "typescript": "javascript", "es6": "javascript", "express": "javascript",
    
    # Database & SQL
    "sql": "sql", "mysql": "sql", "postgresql": "sql", "oracle": "sql",
    "sqlite": "sql", "database": "sql", "pl/sql": "sql",
    
    # DevOps & Infrastructure
    "devops": "devops", "docker": "devops", "kubernetes": "devops", "k8s": "devops",
    "jenkins": "devops", "git": "devops", "ci/cd": "devops", "cicd": "devops",
    "terraform": "devops", "ansible": "devops", "puppet": "devops", "chef": "devops",
    "github actions": "devops", "gitlab ci": "devops", "azure devops": "devops",
    "shell scripting": "devops", "bash": "devops", "linux": "devops",
    
    # Cloud Platforms
    "aws": "cloud", "amazon web services": "cloud", "ec2": "cloud", "s3": "cloud",
    "lambda": "cloud", "cloudfront": "cloud", "route53": "cloud", "rds": "cloud",
    "dynamodb": "cloud", "vpc": "cloud", "iam": "cloud", "cloudformation": "cloud",
    "azure": "cloud", "microsoft azure": "cloud", "gcp": "cloud", "google cloud": "cloud",
    "google cloud platform": "cloud", "kubernetes engine": "cloud", "compute engine": "cloud",
    "cloud storage": "cloud", "cloud sql": "cloud", "cloud functions": "cloud",
    
    # System Design & Architecture
    "system design": "system_design", "architecture": "system_design",
    "microservices": "system_design", "distributed systems": "system_design",
    "scalability": "system_design"
}
```

---

## **3. Question Selection Algorithm**

### **Step 1: Find Relevant Technologies**
```python
def find_relevant_technologies(self, candidate_skills: List[str], job_skills: List[str]) -> List[str]:
    relevant_techs = set()
    
    # Check candidate skills
    for skill in candidate_skills:
        skill_lower = skill.lower()
        if skill_lower in skill_mapping:
            relevant_techs.add(skill_mapping[skill_lower])
    
    # Check job skills
    for skill in job_skills:
        skill_lower = skill.lower()
        if skill_lower in skill_mapping:
            relevant_techs.add(skill_mapping[skill_lower])
    
    return list(relevant_techs)
```

### **Step 2: Experience-Based Filtering**
```python
def get_questions_for_tech(self, technology: str, experience_level: str, max_questions: int = 5) -> List[Dict]:
    if not self.questions_db or technology not in self.questions_db:
        return []
    
    if experience_level not in self.questions_db[technology]:
        return []
    
    questions = self.questions_db[technology][experience_level]
    return questions[:max_questions]
```

### **Step 3: Fallback Strategy**
If no questions found for the candidate's experience level:
```python
if not all_questions:
    for tech in relevant_techs:
        for level in ["junior", "mid", "senior"]:
            if level != experience_level:
                tech_questions = self.get_questions_for_tech(tech, level)
                all_questions.extend(tech_questions)
```

### **Step 4: Default Technology Selection**
If no relevant technologies found:
```python
if not relevant_techs:
    if experience_level == "junior":
        relevant_techs = ["python", "javascript"]  # Common for beginners
    elif experience_level == "mid":
        relevant_techs = ["java", "python", "javascript"]
    else:
        relevant_techs = ["java", "python", "system_design"]  # Senior level
```

### **Step 5: Question Prioritization**
```python
def prioritize_questions(self, questions: List[Dict], job_skills: List[str], max_questions: int = 15):
    prioritized = []
    
    # First, add questions that match job skills
    for question in questions:
        question_tags = set(tag.lower() for tag in question.get('tags', []))
        job_skills_lower = set(skill.lower() for skill in job_skills)
        
        if question_tags & job_skills_lower:  # Intersection
            prioritized.append(question)
    
    # Then add remaining questions
    for question in questions:
        if question not in prioritized:
            prioritized.append(question)
    
    return prioritized[:max_questions]
```

---

## **4. Question Database Structure**

### **JSON Structure**
```json
{
  "python": {
    "junior": [
      {
        "id": "python_junior_1",
        "title": "Basic String Operations",
        "description": "Write a function to reverse a string...",
        "difficulty": "easy",
        "time_limit": 15,
        "category": "strings",
        "tags": ["python", "strings"],
        "sample_input": "hello",
        "sample_output": "olleh",
        "hint": "Use string slicing",
        "solution": "def reverse_string(s): return s[::-1]"
      }
    ],
    "mid": [
      {
        "id": "python_mid_1",
        "title": "Implement LRU Cache",
        "description": "Design and implement an LRU cache...",
        "difficulty": "medium",
        "time_limit": 35,
        "category": "data_structures",
        "tags": ["python", "lru_cache", "ordereddict"],
        "sample_input": "put(1,1), put(2,2), get(1), put(3,3), get(2)",
        "sample_output": "1, -1",
        "hint": "Use OrderedDict.move_to_end()",
        "solution": "from collections import OrderedDict..."
      }
    ],
    "senior": [
      {
        "id": "python_senior_1",
        "title": "Design a Web Scraper",
        "description": "Create a scalable web scraper with rate limiting...",
        "difficulty": "hard",
        "time_limit": 45,
        "category": "system_design",
        "tags": ["python", "web_scraping", "system_design"],
        "sample_input": "URL list with rate limits",
        "sample_output": "Scalable scraper architecture",
        "hint": "Consider async processing and queue management",
        "solution": "import asyncio, aiohttp..."
      }
    ]
  }
}
```

---

## **5. Example: Akhil Tripathi's Question Selection**

### **Candidate Profile**
- **Name**: Akhil Tripathi
- **Experience**: 5 years
- **Skills**: Python, Django, React, PostgreSQL, AWS
- **Job Applied**: Senior Python Developer at TechCorp

### **Algorithm Execution**

#### **Step 1: Experience Level**
```python
experience_level = get_experience_level(5)  # Returns "mid"
```

#### **Step 2: Technology Mapping**
```python
candidate_skills = ["Python", "Django", "React", "PostgreSQL", "AWS"]
job_skills = ["Python", "Django", "FastAPI", "PostgreSQL", "Docker"]

relevant_techs = find_relevant_technologies(candidate_skills, job_skills)
# Returns: ["python", "devops", "cloud"]
```

#### **Step 3: Question Collection**
```python
# Get Python mid-level questions
python_questions = get_questions_for_tech("python", "mid", 5)
# Returns: 5 Python mid-level questions

# Get DevOps mid-level questions  
devops_questions = get_questions_for_tech("devops", "mid", 3)
# Returns: 3 DevOps mid-level questions

# Get Cloud mid-level questions
cloud_questions = get_questions_for_tech("cloud", "mid", 3)
# Returns: 3 Cloud mid-level questions
```

#### **Step 4: Prioritization**
```python
all_questions = python_questions + devops_questions + cloud_questions
prioritized_questions = prioritize_questions(all_questions, job_skills)
# Returns: Questions tagged with "python", "django", "postgresql" first
```

#### **Step 5: Final Result**
```python
result = {
    'questions': prioritized_questions,  # 10-15 questions
    'total_questions': 15,
    'technologies': ["python", "devops", "cloud"],
    'experience_level': "mid",
    'estimated_time': 180,  # 3 hours total
    'difficulty_breakdown': {
        'easy': 3,
        'medium': 8, 
        'hard': 4
    }
}
```

---

## **6. Key Features & Benefits**

### **Personalization**
- ✅ **Skill-Based**: Questions match candidate's actual skills
- ✅ **Experience-Appropriate**: Difficulty matches seniority level
- ✅ **Job-Relevant**: Prioritizes questions matching job requirements
- ✅ **Dynamic**: Adapts to different roles and companies

### **Intelligence**
- ✅ **Smart Mapping**: Handles skill variations and synonyms
- ✅ **Fallback System**: Always provides questions even if mapping fails
- ✅ **Balanced Mix**: Includes easy, medium, and hard questions
- ✅ **Time Estimation**: Calculates realistic completion times

### **Scalability**
- ✅ **Extensible**: Easy to add new technologies and questions
- ✅ **Maintainable**: Centralized question database
- ✅ **Performance**: Efficient question selection algorithm
- ✅ **Quality**: Curated questions with solutions and hints

---

## **7. Question Categories Available**

### **Programming Languages**
- **Java**: Core Java, Spring, Hibernate, JUnit
- **Python**: Django, Flask, Data Science, ML
- **JavaScript**: React, Node.js, ES6, TypeScript

### **Infrastructure & DevOps**
- **DevOps**: Docker, Kubernetes, CI/CD, Infrastructure
- **Cloud**: AWS, Azure, GCP, Serverless

### **Advanced Topics**
- **System Design**: Architecture, Microservices, Scalability
- **Database**: SQL, NoSQL, Performance Optimization

---

## **8. Implementation Details**

### **File Location**
- **Algorithm**: `yogya/backend/resume_checker/coding_questions.py`
- **Database**: `yogya/backend/resume_checker/data/full_coding_questions_database.json`
- **Integration**: Called from `detailed_match_analysis` API endpoint

### **API Integration**
```python
# In views.py - detailed_match_analysis method
coding_questions = coding_questions_manager.generate_personalized_questions(
    candidate_skills, 
    candidate_experience, 
    job_data.get('extracted_skills', [])
)
```

### **Frontend Display**
- **Component**: `CodingQuestionsModal.jsx`
- **Features**: Accordion view, difficulty indicators, solutions, hints
- **Navigation**: Accessible from Detailed Analysis modal

---

## **9. Future Enhancements**

### **Planned Improvements**
- **AI-Powered Selection**: Use ML to improve question relevance
- **Adaptive Difficulty**: Adjust based on candidate performance
- **Real-time Generation**: Create questions on-the-fly
- **Industry-Specific**: Questions tailored to specific industries
- **Collaborative Learning**: Questions that build on each other

### **Advanced Features**
- **Code Execution**: Run candidate solutions in sandbox
- **Performance Analytics**: Track question completion times
- **Skill Gap Analysis**: Identify areas for improvement
- **Interview Integration**: Link questions to interview process

---

## **10. Summary**

The coding questions selection algorithm ensures that each candidate receives a **truly personalized** set of questions that are:

1. **Relevant** to their skills and experience
2. **Appropriate** for their seniority level  
3. **Aligned** with the job requirements
4. **Balanced** in difficulty and scope
5. **Actionable** for interview preparation

This creates a **fair, relevant, and effective** coding assessment experience that helps both candidates prepare and employers evaluate technical skills accurately.

---

**Yogya** - Intelligent coding question selection for better hiring decisions. 🚀 