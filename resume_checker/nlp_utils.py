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


# --- SpaCy Model Loading ---
# Load the small English SpaCy model. If not found, it attempts to download it.
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("SpaCy model 'en_core_web_sm' not found. Attempting to download...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm") # Load after successful download

# --- NLP Global Resources ---
# Define stop words, potentially excluding some that are important for context (e.g., 'years')
custom_stop_words = set(stopwords.words('english'))
# Example: If 'years' or 'experience' is critical for your matching, you might remove them from stopwords
# custom_stop_words.discard('years')
# custom_stop_words.discard('experience')
lemmatizer = WordNetLemmatizer() # Lemmatizer for reducing words to their base form

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
    Cleans and normalizes text by lowercasing, removing punctuation,
    tokenizing, removing common stop words, and lemmatizing.
    This version aims to preserve numbers and context better for specific terms.
    Args:
        text (str): The raw text to preprocess.
    Returns:
        str: The preprocessed text, ready for vectorization.
    """
    if not isinstance(text, str):
        return "" # Return empty string for non-string inputs

    text = text.lower() # Convert to lowercase
    # Keep alphanumeric characters and spaces. This will keep numbers and text.
    text = re.sub(r'[^a-z0-9\s]', '', text)
    tokens = text.split() # Tokenize into words

    # Define words we specifically want to KEEP, even if they are common stop words.
    # This is crucial for phrases like "years experience" or specific numerical requirements.
    # Added 'docker' and 'devops' to ensure they are always kept if they are ever mistakenly stopwords.
    # Though, 'docker' and 'devops' are generally not stopwords.
    words_to_keep = {'years', 'year', 'experience', 'minimum', 'plus', 'docker', 'devops'}

    # Remove stopwords, but preserve words in our 'words_to_keep' set
    filtered_tokens = [
        lemmatizer.lemmatize(word) for word in tokens
        if word not in custom_stop_words or word in words_to_keep # Only remove if not in custom_stop_words AND not in words_to_keep
    ]
    
    return " ".join(filtered_tokens) # Join tokens back into a single string

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
    # Initialize TF-IDF vectorizer.
    # Now includes ngram_range=(1, 2) to capture single words (unigrams) and two-word phrases (bigrams).
    tfidf_vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    # Fit and transform the documents into TF-IDF matrix
    tfidf_matrix = tfidf_vectorizer.fit_transform(documents)

    # Calculate cosine similarity. `cosine_similarity` returns a matrix,
    # we need the element at [0][1] for the similarity between the two documents.
    cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    return cosine_sim

# --- Optional: Semantic Similarity using SpaCy (requires a larger model for best results) ---
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
    # For optimal results with this, consider using a larger SpaCy model (e.g., 'en_core_web_md').
    similarity = doc1.similarity(doc2)
    return similarity
