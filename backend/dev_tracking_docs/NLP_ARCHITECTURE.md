# Yogya: NLP-Powered Resume-JD Matching System

## Overview

Yogya is a sophisticated **NLP-powered Applicant Tracking System (ATS)** that uses advanced Natural Language Processing techniques to match job descriptions with resumes. The system goes beyond simple keyword matching to provide intelligent, semantic-based scoring that mimics real-world ATS systems.

## 🤖 NLP Components Architecture

### 1. NLTK (Natural Language Toolkit)

**Purpose:** Core text processing and linguistic analysis

**Components:**
- **Stopwords Removal:** Filters out common words like "the", "and", "or" while preserving important technical terms
- **Lemmatization:** Converts words to their base form (e.g., "years" → "year", "developing" → "develop")
- **WordNet:** Provides semantic relationships and word hierarchies
- **Custom Stopwords Management:** Preserves crucial technical terms and connecting words

**Example:**
```python
# Original: "Python Developer with 5 years experience in Django REST API development"
# After NLTK Processing: "python developer with 5 year experience in django rest api development"
```

### 2. SpaCy (Advanced NLP)

**Purpose:** Semantic understanding and advanced text analysis

**Components:**
- **Semantic Similarity:** Uses word vectors for meaning-based matching
- **Named Entity Recognition (NER):** Identifies names, organizations, dates, locations
- **Document Processing:** Advanced text analysis capabilities
- **Model:** `en_core_web_md` (medium model with comprehensive word vectors)

**Usage:**
```python
# Semantic similarity calculation
similarity = doc1.similarity(doc2)  # Returns 0.0 to 1.0
```

### 3. Scikit-learn (Machine Learning)

**Purpose:** Vectorization and similarity calculations

**Components:**
- **TF-IDF Vectorization:** Converts text to numerical vectors
- **Cosine Similarity:** Measures similarity between document vectors
- **N-gram Features:** Captures phrases and word combinations (1-2 grams)
- **Parameter Optimization:** Fine-tuned for resume-JD matching

**Configuration:**
```python
TfidfVectorizer(
    ngram_range=(1, 2),  # Unigrams and bigrams
    min_df=1,            # Minimum document frequency
    max_df=1.0,          # Maximum document frequency
    norm='l2'            # L2 normalization
)
```

### 4. Custom NLP Pipeline

**Purpose:** Domain-specific text processing for technical resumes

**Components:**
- **Text Preprocessing:** Lowercasing, punctuation removal, tokenization
- **Regex Patterns:** Experience extraction, date parsing, version number preservation
- **Technical Term Recognition:** 200+ technical skills and tools
- **Context Preservation:** Keeps important connecting words ("with", "in", "of")

**Technical Terms Covered:**
- Programming Languages: Python, Java, JavaScript, TypeScript, C++, C#, Go, Rust, PHP, Ruby, Scala, Kotlin, Swift
- Web Frameworks: Django, Flask, FastAPI, Spring, Express, React, Vue, Angular, Node.js
- Databases: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, Cassandra, DynamoDB
- Cloud & DevOps: AWS, Azure, GCP, Docker, Kubernetes, Jenkins, Terraform, Ansible
- APIs & Architecture: REST, GraphQL, SOAP, gRPC, Microservices, Serverless, MVC, MVVM
- Development Practices: Agile, Scrum, Kanban, DevOps, CI/CD, TDD, BDD, Git
- Testing & Security: Unit Testing, Integration Testing, Selenium, Cypress, Jest, Pytest, Authentication, Authorization, SSL, TLS
- Data Science & AI: Machine Learning, Deep Learning, NLP, Computer Vision, Pandas, NumPy, TensorFlow, PyTorch
- Mobile & Web: React Native, Flutter, Xamarin, Ionic, Electron, PWA
- Monitoring & Infrastructure: Logging, Monitoring, Alerting, Metrics, APM, New Relic, Datadog, Sentry

### 5. Enhanced NLP Features

**Purpose:** Structured data extraction and advanced analysis

**Components:**
- **Structured Data Extraction:** Contact info, skills, experience, education, certifications
- **Multi-factor Scoring:** Combines multiple NLP techniques
- **Semantic Matching:** Beyond keyword matching
- **Experience Parsing:** Years of experience extraction with seniority bonuses
- **Education Recognition:** Degree types, certifications, institutions

## 📊 NLP Pipeline Flow

### Step 1: Text Extraction
```python
# Extract text from various file formats
- PDF files (PyPDF2)
- DOCX files (python-docx)
- Fallback to basic text extraction
```

### Step 2: Text Preprocessing
```python
# Apply NLP preprocessing
1. Lowercase conversion
2. Punctuation removal (preserving dots for version numbers)
3. Tokenization
4. Stopword removal (preserving technical terms)
5. Lemmatization
6. Custom filtering
```

### Step 3: Vectorization
```python
# Convert to numerical representation
1. TF-IDF vectorization
2. N-gram feature extraction
3. Cosine similarity calculation
```

### Step 4: Multi-Factor Scoring
```python
# ATS-like scoring system
1. Keyword/Skill matching (35% weight)
2. Experience level matching (25% weight)
3. Technical term overlap (25% weight)
4. Semantic similarity (10% weight)
5. Education & Certification matching (5% weight)
```

## 🎯 ATS Scoring Algorithm

### Formula:
```
Final Score = (Skill_Score × 0.35) + (Experience_Score × 0.25) + 
              (Technical_Score × 0.25) + (Semantic_Score × 0.10) + 
              (Education_Score × 0.05)
```

### Scoring Components:

#### 1. Skill Matching (35%)
- **Keyword overlap** between JD and resume
- **Technical skill recognition**
- **Programming language matching**
- **Framework and tool identification**

