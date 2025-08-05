from django.core.management.base import BaseCommand
from competency_hiring.models import LLMQuestionPrompt
import uuid

class Command(BaseCommand):
    help = 'Populate LLM question generation prompts'

    def handle(self, *args, **options):
        prompts_data = [
            # Technical Questions - Python
            {
                "name": "Python Technical Easy",
                "description": "Generate easy-level Python technical questions",
                "prompt_template": """Generate an easy-level technical question about {skill} for a {level} developer.

Focus on:
- Basic concepts and fundamentals
- Simple practical scenarios
- Clear, straightforward answers

The question should be accessible to someone with basic knowledge of {skill}.

Context: {context}""",
                "question_type": "technical",
                "difficulty": "easy",
                "target_skills": ["python", "programming", "coding"],
                "llm_model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 500
            },
            
            {
                "name": "Python Technical Medium",
                "description": "Generate medium-level Python technical questions",
                "prompt_template": """Generate a medium-level technical question about {skill} for a {level} developer.

Focus on:
- Practical application of concepts
- Real-world scenarios
- Problem-solving approaches
- Best practices

The question should test understanding beyond basics but not require expert-level knowledge.

Context: {context}""",
                "question_type": "technical",
                "difficulty": "medium",
                "target_skills": ["python", "programming", "coding"],
                "llm_model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 500
            },
            
            {
                "name": "Python Technical Hard",
                "description": "Generate hard-level Python technical questions",
                "prompt_template": """Generate a hard-level technical question about {skill} for a {level} developer.

Focus on:
- Advanced concepts and deep understanding
- Complex problem-solving scenarios
- System design considerations
- Performance optimization
- Edge cases and trade-offs

The question should challenge even experienced developers.

Context: {context}""",
                "question_type": "technical",
                "difficulty": "hard",
                "target_skills": ["python", "programming", "coding"],
                "llm_model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 500
            },
            
            # Frontend Questions
            {
                "name": "React Technical Medium",
                "description": "Generate medium-level React technical questions",
                "prompt_template": """Generate a medium-level technical question about {skill} for a {level} developer.

Focus on:
- Practical application of React concepts
- Real-world scenarios
- Problem-solving approaches
- Best practices and patterns

The question should test understanding beyond basics but not require expert-level knowledge.

Context: {context}""",
                "question_type": "technical",
                "difficulty": "medium",
                "target_skills": ["react", "javascript", "frontend"],
                "llm_model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 500
            },
            
            # Behavioral Questions
            {
                "name": "Leadership Behavioral Medium",
                "description": "Generate medium-level leadership behavioral questions",
                "prompt_template": """Generate a medium-level behavioral question about {skill} for a {level} professional.

Focus on:
- Leadership and collaboration
- Complex problem-solving
- Conflict resolution
- Project management
- Stakeholder interaction

The question should test experience and maturity in professional situations.

Context: {context}""",
                "question_type": "behavioral",
                "difficulty": "medium",
                "target_skills": ["leadership", "management", "teamwork"],
                "llm_model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 500
            },
            
            {
                "name": "Communication Behavioral Easy",
                "description": "Generate easy-level communication behavioral questions",
                "prompt_template": """Generate an easy-level behavioral question about {skill} for a {level} professional.

Focus on:
- Basic teamwork and communication
- Simple problem-solving scenarios
- Learning and growth experiences
- Clear, straightforward situations

The question should be accessible and relatable to most professionals.

Context: {context}""",
                "question_type": "behavioral",
                "difficulty": "easy",
                "target_skills": ["communication", "teamwork", "collaboration"],
                "llm_model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 500
            },
            
            # Problem Solving Questions
            {
                "name": "Problem Solving Technical Hard",
                "description": "Generate hard-level problem-solving questions",
                "prompt_template": """Generate a hard-level problem-solving question about {skill} for a {level} developer.

Focus on:
- Complex algorithmic thinking
- System design challenges
- Performance optimization
- Scalability considerations
- Trade-off analysis

The question should challenge even experienced developers.

Context: {context}""",
                "question_type": "problem_solving",
                "difficulty": "hard",
                "target_skills": ["algorithms", "system-design", "optimization"],
                "llm_model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 500
            },
            
            # DevOps Questions
            {
                "name": "DevOps Technical Medium",
                "description": "Generate medium-level DevOps questions",
                "prompt_template": """Generate a medium-level technical question about {skill} for a {level} developer.

Focus on:
- Practical DevOps practices
- CI/CD implementation
- Infrastructure management
- Monitoring and logging
- Security considerations

The question should test understanding beyond basics but not require expert-level knowledge.

Context: {context}""",
                "question_type": "technical",
                "difficulty": "medium",
                "target_skills": ["devops", "ci-cd", "infrastructure"],
                "llm_model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 500
            },
            
            # Data Science Questions
            {
                "name": "Data Science Technical Medium",
                "description": "Generate medium-level data science questions",
                "prompt_template": """Generate a medium-level technical question about {skill} for a {level} data scientist.

Focus on:
- Practical data analysis
- Machine learning applications
- Statistical concepts
- Data preprocessing
- Model evaluation

The question should test understanding beyond basics but not require expert-level knowledge.

Context: {context}""",
                "question_type": "technical",
                "difficulty": "medium",
                "target_skills": ["data-science", "machine-learning", "statistics"],
                "llm_model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 500
            },
            
            # Situational Questions
            {
                "name": "Project Management Situational Medium",
                "description": "Generate medium-level project management situational questions",
                "prompt_template": """Generate a medium-level situational question about {skill} for a {level} professional.

Focus on:
- Realistic workplace scenarios
- Project management challenges
- Stakeholder management
- Risk assessment
- Decision-making processes

The question should present a realistic scenario that tests problem-solving and decision-making abilities.

Context: {context}""",
                "question_type": "situational",
                "difficulty": "medium",
                "target_skills": ["project-management", "stakeholder-management", "risk-management"],
                "llm_model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 500
            }
        ]

        self.stdout.write("Creating LLM question generation prompts...")
        created_count = 0
        
        for data in prompts_data:
            data['id'] = uuid.uuid4()
            
            # Check if prompt already exists
            if not LLMQuestionPrompt.objects.filter(name=data['name']).exists():
                LLMQuestionPrompt.objects.create(**data)
                created_count += 1
                self.stdout.write(f"✅ Created: {data['name']}")
            else:
                self.stdout.write(f"⏭️  Skipped (exists): {data['name']}")
        
        self.stdout.write(self.style.SUCCESS(f"Successfully populated LLM prompts! Created: {created_count}"))
        self.stdout.write(f"📊 Total prompts: {LLMQuestionPrompt.objects.count()}")
        self.stdout.write(f"📊 Question types: {LLMQuestionPrompt.objects.values('question_type').distinct().count()}")
        self.stdout.write(f"📊 Difficulty levels: {LLMQuestionPrompt.objects.values('difficulty').distinct().count()}") 