# 🤖 LLM Question Generation Setup Guide

## 📋 Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key to use the LLM features
2. **Python Virtual Environment**: Make sure you're in the activated virtual environment

## 🚀 Installation Steps

### 1. Install Dependencies
```bash
# Make sure you're in the backend directory with venv activated
cd /Users/akhiltripathi/dev/yogya/backend
source venv/bin/activate

# Install the new dependencies
pip install openai tiktoken python-dotenv
```

### 2. Set Up Environment Variables
Create or update your `.env` file in the backend directory:

```bash
# Create .env file if it doesn't exist
touch .env
```

Add your OpenAI API key to the `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Update Django Settings
Make sure your `settings.py` includes the environment variable loading:

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Add this to your settings
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
```

### 4. Run Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Populate LLM Prompts
```bash
python manage.py populate_llm_prompts
```

## 🧪 Testing the LLM Features

### Test Question Generation
```bash
# Generate 3 Python technical questions (medium difficulty)
python manage.py generate_llm_questions --skill python --type technical --level medium --count 3 --auto-approve

# Generate 2 behavioral questions about leadership
python manage.py generate_llm_questions --skill leadership --type behavioral --level medium --count 2 --auto-approve
```

### Test API Endpoints
Once the server is running, you can test:

1. **List LLM Prompts**: `GET /api/competency/llm-prompts/`
2. **Generate Question**: `POST /api/competency/llm-prompts/{id}/generate_question/`
3. **Semantic Search**: `POST /api/competency/question-embeddings/semantic_search/`

## 🔧 Configuration Options

### LLM Models
- **Default**: `gpt-4` for question generation
- **Embeddings**: `text-embedding-ada-002` for semantic search
- **Cost**: Approximately $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens

### Quality Thresholds
- **Auto-approval**: Questions with quality score ≥ 7 are automatically added to question bank
- **Manual review**: Questions with quality score < 7 require human review

## 📊 Usage Examples

### Generate Questions for Specific Skills
```bash
# Frontend Development
python manage.py generate_llm_questions --skill react --type technical --level medium --count 5

# DevOps
python manage.py generate_llm_questions --skill docker --type technical --level hard --count 3

# Soft Skills
python manage.py generate_llm_questions --skill communication --type behavioral --level easy --count 4
```

### Batch Generation
```bash
# Generate questions for multiple skills
python manage.py generate_llm_questions --skill python --type technical --level medium --count 10 --auto-approve
```

## 🛠️ Troubleshooting

### Common Issues

1. **"No module named openai"**
   ```bash
   pip install openai
   ```

2. **"OPENAI_API_KEY not found"**
   - Check your `.env` file exists
   - Verify the API key is correct
   - Restart your Django server

3. **"Rate limit exceeded"**
   - Wait a few minutes before retrying
   - Consider upgrading your OpenAI plan

4. **"Invalid API key"**
   - Verify your API key is correct
   - Check if your OpenAI account has credits

### Cost Management
- Monitor your OpenAI usage in the OpenAI dashboard
- Set up billing alerts
- Use the `--count` parameter to limit generation

## 🎯 Next Steps

1. **Test the basic functionality** with a few questions
2. **Review generated questions** for quality
3. **Customize prompts** for your specific needs
4. **Integrate with the frontend** for HR user interface
5. **Set up monitoring** for usage and costs

## 📈 Advanced Features

### Custom Prompt Templates
You can create custom prompts through the Django admin or API:

```python
# Example custom prompt
prompt = LLMQuestionPrompt.objects.create(
    name="Custom Python Debugging",
    description="Generate questions about Python debugging",
    prompt_template="Generate a {level} question about debugging {skill} code...",
    question_type="technical",
    difficulty="medium",
    target_skills=["python", "debugging"]
)
```

### Semantic Search
Use embeddings to find similar questions:

```python
# Search for similar questions
from competency_hiring.llm_service import LLMQuestionService

llm_service = LLMQuestionService()
similar_questions = llm_service.semantic_search(
    "How to optimize React performance?",
    question_embeddings,
    top_k=5
)
```

## 🔐 Security Notes

- Never commit your API key to version control
- Use environment variables for sensitive data
- Monitor API usage and costs
- Consider rate limiting for production use 