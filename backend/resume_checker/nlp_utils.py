# hiring_app/nlp_utils.py
import io
from PyPDF2 import PdfReader # For PDF parsing
from docx import Document # For DOCX parsing
import nltk
from nltk.corpus import stopwords # For stop word removal
from nltk.stem import WordNetLemmatizer # For lemmatization
import spacy # For advanced NLP, especially semantic similarity
from sklearn.feature_extraction.text import TfidfVectorizer # For TF-IDF vectorization
from sklearn.metrics.pairwise import cosine_similarity # For cosine similarity calculation
import re # For regular expressions
import ssl # Added for SSL certificate handling
import os # For path handling

# --- Set NLTK Data Path ---
# Set the NLTK data path to the user's directory where data is already downloaded
nltk.data.path.append('/Users/akhiltripathi/nltk_data')

# --- NLTK Downloads Error Handling ---
# LookupError is the base exception for resource not found errors in NLTK.

# --- Temporary SSL Context for NLTK Downloads (USE WITH CAUTION) ---
# Create an unverified SSL context to bypass certificate verification.
# This is a temporary workaround for 'CERTIFICATE_VERIFY_FAILED' errors.
# DO NOT USE IN PRODUCTION.
_create_unverified_https_context = ssl._create_unverified_context

# --- NLTK Downloads (Run these once or include in your Dockerfile/entrypoint) ---
# Check if stopwords and wordnet are available, download if not.
# This prevents errors if running for the first time without pre-downloaded data.
try:
    nltk.data.find('corpora/stopwords')
    print("NLTK stopwords found in data path.")
except LookupError:
    print("NLTK stopwords not found. Attempting download with temporary SSL bypass...")
    # Temporarily set the unverified context for NLTK downloads
    ssl._create_default_https_context = _create_unverified_https_context
    try:
        nltk.download('stopwords')
    finally:
        # Revert to the default context immediately after download attempt
        ssl._create_default_https_context = ssl.create_default_context
    print("NLTK stopwords download attempt finished.")

try:
    nltk.data.find('corpora/wordnet')
    print("NLTK wordnet found in data path.")
except LookupError:
    print("NLTK wordnet not found. Attempting download with temporary SSL bypass...")
    # Temporarily set the unverified context for NLTK downloads
    ssl._create_default_https_context = _create_unverified_https_context
    try:
        nltk.download('wordnet')
    finally:
        # Revert to the default context immediately after download attempt
        ssl._create_default_https_context = ssl.create_default_context
    print("NLTK wordnet download attempt finished.")



try:
    nlp = spacy.load("en_core_web_md") # Changed from sm to md for better semantic similarity
except OSError:
    print("SpaCy model 'en_core_web_md' not found. Attempting to download...")
    from spacy.cli import download
    download("en_core_web_md") # Changed from sm to md
    nlp = spacy.load("en_core_web_md") # Load after successful download

# --- NLP Global Resources ---
custom_stop_words = set(stopwords.words('english'))

words_to_keep_always = {
    'years', 'year', 'experience', 'minimum', 'plus',
    'api', 'apis', 'rest', 'django', 'docker', 'postgresql', 'aws',
    'python', 'java', 'sql', 'backend', 'cloud', 'devops', 'agile',
    'javascript', 'terraform', 'jenkins', 'kubernetes', 'git',
    'flask', 'fastapi', 'drf', 'mysql', 'mongodb', 'linux', 'windows',
    'microservices', 'automation', 'optimization', 'delivery', 'lead',
    'technical', 'engineer', 'developer', 'architect', 'fullstack', 'full-stack',
    'with', 'in', 'of', 'for', 'and', 'or', 'the', 'a', 'an'  # Important connecting words
}

# Remove words from custom_stop_words if they are in words_to_keep_always
custom_stop_words = custom_stop_words - words_to_keep_always

lemmatizer = WordNetLemmatizer() # Lemmatizer for reducing words to their base form

# --- Enhanced Resume Parsing with resume-parser library ---
RESUME_PARSER_AVAILABLE = False
try:
    from resume_parser import ResumeParser
    RESUME_PARSER_AVAILABLE = True
except (ImportError, OSError) as e:
    print(f"Warning: resume-parser library not available ({e}). Using basic parsing.")