#### 2. Experience Matching (25%)
- **Years of experience extraction**
- **Seniority level assessment**
- **Experience tier scoring:**
  - Junior (0-2 years): 0.6-0.7
  - Mid-level (3-5 years): 0.7-0.8
  - Senior (6-8 years): 0.8-0.9
  - Lead/Architect (8+ years): 0.9-1.0
- **Seniority bonus** for leadership roles

#### 3. Technical Term Overlap (25%)
- **200+ technical terms** across categories
- **Bonus scoring** for multiple matching skills
- **Framework and tool recognition**
- **Industry-specific terminology**

#### 4. Semantic Similarity (10%)
- **SpaCy-based semantic matching**
- **Meaning-based similarity**
- **Context understanding**
- **Fallback to TF-IDF** if SpaCy unavailable

#### 5. Education & Certification (5%)
- **Degree type recognition**
- **Certification matching**
- **Institution relevance**
- **Educational background assessment**

## 🔧 Technical Implementation

### File Structure:
```
yogya/
├── resume_checker/
│   ├── nlp_utils.py          # Core NLP functions
│   ├── views.py              # API endpoints
│   ├── models.py             # Data models
│   └── serializers.py        # Data serialization
├── requirements.txt           # Dependencies
└── manage.py                 # Django management
```

### Key Functions:

#### `preprocess_text(text)`
- Applies comprehensive text preprocessing
- Preserves technical terms and context
- Handles version numbers and special characters

#### `calculate_similarity(text1, text2)`
- TF-IDF vectorization
- Cosine similarity calculation
- Optimized for short technical texts

#### `calculate_ats_similarity(jd_text, resume_text)`
- Multi-factor scoring algorithm
- Combines all NLP techniques
- Returns percentage score (0-100%)

#### `extract_years_of_experience(text)`
- Regex-based experience extraction
- Handles various date formats
- Calculates total years of experience

## 📈 Performance Characteristics

### Score Ranges:
- **Excellent Match:** 85-100%
- **Good Match:** 70-84%
- **Fair Match:** 50-69%
- **Poor Match:** 0-49%

### Accuracy Features:
- **Context Preservation:** Maintains important connecting words
- **Technical Term Recognition:** 200+ technical skills and tools
- **Experience Parsing:** Sophisticated date and experience extraction
- **Semantic Understanding:** Beyond keyword matching
- **Multi-factor Assessment:** Comprehensive evaluation

## 🚀 Advanced Features

### 1. Structured Data Extraction
- **resume-parser integration** (optional)
- **Contact information extraction**
- **Skills and competencies identification**
- **Work experience parsing**
- **Education and certification extraction**

### 2. Enhanced Scoring
- **Seniority bonuses** for leadership roles
- **Technical depth assessment**
- **Industry-specific scoring**
- **Certification recognition**

### 3. Error Handling
- **Graceful fallbacks** for missing libraries
- **SSL certificate handling** for NLTK downloads
- **Model loading error recovery**
- **Robust text extraction**

## 🔍 Example Usage

### API Endpoints:
```bash
# Match a resume with a job description
POST /api/resumes/{resume_id}/match/
{
    "job_description_id": 1
}

# Match all resumes with a job description
POST /api/job-descriptions/{jd_id}/match-all-resumes/
```

### Response Format:
```json
{
    "resume_id": 1,
    "job_description_id": 1,
    "score": 87.34,
    "match_percentage": 87.34,
    "is_match_above_60_percent": true,
    "detailed_breakdown": {
        "skill_score": 85.0,
        "experience_score": 90.0,
        "technical_score": 88.0,
        "semantic_score": 75.0,
        "education_score": 80.0
    }
}
```

## 🎯 Benefits of NLP-Powered System

### 1. Semantic Understanding
- **Meaning-based matching** beyond keywords
- **Context preservation** for better accuracy
- **Technical term recognition** for domain-specific scoring

### 2. Comprehensive Assessment
- **Multi-factor evaluation** mimics real ATS systems
- **Experience-based scoring** with seniority recognition
- **Education and certification** consideration

### 3. Scalability
- **Modular architecture** for easy enhancements
- **Library integration** for advanced features
- **Error handling** for robust operation

### 4. Accuracy
- **Refined preprocessing** for technical documents
- **Optimized parameters** for resume-JD matching
- **Balanced scoring** across multiple dimensions

## 🔮 Future Enhancements

### Potential Improvements:
1. **Machine Learning Models:** Custom-trained models for specific industries
2. **Advanced NER:** Better entity recognition for skills and experience
3. **Industry-Specific Scoring:** Tailored algorithms for different sectors
4. **Real-time Learning:** Continuous improvement based on user feedback
5. **Multi-language Support:** NLP processing for multiple languages

## 📚 Dependencies

### Core NLP Libraries:
- **NLTK:** Text processing and linguistic analysis
- **SpaCy:** Advanced NLP and semantic similarity
- **Scikit-learn:** Machine learning and vectorization
- **PyPDF2:** PDF text extraction
- **python-docx:** DOCX text extraction

### Optional Libraries:
- **resume-parser:** Enhanced structured data extraction
- **Additional SpaCy models:** For specific use cases

## 🎉 Conclusion

Yogya represents a **sophisticated NLP-powered ATS** that combines traditional natural language processing with modern machine learning techniques. The system provides intelligent, accurate, and comprehensive resume-JD matching that goes far beyond simple keyword matching, making it suitable for real-world recruitment scenarios.

The architecture is designed to be **modular, scalable, and maintainable**, with robust error handling and graceful fallbacks. The multi-factor scoring system ensures that matches are evaluated across multiple dimensions, providing a more holistic assessment of candidate-job fit.

---

*This document provides a comprehensive overview of the NLP architecture and implementation details for the Yogya project.* 