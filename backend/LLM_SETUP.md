# LLM Question Generation Setup Guide

This guide will help you set up the LLM-powered question generation feature using **o1-mini** model with extensible architecture for future models.

## 🎯 Why o1-mini?

- **💰 Cost-Effective**: Much cheaper than GPT-4 for question generation
- **🚀 Fast**: Quicker responses for development and testing
- **🎯 Good Quality**: Sufficient quality for interview questions
- **📊 Reliable**: Stable API for production use
- **🔄 Extensible**: Easy to add other models in the future

## 🏗️ Extensible Architecture

The system is designed to be extensible:
- **Current**: o1-mini only (cost-effective)
- **Future**: Easy to uncomment and add GPT-3.5-turbo, GPT-4, etc.
- **Flexible**: Can switch between models based on needs

### Model Configuration

```python
# In llm_service.py
AVAILABLE_MODELS = [
    "o1-mini",           # ✅ Active (cost-effective)
    # "gpt-3.5-turbo",   # 🔒 Commented (uncomment to enable)
    # "gpt-4",           # 🔒 Commented (uncomment to enable)
    # "gpt-4o-mini"      # 🔒 Commented (uncomment to enable)
]
```

## 📋 Prerequisites

1. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Python Environment**: Ensure you're in the virtual environment
3. **Dependencies**: Install required packages

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Activate virtual environment
source venv/bin/activate

# Install required packages
pip install openai tiktoken python-dotenv
```

### 2. Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 3. Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Populate LLM Prompts

```bash
python manage.py populate_llm_prompts
```

This creates 10 prompt templates for different question types and difficulty levels.

### 5. Test o1-mini Model

```bash
python manage.py test_llm_models
```

This will test if your o1-mini model is accessible and working.

## 🧪 Testing the System

### Demo Mode (No API Calls)

Test the system without making API calls:

```bash
python manage.py demo_llm_questions --skill python --type technical --level medium --count 3
```

### Real LLM Generation

Generate questions using o1-mini (requires API credits):

```bash
python manage.py generate_llm_questions --skill python --type technical --level medium --count 2 --auto-approve
```

## 📊 Available Question Types

- **Technical**: Programming, algorithms, system design
- **Behavioral**: Teamwork, leadership, problem-solving
- **Situational**: Real-world scenarios, decision-making
- **Problem Solving**: Complex challenges, optimization

## 🎯 Difficulty Levels

- **Easy**: Basic concepts, suitable for junior developers
- **Medium**: Practical application, suitable for mid-level developers
- **Hard**: Advanced concepts, suitable for senior developers

## 🔧 Management Commands

### Generate Questions

```bash
# Basic generation
python manage.py generate_llm_questions --skill python --type technical --level medium --count 3

# With auto-approval
python manage.py generate_llm_questions --skill react --type behavioral --level medium --count 2 --auto-approve

# With context
python manage.py generate_llm_questions --skill javascript --type technical --level hard --count 1 --context "Frontend development focus"
```

### Demo Mode

```bash
# Test without API calls
python manage.py demo_llm_questions --skill leadership --type behavioral --level medium --count 2
```

### Test Model

```bash
# Test o1-mini availability
python manage.py test_llm_models
```

## 🌐 API Endpoints

### LLM Prompts

- `GET /api/competency/llm-prompts/` - List all prompt templates
- `POST /api/competency/llm-prompts/{id}/generate_question/` - Generate a question
- `POST /api/competency/llm-prompts/{id}/batch_generate/` - Generate multiple questions

### Question Generations

- `GET /api/competency/llm-generations/` - View generated questions
- `POST /api/competency/llm-generations/{id}/approve/` - Approve a question
- `POST /api/competency/llm-generations/{id}/reject/` - Reject a question

### Question Embeddings

- `POST /api/competency/question-embeddings/semantic_search/` - Search similar questions
- `POST /api/competency/question-embeddings/generate_embeddings/` - Generate embeddings

## 💰 Cost Information

### o1-mini Pricing (Approximate)

- **Input tokens**: ~$0.15 per 1M tokens
- **Output tokens**: ~$0.60 per 1M tokens
- **Typical question generation**: ~$0.001-0.005 per question
- **100 questions**: ~$0.10-0.50

### Cost Comparison

| Model | Input Cost | Output Cost | Quality | Speed | Status |
|-------|------------|-------------|---------|-------|--------|
| o1-mini | $0.15/1M | $0.60/1M | Good | Fast | ✅ Active |
| GPT-3.5-turbo | $0.50/1M | $1.50/1M | Better | Medium | 🔒 Commented |
| GPT-4 | $30/1M | $60/1M | Best | Slow | 🔒 Commented |

## 🔄 Future Model Integration

### To Enable Other Models

1. **Edit llm_service.py**:
   ```python
   AVAILABLE_MODELS = [
       "o1-mini",           # Keep as primary
       "gpt-3.5-turbo",     # Uncomment to enable
       # "gpt-4",           # Uncomment when needed
   ]
   ```

2. **Test the models**:
   ```bash
   python manage.py test_llm_models
   ```

3. **Update prompts** (if needed):
   ```bash
   python manage.py shell -c "from competency_hiring.models import LLMQuestionPrompt; LLMQuestionPrompt.objects.all().update(llm_model='gpt-3.5-turbo')"
   ```

### Model Selection Logic

The system automatically selects the best available model:
1. **o1-mini** (cost-effective, fast)
2. **gpt-3.5-turbo** (better quality, moderate cost)
3. **gpt-4** (highest quality, expensive)

## 🔍 Troubleshooting

### Common Issues

1. **"No module named 'openai'"**
   ```bash
   pip install openai
   ```

2. **"Incorrect API key provided"**
   - Check your API key in the `.env` file
   - Ensure the key starts with `sk-`

3. **"You exceeded your current quota"**
   - Add credits to your OpenAI account
   - Check your usage at [OpenAI Platform](https://platform.openai.com/usage)

4. **"Model not found"**
   - o1-mini should be available to all OpenAI users
   - Check if your account has the necessary permissions

### Testing Commands

```bash
# Test API key and model availability
python manage.py test_llm_models

# Test question generation (demo)
python manage.py demo_llm_questions --skill python --type technical --level medium --count 1

# Test real generation (requires credits)
python manage.py generate_llm_questions --skill python --type technical --level medium --count 1
```

## 📈 Best Practices

1. **Start with Demo Mode**: Test the system without API calls
2. **Use Auto-approval**: Automatically add high-quality questions to the bank
3. **Monitor Costs**: Keep track of your OpenAI usage
4. **Quality Control**: Review generated questions before using them
5. **Batch Generation**: Generate multiple questions at once for efficiency
6. **Model Flexibility**: Use o1-mini for development, upgrade to GPT-4 for production if needed

## 🎉 Success!

Once you've completed the setup, you'll have:

- ✅ LLM-powered question generation using o1-mini
- ✅ Quality assessment and auto-approval system
- ✅ Semantic search for similar questions
- ✅ Cost-effective and reliable question generation
- ✅ Demo mode for testing without API calls
- ✅ Extensible architecture for future model integration

Your system is now ready to generate intelligent interview questions using o1-mini, with the flexibility to add other models in the future! 