def extract_structured_resume_data(file_path):
    """
    Enhanced resume parsing using the resume-parser library.
    Falls back to basic text extraction if the library is not available.
    
    Args:
        file_path (str): Path to the resume file
    Returns:
        dict: Structured resume data with contact, skills, experience, education
    """
    if not RESUME_PARSER_AVAILABLE:
        # Fallback to basic text extraction
        return {"raw_text": extract_text_from_file(file_path)}
    
    try:
        # Use resume-parser for structured extraction
        parser = ResumeParser(file_path)
        extracted_data = parser.get_extracted_data()
        
        # Return structured data
        return {
            "contact_info": {
                "name": extracted_data.get("name", ""),
                "email": extracted_data.get("email", ""),
                "phone": extracted_data.get("phone", ""),
                "location": extracted_data.get("location", "")
            },
            "skills": extracted_data.get("skills", []),
            "experience": extracted_data.get("experience", []),
            "education": extracted_data.get("education", []),
            "certifications": extracted_data.get("certifications", []),
            "raw_text": extracted_data.get("text", "")
        }
    except Exception as e:
        print(f"Error with resume-parser: {e}")
        # Fallback to basic text extraction
        return {"raw_text": extract_text_from_file(file_path)}

def extract_text_from_file(file_input):
    """
    Unified text extraction function that handles different file types.
    
    Args:
        file_input: Either a file path (str) or a file object (InMemoryUploadedFile)
    Returns:
        str: Extracted text content
    """
    # Handle both file paths and file objects
    if hasattr(file_input, 'name'):  # File object (InMemoryUploadedFile)
        file_extension = file_input.name.split('.')[-1].lower()
        file_obj = file_input
    else:  # File path (string)
        file_extension = file_input.split('.')[-1].lower()
        file_obj = open(file_input, 'rb')
    
    try:
        if file_extension == 'pdf':
            return extract_text_from_pdf(file_obj)
        elif file_extension == 'docx':
            return extract_text_from_docx(file_obj)
        elif file_extension == 'txt':
            if hasattr(file_input, 'read'):  # File object
                file_obj.seek(0)  # Reset file pointer
                return file_obj.read().decode('utf-8')
            else:  # File path
                return file_obj.read().decode('utf-8')
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    except Exception as e:
        print(f"Error extracting text from file: {e}")
        return ""
    finally:
        # Close file if we opened it
        if not hasattr(file_input, 'name') and hasattr(file_obj, 'close'):
            file_obj.close()

def extract_text_from_pdf(file_obj):
    """
    Extracts text content from a PDF file object.
    Args:
        file_obj: A file-like object (e.g., opened PDF file).
    Returns:
        str: Extracted text, or None if an error occurs.
    """
    text = ""
    try:
        reader = PdfReader(file_obj)
        for page in reader.pages:
            # Extract text from each page, handle potential None return for empty pages
            text += page.extract_text() or ""
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return None
    return text

def extract_text_from_docx(file_obj):
    """
    Extracts text content from a DOCX file object.
    Args:
        file_obj: A file-like object (e.g., opened DOCX file).
    Returns:
        str: Extracted text, or None if an error occurs.
    """
    text = ""
    try:
        document = Document(file_obj)
        for paragraph in document.paragraphs:
            text += paragraph.text + "\n" # Add newline for paragraph separation
    except Exception as e:
        print(f"Error reading DOCX file: {e}")
        return None
    return text

def preprocess_text(text):
    """
    Cleans and normalizes text by lowercasing, removing most punctuation,
    tokenizing, removing common stop words (except crucial ones), and lemmatizing.
    This version aims to preserve important technical terms and numbers.
    Args:
        text (str): The raw text to preprocess.
    Returns:
        str: The preprocessed text, ready for vectorization.
    """
    if not isinstance(text, str):
        return "" # Return empty string for non-string inputs

    text = text.lower() # Convert to lowercase
    # Keep alphanumeric characters, spaces, and hyphens (for terms like "full-stack")
    # Removed dots and other punctuation that might break up technical terms.
    # We want to keep the raw words as much as possible for N-grams.
    text = re.sub(r'[^a-z0-9\s\-\.]', '', text) # Allow hyphens and dots for version numbers

    tokens = text.split() # Tokenize into words

    # Filter tokens: remove stopwords, but keep words in words_to_keep_always
    # Then lemmatize the remaining tokens
    filtered_and_lemmatized_tokens = [
        lemmatizer.lemmatize(word) for word in tokens
        if word not in custom_stop_words # Now custom_stop_words already has important words removed
    ]
    
    # Ensure we don't try to join an empty list of tokens
    if not filtered_and_lemmatized_tokens:
        return "" # Return empty string if no valid tokens remain

    return " ".join(filtered_and_lemmatized_tokens) # Join tokens back into a single string

