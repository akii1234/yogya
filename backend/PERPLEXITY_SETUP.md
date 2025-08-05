# Perplexity API Integration Setup

This guide will help you set up Perplexity API integration for the LLM Question Generator.

## 🚀 Why Perplexity?

- **Cost-effective**: Often cheaper than OpenAI for similar quality
- **High-quality models**: Llama 3.1 models with excellent reasoning capabilities
- **Fast generation**: Optimized for quick responses
- **Pro features**: Access to advanced models with your Pro subscription

## 📋 Prerequisites

1. **Perplexity Pro Account**: You need a Perplexity Pro subscription
2. **API Key**: Get your API key from [Perplexity Platform](https://www.perplexity.ai/settings/api)

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
cd backend
source venv/bin/activate
pip install perplexity
```

### 2. Configure Environment Variables

Add your Perplexity API key to your `.env` file:

```bash
# .env file
PERPLEXITY_API_KEY=your_perplexity_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional, for embeddings
```

### 3. Test the Integration

```bash
python manage.py test_llm_models --provider perplexity
```

### 4. Update LLM Prompts (Optional)

Update existing prompts to use Perplexity models:

```bash
python manage.py populate_llm_prompts
```

## 🤖 Available Perplexity Models

### Recommended Models for Question Generation:

1. **llama-3.1-405b-reasoning** (Best for complex questions)
   - Highest reasoning capabilities
   - Best for technical and behavioral questions
   - Slightly slower but highest quality

2. **llama-3.1-70b-versatile** (Balanced)
   - Good balance of speed and quality
   - Versatile for different question types
   - Recommended for most use cases

3. **llama-3.1-8b-instant** (Fastest)
   - Very fast generation
   - Good for simple questions
   - Cost-effective for high-volume generation

### Specialized Models:

- **codellama-70b-instruct**: Excellent for technical/coding questions
- **mixtral-8x7b-instruct**: Good for general questions
- **pplx-7b-chat/pplx-70b-chat**: Alternative chat models

## 💰 Cost Comparison

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| llama-3.1-8b-instant | $0.20 | $0.20 |
| llama-3.1-70b-versatile | $0.70 | $0.70 |
| llama-3.1-405b-reasoning | $2.00 | $2.00 |
| gpt-4o-mini | $0.15 | $0.60 |
| gpt-3.5-turbo | $0.50 | $1.50 |

## 🔄 Fallback Strategy

The system is designed with a smart fallback strategy:

1. **Primary**: Perplexity models (cost-effective)
2. **Secondary**: OpenAI models (if Perplexity fails)
3. **Embeddings**: OpenAI (Perplexity doesn't have embedding models)

## 🧪 Testing Your Setup

### Test Model Availability

```bash
python manage.py test_llm_models --provider perplexity
```

### Test Question Generation

```bash
python manage.py generate_llm_questions --skill python --level medium --count 1
```

### Test Batch Generation

```bash
python manage.py demo_llm_questions
```

## 🎯 Best Practices

### For Different Question Types:

- **Technical Questions**: Use `llama-3.1-405b-reasoning` or `codellama-70b-instruct`
- **Behavioral Questions**: Use `llama-3.1-70b-versatile`
- **Quick Generation**: Use `llama-3.1-8b-instant`

### For Different Difficulty Levels:

- **Easy**: `llama-3.1-8b-instant` (fast, sufficient quality)
- **Medium**: `llama-3.1-70b-versatile` (balanced)
- **Hard**: `llama-3.1-405b-reasoning` (highest quality)

## 🚨 Troubleshooting

### Common Issues:

1. **"Perplexity client not initialized"**
   - Check your API key in `.env` file
   - Ensure you have a valid Perplexity Pro subscription

2. **"Model not found"**
   - Verify the model name is correct
   - Check if the model is available in your subscription tier

3. **"Rate limit exceeded"**
   - Perplexity has rate limits based on your subscription
   - Consider using a lower-tier model for high-volume generation

### Getting Help:

- [Perplexity API Documentation](https://docs.perplexity.ai/)
- [Perplexity Platform](https://www.perplexity.ai/settings/api)
- Check the Django logs for detailed error messages

## 🎉 Success!

Once setup is complete, you can:

1. **Generate questions** using the LLM Question Generator UI
2. **Use batch generation** for multiple questions
3. **Assess question quality** automatically
4. **Save costs** compared to OpenAI-only solutions

The system will automatically use Perplexity for question generation and OpenAI for embeddings, giving you the best of both worlds! 