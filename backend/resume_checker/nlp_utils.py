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
import os
nltk_data_dir = os.path.expanduser('~/nltk_data')
nltk.data.path.append(nltk_data_dir)
print(f"NLTK data path set to: {nltk_data_dir}")

# --- NLTK Downloads Error Handling ---
# Skip NLTK downloads during startup to avoid blocking
print("NLTK resources will be downloaded on-demand if needed.")



try:
    nlp = spacy.load("en_core_web_md") # Changed from sm to md for better semantic similarity
except OSError:
    print("SpaCy model 'en_core_web_md' not found. Attempting to download...")
    from spacy.cli import download
    download("en_core_web_md") # Changed from sm to md
    nlp = spacy.load("en_core_web_md") # Load after successful download

# --- NLP Global Resources ---
try:
    custom_stop_words = set(stopwords.words('english'))
except LookupError:
    print("NLTK stopwords not available, using basic stop words")
    custom_stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}

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

# Initialize lemmatizer only if wordnet is available
try:
    lemmatizer = WordNetLemmatizer() # Lemmatizer for reducing words to their base form
except LookupError:
    print("WordNet not available, using basic lemmatization")
    lemmatizer = None

# --- Enhanced Resume Parsing with resume-parser library ---
RESUME_PARSER_AVAILABLE = False
try:
    from resume_parser import ResumeParser
    RESUME_PARSER_AVAILABLE = True
except (ImportError, OSError) as e:
    print(f"Warning: resume-parser library not available ({e}). Using basic parsing.")

# --- Import lightweight_parser for enhanced functionality ---
try:
    from .lightweight_parser import LightweightResumeParser
    LIGHTWEIGHT_PARSER_AVAILABLE = True