def calculate_similarity(text1, text2):
    """
    Calculates the cosine similarity between two preprocessed text strings
    using TF-IDF vectorization with N-grams.
    Args:
        text1 (str): The first preprocessed text.
        text2 (str): The second preprocessed text.
    Returns:
        float: The cosine similarity score (between 0.0 and 1.0). Returns 0.0
               if either text is empty.
    """
    if not text1 or not text2:
        return 0.0 # Cannot calculate similarity with empty text

    documents = [text1, text2]
    # Initialize TF-IDF vectorizer with more lenient parameters for resume matching.
    # ngram_range=(1, 2): Focus on unigrams and bigrams for better phrase matching.
    # min_df=1: Consider all terms (important for small corpora).
    # max_df=1.0: Don't filter out any terms based on frequency.
    # norm='l2': Use L2 normalization for better cosine similarity.
    tfidf_vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=1.0, norm='l2')
    # Fit and transform the documents into TF-IDF matrix
    tfidf_matrix = tfidf_vectorizer.fit_transform(documents)

    # Calculate cosine similarity. `cosine_similarity` returns a matrix,
    # we need the element at [0][1] for the similarity between the two documents.
    cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    return cosine_sim

# --- Optional: Semantic Similarity using SpaCy (requires a larger model for best results) ---
# This function is available, but you'll need to uncomment it in views.py
# and potentially download a larger SpaCy model (e.g., en_core_web_md) for best results.
def calculate_semantic_similarity_spacy(text1, text2):
    """
    Calculates semantic similarity between two texts using SpaCy's word vectors.
    This method captures more nuanced relationships than TF-IDF, but depends
    heavily on the quality of the SpaCy model's word vectors.
    Args:
        text1 (str): The first text string.
        text2 (str): The second text string.
    Returns:
        float: The semantic similarity score (between 0.0 and 1.0). Returns 0.0
               if either text is empty or SpaCy cannot generate vectors.
    """
    if not text1 or not text2:
        return 0.0

    # Process texts with SpaCy to get Doc objects
    doc1 = nlp(text1)
    doc2 = nlp(text2)

    # Calculate similarity between Doc objects. SpaCy's .similarity() method
    # uses the average of word vectors if no specific document vector is available.
    if doc1.has_vector and doc2.has_vector:
        similarity = doc1.similarity(doc2)
        return similarity
    else:
        print("Warning: One or both documents do not have vectors. SpaCy similarity might be 0.")
        return 0.0

