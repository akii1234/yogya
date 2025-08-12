# Gemini AI Integration for Yogya HR Platform

## 🚀 Overview

The Yogya HR Platform now supports **Google Gemini AI** as the primary AI provider. OpenAI integration has been temporarily disabled to focus on Gemini's cost-effective AI capabilities for question generation, quality assessment, and other LLM-powered features.

## ⚠️ Current Status

- **✅ Gemini AI**: Fully integrated and active
- **❌ OpenAI**: Temporarily disabled (code commented out for easy re-enabling)

## ✨ Features

- **Gemini-First Design**: Optimized for Gemini AI performance
- **Cost Optimization**: Gemini offers excellent cost-effectiveness
- **Model Selection**: Support for multiple Gemini models
- **Easy Re-enabling**: OpenAI code preserved and commented for future use

## 🛠️ Installation

### 1. Install Gemini Dependencies

```bash
cd backend
pip install -r requirements_gemini.txt
```

Or install manually:
```bash
pip install google-generativeai>=0.3.0
```

### 2. Set Up API Key

Add your Gemini API key to your environment variables:

```bash
# In your .env file or environment
export GEMINI_API_KEY="your_gemini_api_key_here"
```

Or set it in your Django settings:
```python
GEMINI_API_KEY = "your_gemini_api_key_here"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Gemini API key | **Yes** |
| `OPENAI_API_KEY` | Your OpenAI API key | No (currently disabled) |

### Provider Selection

The LLM service currently supports Gemini only:

```python
# Gemini only (default)
llm_service = LLMQuestionService()

# Explicitly specify Gemini
llm_service = LLMQuestionService(preferred_provider='gemini')

# Note: OpenAI provider is currently disabled
# llm_service = LLMQuestionService(preferred_provider='openai')  # Will fail
```

## 📋 Available Models

### Gemini Models
- `gemini-1.5-flash` (Recommended - Fast and cost-effective)
- `gemini-1.5-pro` (High performance)
- `gemini-pro` (Standard model)

### OpenAI Models (Currently Disabled)
- ~~`gpt-4`~~
- ~~`gpt-3.5-turbo`~~
- ~~`gpt-4o-mini`~~
- ~~`o1-mini`~~

## 💻 Usage Examples

### Basic Usage

```python
from competency_hiring.llm_service import LLMQuestionService

# Initialize with Gemini (default)
llm_service = LLMQuestionService()

# Generate a question
result = llm_service.generate_question(
    prompt_template="Create a {level} level {skill} question.",
    skill="Python",
    level="intermediate",
    question_type="technical",
    context="Web development"
)

if result['success']:
    print(f"Question: {result['question']['text']}")
    print(f"Provider: {result['question']['provider']}")
    print(f"Model: {result['question']['model_used']}")
```

### Quality Assessment

```python
# Assess question quality
assessment = llm_service.assess_question_quality(
    question_text="What is the difference between a list and a tuple in Python?",
    skill="Python",
    level="beginner"
)

if assessment['success']:
    print(f"Quality scores: {assessment['assessment']}")
    print(f"Provider: {assessment['provider']}")
```

### Model Testing

```python
# Test model availability
result = llm_service.test_model_availability('gemini-1.5-flash', 'gemini')
if result['available']:
    print("Gemini model is available!")
else:
    print(f"Model not available: {result['error']}")
```

## 🧪 Testing

### Run Structure Tests

```bash
cd backend
python test_gemini_structure.py
```

### Run Integration Tests

```bash
cd backend
python test_gemini_integration.py
```

### Run Example Script

```bash
cd backend
python gemini_example.py
```

## 🔄 Re-enabling OpenAI

If you need to re-enable OpenAI integration:

### 1. Uncomment OpenAI Code

In `competency_hiring/llm_service.py`, uncomment the following sections:
- OpenAI import
- `OPENAI_MODELS` list
- OpenAI client initialization in `__init__`
- OpenAI provider selection logic
- `_generate_with_openai` method
- `_assess_with_openai` method
- OpenAI embeddings in `generate_embeddings`

### 2. Set OpenAI API Key

```bash
export OPENAI_API_KEY="your_openai_api_key_here"
```

### 3. Update Provider Selection

```python
# Change default back to 'auto' or 'openai'
llm_service = LLMQuestionService(preferred_provider='auto')
```

## 📊 Cost Comparison

| Feature | OpenAI (GPT-3.5) | OpenAI (GPT-4) | Gemini 1.5 Flash | Gemini 1.5 Pro |
|---------|------------------|----------------|------------------|----------------|
| Input (1K tokens) | $0.0015 | $0.03 | $0.000075 | $0.00375 |
| Output (1K tokens) | $0.002 | $0.06 | $0.0003 | $0.015 |
| **Cost Efficiency** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

*Note: Prices may vary. Check current pricing on respective platforms.*

## 🚨 Limitations

### Current Limitations
- **No OpenAI Fallback**: OpenAI integration is disabled
- **No Embeddings**: Gemini doesn't support embeddings (OpenAI was used for this)
- **Single Provider**: Only Gemini is available

### When OpenAI is Re-enabled
- **Embeddings**: Will use OpenAI for embeddings
- **Fallback**: Will have OpenAI as fallback option
- **Provider Choice**: Will support both providers

## 🔧 Troubleshooting

### Common Issues

1. **"Gemini library not available"**
   ```bash
   pip install google-generativeai
   ```

2. **"Gemini API key not found"**
   ```bash
   export GEMINI_API_KEY="your_key_here"
   ```

3. **"No AI provider available"**
   - Set `GEMINI_API_KEY` environment variable
   - Or re-enable OpenAI integration if needed

4. **"Embeddings not available"**
   - Gemini doesn't support embeddings
   - Re-enable OpenAI integration for embeddings functionality

### Debug Mode

Enable debug logging to see detailed information:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

llm_service = LLMQuestionService()
```

## 📈 Performance Tips

1. **Use Gemini 1.5 Flash** for most use cases (fastest and most cost-effective)
2. **Use Gemini 1.5 Pro** for complex reasoning tasks
3. **Monitor token usage** for cost optimization
4. **Set GEMINI_API_KEY** for immediate functionality

## 🔮 Future Enhancements

- [ ] Re-enable OpenAI integration when needed
- [ ] Support for Gemini Advanced models
- [ ] Batch processing capabilities
- [ ] Streaming responses
- [ ] Custom model fine-tuning
- [ ] Advanced prompt engineering tools

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Run the test scripts to verify your setup
3. Review the example scripts for usage patterns
4. Check the logs for detailed error information
5. Consider re-enabling OpenAI if Gemini doesn't meet your needs

---

**🎉 Happy coding with Gemini AI!** 