except ImportError as e:
    print(f"Warning: lightweight_parser not available ({e}). Using basic parsing.")
    LIGHTWEIGHT_PARSER_AVAILABLE = False

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
            # First check if it's actually a text file with PDF extension
            if hasattr(file_input, 'seek'):
                file_input.seek(0)
                header = file_input.read(10)
                file_input.seek(0)
                
                # If it doesn't start with PDF header, try reading as text
                if not header.startswith(b'%PDF'):
                    print("⚠️ File has .pdf extension but is not a valid PDF. Trying to read as text...")
                    try:
                        if hasattr(file_input, 'read'):
                            file_input.seek(0)
                            return file_input.read().decode('utf-8')
                        else:
                            with open(file_input, 'r', encoding='utf-8') as f:
                                return f.read()
                    except UnicodeDecodeError:
                        # Try different encodings
                        encodings = ['latin-1', 'cp1252', 'iso-8859-1']
                        for encoding in encodings:
                            try:
                                if hasattr(file_input, 'read'):
                                    file_input.seek(0)
                                    return file_input.read().decode(encoding)
                                else:
                                    with open(file_input, 'r', encoding=encoding) as f:
                                        return f.read()
                            except UnicodeDecodeError:
                                continue
            
            # If it's a real PDF, use PDF extraction
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
    Extracts text content from a PDF file object with robust error handling.
    Args:
        file_obj: A file-like object (e.g., opened PDF file).
    Returns:
        str: Extracted text, or empty string if an error occurs.
    """
    text = ""
    try:
        # Reset file pointer to beginning
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
        
        # Try PyPDF2 first (more robust for some PDFs)
        try:
            reader = PdfReader(file_obj)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as pdf_error:
            print(f"PyPDF2 failed: {pdf_error}")
            # Fallback to alternative method
            try:
                # Reset file pointer
                file_obj.seek(0)
                
                # Try with different PDF reader settings
                import io
                from PyPDF2 import PdfReader as PyPDF2Reader
                
                # Read file content
                file_content = file_obj.read()
                file_obj.seek(0)
                
                # Create a new file-like object
                pdf_file = io.BytesIO(file_content)
                reader = PyPDF2Reader(pdf_file)
                
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                        
            except Exception as fallback_error:
                print(f"PDF fallback method failed: {fallback_error}")
                return ""
        
        # If still no text, try with pdfplumber as last resort
        if not text.strip():
            try:
                file_obj.seek(0)
                import pdfplumber
                
                with pdfplumber.open(file_obj) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                            
            except Exception as plumber_error:
                print(f"pdfplumber failed: {plumber_error}")
                return ""
        
        return text.strip()
        
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return ""

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
    if lemmatizer:
        filtered_and_lemmatized_tokens = [
            lemmatizer.lemmatize(word) for word in tokens
            if word not in custom_stop_words # Now custom_stop_words already has important words removed
        ]
    else:
        # Fallback to basic filtering without lemmatization
        filtered_and_lemmatized_tokens = [
            word for word in tokens
            if word not in custom_stop_words
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
    print(f"🔧 DEBUG: extract_skills_from_text called with text length: {len(text) if text else 0}")
    
    if not text:
        print("⚠️ DEBUG: Empty text provided, returning empty list")
        return []
    
    # Convert to lowercase for matching
    text_lower = text.lower()
    print(f"📝 DEBUG: Text converted to lowercase, length: {len(text_lower)}")
    
    # Comprehensive skill lists
    programming_languages = {
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go programming', 'go language', 'rust', 'php', 'ruby', 
        'scala', 'kotlin', 'swift', 'r programming', 'r language', 'matlab', 'perl', 'bash', 'shell', 'powershell'
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
    
    print(f"📚 DEBUG: Total skills in dictionary: {len(all_skills)}")
    
    # Extract skills from text
    extracted_skills = []
    matched_skills_debug = []
    
    for skill in all_skills:
        # Use word boundary regex for more precise matching
        # This prevents "r" from matching "python" or "go" from matching "django"
        import re
        regex = re.compile(r'\b' + re.escape(skill) + r'\b', re.IGNORECASE)
        
        if regex.search(text_lower):
            extracted_skills.append(skill.title())  # Capitalize for display
            matched_skills_debug.append(skill)
    
    print(f"🎯 DEBUG: Found {len(extracted_skills)} skills in text")
    print(f"🎯 DEBUG: Matched skills (lowercase): {matched_skills_debug}")
    print(f"🎯 DEBUG: Final extracted skills (title case): {extracted_skills}")
    
    result = list(set(extracted_skills))  # Remove duplicates
    print(f"✅ DEBUG: Returning {len(result)} unique skills: {result}")
    
    return result

def extract_years_of_experience(text):
    """
    Extract years of experience from text using regex patterns.
    Returns the highest number found or None.
    """
    import re
    
    # Patterns to match years of experience (enhanced)
    patterns = [
        r'(\d+)\+?\s*years?\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*in',
        r'(\d+)\+?\s*years?\s*working',
        r'minimum\s*(\d+)\+?\s*years?',
        r'at\s*least\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*of',  # "12+ years of experience"
        r'(\d+)\+?\s*years?\s*expertise',  # "years expertise"
        r'(\d+)\+?\s*years?\s*in\s*the\s*field',  # "years in the field"
        r'(\d+)\+?\s*years?',  # Simple "12+ years" pattern
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


def extract_location_with_spacy(text: str) -> str:
    """
    Extract location using spaCy NER with validation and fallback.
    
    Args:
        text (str): Resume text
    Returns:
        str: Extracted location or empty string if not found
    """
    try:
        # Use spaCy NER to find GPE (Geo-Political Entity) and LOC (Location) entities
        doc = nlp(text)
        location_entities = []
        
        for ent in doc.ents:
            if ent.label_ in ['GPE', 'LOC']:
                # Filter out technology references
                if not is_technology_reference(ent.text):
                    location_entities.append({
                        'text': ent.text,
                        'label': ent.label_,
                        'start': ent.start_char,
                        'end': ent.end_char
                    })
        
        # Return the first valid location found
        if location_entities:
            return location_entities[0]['text']
        
        # Fallback to improved regex patterns if spaCy finds nothing
        return extract_location_with_regex_fallback(text)
        
    except Exception as e:
        print(f"Error in spaCy location extraction: {e}")
        # Fallback to regex
        return extract_location_with_regex_fallback(text)


def is_technology_reference(text: str) -> bool:
    """
    Check if text is likely a technology reference or company name rather than a location.
    
    Args:
        text (str): Text to check
    Returns:
        bool: True if text is likely a technology reference or company name
    """
    # Common technology patterns that might be confused with locations
    tech_patterns = [
        # Programming languages and frameworks
        r'servlet', r'java', r'spring', r'boot', r'aws', r'azure', r'gcp',
        r'kubernetes', r'docker', r'jenkins', r'git', r'github', r'jira',
        r'eclipse', r'intellij', r'vscode', r'postgresql', r'mysql', r'mongodb',
        r'redis', r'elasticsearch', r'kafka', r'rabbitmq', r'nginx', r'apache',
        r'tomcat', r'wildfly', r'jboss', r'weblogic', r'websphere', r'nodejs',
        r'react', r'angular', r'vue', r'jquery', r'bootstrap', r'tailwind',
        r'typescript', r'javascript', r'html', r'css', r'sass', r'less',
        r'python', r'php', r'ruby', r'go', r'rust', r'scala', r'kotlin',
        r'swift', r'objective-c', r'c#', r'c\+\+', r'c\b', r'assembly',
        r'xml', r'fpml', r'json', r'yaml', r'toml', r'ini', r'csv',
        
        # DevOps and cloud tools
        r'terraform', r'ansible', r'puppet', r'chef', r'vagrant', r'virtualbox',
        r'vmware', r'hyper-v', r'xen', r'kvm', r'openstack', r'cloudfoundry',
        r'heroku', r'netlify', r'vercel', r'firebase', r'lambda', r'ec2',
        r's3', r'rds', r'dynamodb', r'cloudfront', r'route53', r'vpc',
        r'iam', r'cloudwatch', r'cloudtrail', r'config', r'guardduty',
        r'waf', r'shield', r'certificate', r'acm', r'elb', r'alb', r'nlb',
        
        # Testing frameworks and tools
        r'fitnesse', r'junit', r'testng', r'mockito', r'powermock', r'cucumber',
        r'selenium', r'cypress', r'playwright', r'puppeteer', r'jest', r'mocha',
        r'chai', r'sinon', r'karma', r'protractor', r'nightwatch', r'webdriverio',
        r'robot', r'behave', r'pytest', r'unittest', r'nose', r'tox',
        r'coverage', r'jacoco', r'sonarqube', r'codecov', r'coveralls',
        
        # Build tools and package managers
        r'maven', r'gradle', r'ant', r'npm', r'yarn', r'pip', r'conda',
        r'composer', r'bundler', r'cargo', r'go\s+mod', r'nuget', r'chocolatey',
        r'homebrew', r'apt', r'yum', r'pacman', r'zypper', r'brew',
        
        # IDEs and editors
        r'vscode', r'visual\s+studio', r'code', r'sublime', r'atom', r'vim',
        r'emacs', r'notepad\+\+', r'brackets', r'webstorm', r'pycharm',
        r'intellij', r'eclipse', r'netbeans', r'android\s+studio', r'xcode',
        
        # Version control and collaboration
        r'git', r'svn', r'mercurial', r'bitbucket', r'gitlab', r'github',
        r'gitlab', r'azure\s+devops', r'jira', r'confluence', r'trello',
        r'asana', r'slack', r'discord', r'teams', r'zoom', r'webex',
        
        # Monitoring and logging
        r'prometheus', r'grafana', r'kibana', r'logstash', r'elasticsearch',
        r'splunk', r'datadog', r'new\s+relic', r'appdynamics', r'dynatrace',
        r'nagios', r'zabbix', r'icinga', r'check\s+mk', r'prtg',
        
        # Databases and data tools
        r'postgresql', r'mysql', r'mariadb', r'oracle', r'sql\s+server',
        r'sqlite', r'mongodb', r'cassandra', r'redis', r'memcached',
        r'elasticsearch', r'solr', r'kafka', r'rabbitmq', r'activemq',
        r'apache\s+kafka', r'apache\s+pulsar', r'apache\s+storm',
        
        # Web servers and application servers
        r'apache', r'nginx', r'lighttpd', r'caddy', r'traefik', r'istio',
        r'tomcat', r'jetty', r'undertow', r'wildfly', r'jboss', r'weblogic',
        r'websphere', r'glassfish', r'geronimo', r'karaf', r'fuse',
        
        # Operating systems and platforms
        r'linux', r'unix', r'windows', r'macos', r'ubuntu', r'centos',
        r'debian', r'fedora', r'redhat', r'suse', r'arch', r'gentoo',
        r'freebsd', r'openbsd', r'netbsd', r'dragonfly', r'minix',
        
        # Mobile and desktop frameworks
        r'react\s+native', r'flutter', r'xamarin', r'ionic', r'cordova',
        r'phonegap', r'electron', r'qt', r'gtk', r'wxwidgets', r'tkinter',
        r'javafx', r'swing', r'awt', r'swt', r'rcp', r'osgi',
        
        # AI and ML frameworks
        r'tensorflow', r'pytorch', r'keras', r'scikit-learn', r'pandas',
        r'numpy', r'matplotlib', r'seaborn', r'plotly', r'bokeh',
        r'spark', r'hadoop', r'hive', r'pig', r'hbase', r'zookeeper',
        
        # Security tools
        r'owasp', r'burp', r'zap', r'nmap', r'wireshark', r'tcpdump',
        r'nessus', r'qualys', r'rapid7', r'tenable', r'crowdstrike',
        r'symantec', r'mcafee', r'trend\s+micro', r'kaspersky', r'bitdefender'
    ]
    
    # Common company names that might be confused with locations
    company_patterns = [
        r'capgemini', r'accenture', r'tcs', r'infosys', r'wipro', r'cognizant',
        r'tech\s+mahindra', r'hcl', r'lti', r'mindtree', r'persistent',
        r'zensar', r'cybage', r'quintiles', r'iqvia', r'cognizant',
        r'ibm', r'microsoft', r'google', r'amazon', r'apple', r'facebook',
        r'meta', r'netflix', r'uber', r'lyft', r'airbnb', r'spotify',
        r'salesforce', r'oracle', r'sap', r'adobe', r'intel', r'amd',
        r'nvidia', r'cisco', r'juniper', r'arista', r'vmware', r'citrix',
        r'red\s+hat', r'canonical', r'suse', r'novell', r'borland',
        r'symantec', r'mcafee', r'trend\s+micro', r'kaspersky', r'bitdefender',
        r'crowdstrike', r'palo\s+alto', r'fortinet', r'check\s+point',
        r'f5', r'riverbed', r'blue\s+coat', r'websense', r'forcepoint',
        r'proofpoint', r'barracuda', r'sophos', r'eset', r'avast',
        r'avira', r'kaspersky', r'bitdefender', r'norton', r'malwarebytes'
    ]
    
    text_lower = text.lower()
    
    # Check for technology patterns
    for pattern in tech_patterns:
        if re.search(pattern, text_lower):
            return True
    
    # Check for company patterns
    for pattern in company_patterns:
        if re.search(pattern, text_lower):
            return True
    
    return False


def extract_location_with_regex_fallback(text: str) -> str:
    """
    Fallback location extraction using improved regex patterns.
    Only used if spaCy NER doesn't find any locations.
    
    Args:
        text (str): Resume text
    Returns:
        str: Extracted location or empty string
    """
    # Improved regex patterns that are more restrictive
    location_patterns = [
        # Explicit location patterns
        r'Location:\s*([A-Z][a-z]+(?:,\s*[A-Z]{2}|,\s*[A-Z][a-z]+))',
        r'Address:\s*([A-Z][a-z]+(?:,\s*[A-Z]{2}|,\s*[A-Z][a-z]+))',
        r'City:\s*([A-Z][a-z]+(?:,\s*[A-Z]{2}|,\s*[A-Z][a-z]+))',
        
        # Common city, state/country patterns (more restrictive)
        r'\b([A-Z][a-z]+),\s*([A-Z]{2})\b',  # City, State (e.g., "New York, NY")
        r'\b([A-Z][a-z]+),\s*([A-Z][a-z]+)\b',  # City, Country (e.g., "London, UK")
        
        # Avoid patterns that might match technologies
        r'\b(?!Servlet|Java|Spring|Boot|AWS|Azure|GCP|Kubernetes|Docker|Jenkins|Git|Jira|Eclipse|IntelliJ|VSCode|PostgreSQL|MySQL|MongoDB|Redis|Elasticsearch|Kafka|RabbitMQ|Nginx|Apache|Tomcat|WildFly|JBoss|WebLogic|WebSphere|NodeJS|React|Angular|Vue|jQuery|Bootstrap|Tailwind|TypeScript|JavaScript|HTML|CSS|Sass|Less|Python|PHP|Ruby|Go|Rust|Scala|Kotlin|Swift|Objective-C|C#|C\+\+|C\b|Assembly|Terraform|Ansible|Puppet|Chef|Vagrant|VirtualBox|VMware|Hyper-V|Xen|KVM|OpenStack|CloudFoundry|Heroku|Netlify|Vercel|Firebase|Lambda|EC2|S3|RDS|DynamoDB|CloudFront|Route53|VPC|IAM|CloudWatch|CloudTrail|Config|GuardDuty|WAF|Shield|Certificate|ACM|ELB|ALB|NLB)([A-Z][a-z]+),\s*([A-Z]{2})\b',
    ]
    
    for pattern in location_patterns:
        match = re.search(pattern, text)
        if match:
            # Extract the location part
            if match.groups():
                location = match.group(1) if match.group(1) else match.group(0)
                # Additional validation to ensure it's not a technology reference
                if not is_technology_reference(location):
                    return location.strip()
    
    return ""


def extract_enhanced_resume_data(file_path):
    """
    Enhanced resume parsing using both lightweight_parser and nlp_utils.
    Combines the speed of lightweight_parser with the quality of nlp_utils skills.
    
    Args:
        file_path (str): Path to the resume file
        
    Returns:
        dict: Enhanced structured resume data with contact, skills, experience, education
    """
    try:
        # Extract text from file
        extracted_text = extract_text_from_file(file_path)
        
        # Use lightweight_parser for structure (contact, experience, education)
        if LIGHTWEIGHT_PARSER_AVAILABLE:
            parser = LightweightResumeParser()
            structured_data = parser.parse_resume(extracted_text)
            
            # Use nlp_utils for high-quality skills
            skills = extract_skills_from_text(extracted_text)
            
            # Return enhanced data
            return {
                'contact': structured_data.get('contact', {}),
                'experience_years': structured_data.get('total_experience_years', 0),
                'skills': skills,  # Use nlp_utils skills (better quality)
                'summary': structured_data.get('summary', ''),
                'experience_entries': structured_data.get('experience', []),
                'education_entries': structured_data.get('education', []),
                'projects': structured_data.get('projects', []),
                'certifications': structured_data.get('certifications', []),
                'languages': structured_data.get('languages', []),
                'raw_text': extracted_text,
                'processing_method': 'hybrid_lightweight_nlp'
            }
        else:
            # Fallback to basic nlp_utils only
            skills = extract_skills_from_text(extracted_text)
            experience_years = extract_years_of_experience(extracted_text)
            
            return {
                'contact': {},
                'experience_years': experience_years,
                'skills': skills,
                'summary': '',
                'experience_entries': [],
                'education_entries': [],
                'projects': [],
                'certifications': [],
                'languages': [],
                'raw_text': extracted_text,
                'processing_method': 'nlp_utils_only'
            }
            
    except Exception as e:
        print(f"Error in enhanced resume parsing: {e}")
        return {
            'error': f'Failed to parse resume: {str(e)}',
            'file_path': file_path,
            'processing_method': 'error'
        }


def parse_resume_hybrid(file_path):
    """
    Convenience function for hybrid resume parsing.
    This is the main function to use for resume parsing.
    
    Args:
        file_path (str): Path to the resume file
        
    Returns:
        dict: Complete resume data with contact, skills, experience, education
    """
    return extract_enhanced_resume_data(file_path)