# --- ATS-like Scoring System ---
def calculate_ats_similarity(jd_text, resume_text):
    """
    ATS-like scoring system that combines multiple factors:
    1. Keyword/Skill matching (weighted)
    2. Experience level matching
    3. Technical term overlap
    4. Semantic similarity
    5. Required vs preferred skills
    
    Args:
        jd_text (str): Preprocessed job description text
        resume_text (str): Preprocessed resume text
    Returns:
        float: ATS-like score between 0.0 and 1.0
    """
    if not jd_text or not resume_text:
        return 0.0
    
    # Debug: Print input texts (first 200 chars)
    print(f"DEBUG - JD Text (first 200 chars): {jd_text[:200]}")
    print(f"DEBUG - Resume Text (first 200 chars): {resume_text[:200]}")
    print(f"DEBUG - JD Text Length: {len(jd_text)}")
    print(f"DEBUG - Resume Text Length: {len(resume_text)}")
    
    # Debug: Show sample words from each text
    jd_sample = list(jd_words)[:20]
    resume_sample = list(resume_words)[:20]
    print(f"DEBUG - JD Sample Words: {jd_sample}")
    print(f"DEBUG - Resume Sample Words: {resume_sample}")
    
    # Convert to sets for easier comparison
    jd_words = set(jd_text.lower().split())
    resume_words = set(resume_text.lower().split())
    
    # Debug: Print word counts and some common words
    print(f"DEBUG - JD Words: {len(jd_words)}")
    print(f"DEBUG - Resume Words: {len(resume_words)}")
    print(f"DEBUG - Common Words (first 10): {list(jd_words.intersection(resume_words))[:10]}")
    
    # Debug: Print key technical words for inspection
    technical_jd_words = [w for w in jd_words if w in ['python', 'django', 'fastapi', 'microservices', 'aws', 'docker', 'kubernetes', 'postgresql', 'rest', 'api']]
    technical_resume_words = [w for w in resume_words if w in ['python', 'django', 'fastapi', 'microservices', 'aws', 'docker', 'kubernetes', 'postgresql', 'rest', 'api']]
    print(f"DEBUG - Key Technical JD Words: {technical_jd_words}")
    print(f"DEBUG - Key Technical Resume Words: {technical_resume_words}")
    
    # Debug: Check for specific skill matches
    python_match = 'python' in jd_words and 'python' in resume_words
    django_match = 'django' in jd_words and 'django' in resume_words
    microservices_match = 'microservices' in jd_words and 'microservices' in resume_words
    aws_match = 'aws' in jd_words and 'aws' in resume_words
    docker_match = 'docker' in jd_words and 'docker' in resume_words
    
    print(f"DEBUG - Specific Skill Matches:")
    print(f"  Python: {python_match}")
    print(f"  Django: {django_match}")
    print(f"  Microservices: {microservices_match}")
    print(f"  AWS: {aws_match}")
    print(f"  Docker: {docker_match}")
    
    # 1. Keyword/Skill Matching (40% weight)
    common_skills = jd_words.intersection(resume_words)
    skill_match_score = len(common_skills) / len(jd_words) if jd_words else 0.0
    
    # Debug: Print skill matching details
    print(f"DEBUG - Skill Match Details:")
    print(f"  Common Skills: {list(common_skills)}")
    print(f"  JD Total Words: {len(jd_words)}")
    print(f"  Common Skills Count: {len(common_skills)}")
    print(f"  Skill Match Score: {skill_match_score:.3f}")
    
    # 2. Experience Level Matching (20% weight) - Enhanced with seniority levels
    experience_score = 0.0
    jd_years = extract_years_of_experience(jd_text)
    resume_years = extract_years_of_experience(resume_text)
    
    if jd_years and resume_years:
        if resume_years >= jd_years:
            experience_score = 1.0  # Meets or exceeds requirement
        elif resume_years >= jd_years * 0.8:  # Within 20% of requirement
            experience_score = 0.9
        elif resume_years >= jd_years * 0.6:  # Within 40% of requirement
            experience_score = 0.7
        else:
            experience_score = resume_years / jd_years  # Partial match
    
    # Seniority level matching (bonus points)
    seniority_bonus = 0.0
    senior_terms = {'senior', 'lead', 'principal', 'architect', 'manager', 'director', 'head of'}
    jd_senior = any(term in jd_text.lower() for term in senior_terms)
    resume_senior = any(term in resume_text.lower() for term in senior_terms)
    
    if jd_senior and resume_senior:
        seniority_bonus = 0.1  # 10% bonus for matching seniority
    elif not jd_senior and not resume_senior:
        seniority_bonus = 0.05  # 5% bonus for matching junior/mid level
    
    experience_score = min(experience_score + seniority_bonus, 1.0)
    
    # 3. Technical Term Overlap (25% weight) - Enhanced with comprehensive tech stack
    technical_terms = {
        # Programming Languages
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'scala', 'kotlin', 'swift',
        
        # Web Frameworks & Libraries
        'django', 'flask', 'fastapi', 'spring', 'spring boot', 'express', 'react', 'vue', 'angular', 'node.js', 'next.js', 'nuxt.js',
        'laravel', 'rails', 'asp.net', 'dotnet', 'jquery', 'bootstrap', 'tailwind', 'material-ui', 'antd',
        
        # Databases & ORMs
        'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'sqlite', 'oracle', 'sql server',
        'sqlalchemy', 'hibernate', 'prisma', 'sequelize', 'mongoose', 'django orm',
        
        # Cloud & DevOps
        'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'bitbucket',
        'terraform', 'ansible', 'chef', 'puppet', 'prometheus', 'grafana', 'elk stack', 'splunk',
        
        # APIs & Protocols
        'rest', 'api', 'graphql', 'soap', 'grpc', 'websocket', 'http', 'https', 'oauth', 'jwt', 'openapi', 'swagger',
        
        # Architecture & Patterns
        'microservices', 'monolith', 'serverless', 'event-driven', 'mvc', 'mvvm', 'clean architecture', 'ddd',
        'soa', 'api gateway', 'load balancer', 'circuit breaker', 'caching', 'cdn',
        
        # Development Practices
        'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd', 'code review', 'pair programming',
        'git', 'gitflow', 'branching', 'merging', 'version control',
        
        # Testing & Quality
        'unit testing', 'integration testing', 'e2e testing', 'selenium', 'cypress', 'jest', 'pytest', 'junit',
        'sonarqube', 'code coverage', 'static analysis', 'linting', 'eslint', 'pylint',
        
        # Security
        'authentication', 'authorization', 'encryption', 'ssl', 'tls', 'oauth2', 'saml', 'ldap', 'rbac',
        'penetration testing', 'vulnerability assessment', 'security audit',
        
        # Data & Analytics
        'data science', 'machine learning', 'ai', 'artificial intelligence', 'deep learning', 'nlp', 'computer vision',
        'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'spark', 'hadoop', 'kafka',
        
        # Mobile & Desktop
        'react native', 'flutter', 'xamarin', 'ionic', 'electron', 'pwa', 'progressive web app',
        
        # Monitoring & Logging
        'logging', 'monitoring', 'alerting', 'metrics', 'apm', 'new relic', 'datadog', 'sentry', 'logstash',
        
        # Infrastructure
        'kubernetes', 'docker swarm', 'mesos', 'nomad', 'istio', 'linkerd', 'helm', 'kustomize',
        'vpc', 'subnet', 'load balancer', 'auto scaling', 'elastic beanstalk', 'ecs', 'eks', 'fargate',
        
        # Business & Domain
        'ecommerce', 'fintech', 'healthcare', 'edtech', 'saas', 'b2b', 'b2c', 'marketplace', 'crm', 'erp',
        'payment processing', 'stripe', 'paypal', 'square', 'blockchain', 'cryptocurrency'
    }
    
    # Enhanced technical scoring with weighted importance
    jd_tech = jd_words.intersection(technical_terms)
    resume_tech = resume_words.intersection(technical_terms)
    tech_overlap = jd_tech.intersection(resume_tech)
    
    # Calculate weighted tech score based on overlap
    if jd_tech:
        tech_score = len(tech_overlap) / len(jd_tech)
        # Bonus for having more matching skills than required
        if len(resume_tech) > len(jd_tech):
            tech_score = min(tech_score * 1.1, 1.0)  # 10% bonus cap
    else:
        tech_score = 0.0
    
    # 4. Semantic Similarity (15% weight)
    semantic_score = calculate_similarity(jd_text, resume_text)
    
    # 5. Education & Certification Matching (10% weight)
    education_score = 0.0
    education_terms = {
        'bachelor', 'master', 'phd', 'degree', 'certification', 'certified', 'aws certified',
        'microsoft certified', 'google certified', 'pmp', 'scrum master', 'agile certified',
        'computer science', 'software engineering', 'information technology', 'data science'
    }
    
    jd_education = jd_words.intersection(education_terms)
    resume_education = resume_words.intersection(education_terms)
    
    if jd_education:
        education_score = len(jd_education.intersection(resume_education)) / len(jd_education)
    
    # Calculate weighted ATS score with refined weights
    ats_score = (
        skill_match_score * 0.35 +      # Reduced from 0.40
        experience_score * 0.25 +       # Increased from 0.20
        tech_score * 0.25 +             # Same weight
        semantic_score * 0.10 +         # Reduced from 0.15
        education_score * 0.05          # New component
    )
    
    # Debug logging (remove in production)
    print(f"DEBUG - ATS Scoring Breakdown:")
    print(f"  Skill Match: {skill_match_score:.3f} (35% weight)")
    print(f"  Experience: {experience_score:.3f} (25% weight)")
    print(f"  Technical: {tech_score:.3f} (25% weight)")
    print(f"  Semantic: {semantic_score:.3f} (10% weight)")
    print(f"  Education: {education_score:.3f} (5% weight)")
    print(f"  Final Score: {ats_score:.3f}")
    
    return min(ats_score, 1.0)  # Cap at 1.0

def calculate_skill_based_similarity(jd_skills, resume_skills):
    """
    Calculate similarity based on extracted skills from both JD and resume.
    
    Args:
        jd_skills (list): List of skills extracted from job description
        resume_skills (list): List of skills extracted from resume
    Returns:
        float: Skill-based similarity score (0-100).
    """
    if not jd_skills or not resume_skills:
        return 0.0
    
    # Convert to sets for easier comparison
    jd_skill_set = set(skill.lower() for skill in jd_skills)
    resume_skill_set = set(skill.lower() for skill in resume_skills)
    
    # Find common skills
    common_skills = jd_skill_set.intersection(resume_skill_set)
    
    # Calculate skill match percentage
    skill_match_percentage = len(common_skills) / len(jd_skill_set) * 100
    
    # Debug output
    print(f"DEBUG - Skill-Based Matching:")
    print(f"  JD Skills: {jd_skills}")
    print(f"  Resume Skills: {resume_skills}")
    print(f"  Common Skills: {list(common_skills)}")
    print(f"  Skill Match Percentage: {skill_match_percentage:.2f}%")
    
    return skill_match_percentage

def calculate_enhanced_ats_similarity(jd_text, resume_data):
    """
    Enhanced ATS-like scoring that uses structured resume data when available.
    
    Args:
        jd_text (str): Preprocessed job description text
        resume_data (dict): Structured resume data from extract_structured_resume_data
    Returns:
        float: Enhanced ATS-like score between 0.0 and 1.0
    """
    # Extract raw text for basic scoring
    resume_text = resume_data.get("raw_text", "")
    
    # Get basic ATS score
    basic_score = calculate_ats_similarity(jd_text, resume_text)
    
    # If we have structured data, enhance the score
    if len(resume_data) > 1:  # More than just raw_text
        enhancement_bonus = 0.0
        
        # Skills enhancement (up to 10% bonus)
        skills = resume_data.get("skills", [])
        if skills:
            jd_words = set(jd_text.lower().split())
            skill_matches = sum(1 for skill in skills if skill.lower() in jd_words)
            if skill_matches > 0:
                enhancement_bonus += min(0.10, skill_matches * 0.02)
        
        # Experience enhancement (up to 5% bonus)
        experience = resume_data.get("experience", [])
        if experience:
            # Check if experience matches job requirements
            jd_lower = jd_text.lower()
            exp_matches = sum(1 for exp in experience if any(word in jd_lower for word in exp.lower().split()))
            if exp_matches > 0:
                enhancement_bonus += min(0.05, exp_matches * 0.01)
        
        # Education enhancement (up to 3% bonus)
        education = resume_data.get("education", [])
        if education:
            jd_lower = jd_text.lower()
            edu_matches = sum(1 for edu in education if any(word in jd_lower for word in edu.lower().split()))
            if edu_matches > 0:
                enhancement_bonus += min(0.03, edu_matches * 0.01)
        
        # Certifications enhancement (up to 2% bonus)
        certifications = resume_data.get("certifications", [])
        if certifications:
            jd_lower = jd_text.lower()
            cert_matches = sum(1 for cert in certifications if any(word in jd_lower for word in cert.lower().split()))
            if cert_matches > 0:
                enhancement_bonus += min(0.02, cert_matches * 0.01)
        
        # Apply enhancement bonus
        enhanced_score = min(1.0, basic_score + enhancement_bonus)
        return enhanced_score
    
    return basic_score

def extract_skills_from_text(text):
    """
    Extract technical skills from text using predefined skill lists.
    
    Args:
        text (str): Text to extract skills from
    Returns:
        list: List of extracted skills
    """
    if not text:
        return []
    
    # Convert to lowercase for matching
    text_lower = text.lower()
    
    # Comprehensive skill lists
    programming_languages = {
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 
        'scala', 'kotlin', 'swift', 'r', 'matlab', 'perl', 'bash', 'shell', 'powershell'
    }
    
    web_frameworks = {
        'django', 'flask', 'fastapi', 'spring', 'spring boot', 'express', 'react', 'vue', 'angular', 
        'node.js', 'next.js', 'nuxt.js', 'laravel', 'rails', 'asp.net', 'dotnet', 'jquery', 
        'bootstrap', 'tailwind', 'material-ui', 'antd', 'svelte', 'ember'
    }
    
    databases = {
        'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 
        'sqlite', 'oracle', 'sql server', 'mariadb', 'neo4j', 'influxdb'
    }
    
    cloud_platforms = {
        'aws', 'azure', 'gcp', 'google cloud', 'digital ocean', 'heroku', 'vercel', 'netlify'
    }
    
    devops_tools = {
        'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'bitbucket', 'terraform', 'ansible', 
        'chef', 'puppet', 'prometheus', 'grafana', 'elk stack', 'splunk', 'jira', 'confluence'
    }
    
    apis_protocols = {
        'rest', 'api', 'graphql', 'soap', 'grpc', 'websocket', 'http', 'https', 'oauth', 'jwt', 
        'openapi', 'swagger', 'postman'
    }
    
    architecture_patterns = {
        'microservices', 'monolith', 'serverless', 'event-driven', 'mvc', 'mvvm', 'clean architecture', 
        'ddd', 'soa', 'api gateway', 'load balancer', 'circuit breaker', 'caching', 'cdn'
    }
    
    development_practices = {
        'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd', 'code review', 'pair programming',
        'git', 'gitflow', 'branching', 'merging', 'version control'
    }
    
    testing_tools = {
        'unit testing', 'integration testing', 'e2e testing', 'selenium', 'cypress', 'jest', 'pytest', 
        'junit', 'sonarqube', 'code coverage', 'static analysis', 'linting', 'eslint', 'pylint'
    }
    
    security = {
        'authentication', 'authorization', 'encryption', 'ssl', 'tls', 'oauth2', 'saml', 'ldap', 'rbac',
        'penetration testing', 'vulnerability assessment', 'security audit'
    }
    
    data_analytics = {
        'data science', 'machine learning', 'ai', 'artificial intelligence', 'deep learning', 'nlp', 
        'computer vision', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 
        'spark', 'hadoop', 'kafka', 'tableau', 'power bi'
    }
    
    mobile_desktop = {
        'react native', 'flutter', 'xamarin', 'ionic', 'electron', 'pwa', 'progressive web app'
    }
    
    monitoring_logging = {
        'logging', 'monitoring', 'alerting', 'metrics', 'apm', 'new relic', 'datadog', 'sentry', 'logstash'
    }
    
    # Combine all skill sets
    all_skills = (
        programming_languages | web_frameworks | databases | cloud_platforms | devops_tools |
        apis_protocols | architecture_patterns | development_practices | testing_tools |
        security | data_analytics | mobile_desktop | monitoring_logging
    )
    
    # Extract skills from text
    extracted_skills = []
    for skill in all_skills:
        if skill in text_lower:
            extracted_skills.append(skill.title())  # Capitalize for display
    
    return list(set(extracted_skills))  # Remove duplicates

def extract_years_of_experience(text):
    """
    Extract years of experience from text using regex patterns.
    Returns the highest number found or None.
    """
    import re
    
    # Patterns to match years of experience
    patterns = [
        r'(\d+)\+?\s*years?\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*in',
        r'(\d+)\+?\s*years?\s*working',
        r'minimum\s*(\d+)\+?\s*years?',
        r'at\s*least\s*(\d+)\+?\s*years?'
    ]
    
    max_years = 0
    for pattern in patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            try:
                years = int(match)
                max_years = max(max_years, years)
            except ValueError:
                continue
    
    return max_years if max_years > 0 else None