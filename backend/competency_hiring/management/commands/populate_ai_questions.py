from django.core.management.base import BaseCommand
from competency_hiring.models import QuestionBank
import uuid

class Command(BaseCommand):
    help = 'Populate question bank with diverse questions for AI recommendations'

    def handle(self, *args, **options):
        questions_data = [
            # Technical Questions - Python/Django
            {
                "question_text": "Explain the difference between Django's ORM and raw SQL. When would you use each?",
                "question_type": "technical",
                "tags": ["python", "django", "orm", "sql", "database", "mid-level"],
                "difficulty": "medium",
                "evaluation_criteria": [
                    "Understanding of ORM vs SQL trade-offs",
                    "Knowledge of Django ORM features",
                    "Performance considerations",
                    "Real-world application scenarios"
                ],
                "expected_answer_points": [
                    "ORM provides abstraction and security",
                    "Raw SQL for complex queries or performance",
                    "Django ORM features like select_related",
                    "When to use each approach"
                ]
            },
            {
                "question_text": "How would you implement caching in a Django application? What caching strategies would you use?",
                "question_type": "technical",
                "tags": ["python", "django", "caching", "performance", "redis", "mid-level"],
                "difficulty": "medium",
                "evaluation_criteria": [
                    "Knowledge of Django caching framework",
                    "Understanding of different cache backends",
                    "Cache invalidation strategies",
                    "Performance optimization"
                ],
                "expected_answer_points": [
                    "Django's cache framework",
                    "Redis vs Memcached",
                    "Cache keys and invalidation",
                    "Cache middleware and decorators"
                ]
            },
            {
                "question_text": "Design a RESTful API for a job posting system. What endpoints would you create and why?",
                "question_type": "technical",
                "tags": ["api", "rest", "design", "architecture", "senior"],
                "difficulty": "hard",
                "evaluation_criteria": [
                    "REST principles understanding",
                    "API design best practices",
                    "Resource modeling",
                    "Scalability considerations"
                ],
                "expected_answer_points": [
                    "CRUD operations for jobs",
                    "Nested resources (applications)",
                    "Filtering and pagination",
                    "Authentication and authorization"
                ]
            },
            
            # Frontend/React Questions
            {
                "question_text": "Explain React hooks and when you would use useState vs useEffect vs useContext.",
                "question_type": "technical",
                "tags": ["react", "javascript", "hooks", "frontend", "mid-level"],
                "difficulty": "medium",
                "evaluation_criteria": [
                    "Understanding of React hooks",
                    "State management knowledge",
                    "Component lifecycle",
                    "Context API usage"
                ],
                "expected_answer_points": [
                    "useState for local state",
                    "useEffect for side effects",
                    "useContext for global state",
                    "Hook rules and best practices"
                ]
            },
            {
                "question_text": "How would you optimize the performance of a React application with many components?",
                "question_type": "technical",
                "tags": ["react", "performance", "optimization", "frontend", "senior"],
                "difficulty": "hard",
                "evaluation_criteria": [
                    "Performance optimization techniques",
                    "React rendering optimization",
                    "Bundle size optimization",
                    "Monitoring and profiling"
                ],
                "expected_answer_points": [
                    "React.memo and useMemo",
                    "Code splitting and lazy loading",
                    "Bundle analysis tools",
                    "Performance monitoring"
                ]
            },
            
            # DevOps/Infrastructure Questions
            {
                "question_text": "Explain the difference between Docker and Kubernetes. When would you use each?",
                "question_type": "technical",
                "tags": ["docker", "kubernetes", "devops", "containers", "senior"],
                "difficulty": "hard",
                "evaluation_criteria": [
                    "Containerization understanding",
                    "Orchestration knowledge",
                    "Scalability considerations",
                    "Real-world deployment scenarios"
                ],
                "expected_answer_points": [
                    "Docker for containerization",
                    "Kubernetes for orchestration",
                    "Microservices architecture",
                    "Production deployment strategies"
                ]
            },
            {
                "question_text": "How would you set up CI/CD pipeline for a Python web application?",
                "question_type": "technical",
                "tags": ["ci/cd", "devops", "python", "automation", "mid-level"],
                "difficulty": "medium",
                "evaluation_criteria": [
                    "CI/CD pipeline understanding",
                    "Automation strategies",
                    "Testing integration",
                    "Deployment best practices"
                ],
                "expected_answer_points": [
                    "GitHub Actions or Jenkins setup",
                    "Testing and linting stages",
                    "Deployment automation",
                    "Environment management"
                ]
            },
            
            # Machine Learning/AI Questions
            {
                "question_text": "Explain the difference between supervised and unsupervised learning. Give examples of each.",
                "question_type": "technical",
                "tags": ["machine learning", "ai", "data science", "algorithms", "mid-level"],
                "difficulty": "medium",
                "evaluation_criteria": [
                    "ML fundamentals understanding",
                    "Algorithm knowledge",
                    "Real-world applications",
                    "Problem-solving approach"
                ],
                "expected_answer_points": [
                    "Supervised: labeled data, classification/regression",
                    "Unsupervised: unlabeled data, clustering",
                    "Examples: spam detection vs customer segmentation",
                    "When to use each approach"
                ]
            },
            {
                "question_text": "How would you handle overfitting in a machine learning model?",
                "question_type": "technical",
                "tags": ["machine learning", "overfitting", "modeling", "senior"],
                "difficulty": "hard",
                "evaluation_criteria": [
                    "Understanding of overfitting",
                    "Regularization techniques",
                    "Cross-validation knowledge",
                    "Model evaluation skills"
                ],
                "expected_answer_points": [
                    "Regularization (L1/L2)",
                    "Cross-validation",
                    "Feature selection",
                    "Early stopping"
                ]
            },
            
            # Behavioral Questions - Leadership
            {
                "question_text": "Tell me about a time when you had to lead a team through a major technical challenge. What was your approach?",
                "question_type": "behavioral",
                "tags": ["leadership", "teamwork", "technical-leadership", "senior"],
                "difficulty": "hard",
                "evaluation_criteria": [
                    "Leadership approach",
                    "Problem-solving methodology",
                    "Team collaboration",
                    "Outcome and learning"
                ],
                "expected_answer_points": [
                    "Clear problem definition",
                    "Team involvement and delegation",
                    "Systematic approach",
                    "Successful resolution"
                ],
                "star_structure": {
                    "situation": "Major technical challenge affecting team",
                    "task": "Lead team through resolution",
                    "action": "Systematic problem-solving approach",
                    "result": "Successfully resolved challenge"
                }
            },
            {
                "question_text": "Describe a situation where you had to mentor a junior developer. How did you help them grow?",
                "question_type": "behavioral",
                "tags": ["mentoring", "leadership", "teamwork", "mid-level"],
                "difficulty": "medium",
                "evaluation_criteria": [
                    "Mentoring approach",
                    "Patience and communication",
                    "Skill development focus",
                    "Long-term growth perspective"
                ],
                "expected_answer_points": [
                    "Assessment of current skills",
                    "Structured learning plan",
                    "Regular feedback and guidance",
                    "Measurable improvement"
                ],
                "star_structure": {
                    "situation": "Junior developer struggling with tasks",
                    "task": "Help them develop skills and confidence",
                    "action": "Structured mentoring approach",
                    "result": "Developer became more independent"
                }
            },
            
            # Problem-Solving Questions
            {
                "question_text": "How would you design a system to handle 1 million concurrent users?",
                "question_type": "technical",
                "tags": ["scalability", "architecture", "system-design", "senior"],
                "difficulty": "hard",
                "evaluation_criteria": [
                    "System design thinking",
                    "Scalability considerations",
                    "Technology choices",
                    "Trade-off analysis"
                ],
                "expected_answer_points": [
                    "Load balancing strategy",
                    "Database scaling (sharding/replication)",
                    "Caching layers",
                    "CDN and edge computing"
                ]
            },
            {
                "question_text": "You're given a legacy codebase with no tests. How would you approach adding test coverage?",
                "question_type": "technical",
                "tags": ["testing", "legacy-code", "refactoring", "mid-level"],
                "difficulty": "medium",
                "evaluation_criteria": [
                    "Testing strategy",
                    "Risk assessment",
                    "Incremental approach",
                    "Quality improvement"
                ],
                "expected_answer_points": [
                    "Identify critical paths",
                    "Start with integration tests",
                    "Gradual unit test addition",
                    "Continuous improvement"
                ]
            },
            
            # Cultural Fit Questions
            {
                "question_text": "What does 'continuous learning' mean to you in the context of software development?",
                "question_type": "behavioral",
                "tags": ["learning-agility", "growth-mindset", "soft-skills", "all-levels"],
                "difficulty": "easy",
                "evaluation_criteria": [
                    "Learning mindset",
                    "Adaptability",
                    "Industry awareness",
                    "Personal development"
                ],
                "expected_answer_points": [
                    "Staying updated with trends",
                    "Learning from mistakes",
                    "Sharing knowledge",
                    "Adapting to new technologies"
                ]
            },
            {
                "question_text": "How do you handle disagreements with team members about technical decisions?",
                "question_type": "behavioral",
                "tags": ["conflict-resolution", "teamwork", "communication", "mid-level"],
                "difficulty": "medium",
                "evaluation_criteria": [
                    "Conflict resolution skills",
                    "Professional communication",
                    "Team collaboration",
                    "Decision-making process"
                ],
                "expected_answer_points": [
                    "Listen to different perspectives",
                    "Focus on facts and data",
                    "Seek consensus when possible",
                    "Respect team decisions"
                ]
            }
        ]

        self.stdout.write("Creating AI-enhanced question bank...")
        created_count = 0
        
        for data in questions_data:
            # Generate UUID for the question
            data['id'] = uuid.uuid4()
            
            # Set default values for missing fields
            if 'evaluation_criteria' not in data:
                data['evaluation_criteria'] = []
            if 'expected_answer_points' not in data:
                data['expected_answer_points'] = []
            if 'star_structure' not in data:
                data['star_structure'] = {}
            if 'car_structure' not in data:
                data['car_structure'] = {}
            
            # Create the question
            QuestionBank.objects.create(**data)
            created_count += 1
            self.stdout.write(f"✅ Created: {data['question_text'][:50]}...")
        
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully populated AI question bank with {created_count} questions!"
            )
        )
        
        # Show statistics
        total_questions = QuestionBank.objects.count()
        by_type = QuestionBank.objects.values('question_type').distinct().count()
        by_difficulty = QuestionBank.objects.values('difficulty').distinct().count()
        
        self.stdout.write(f"📊 Total questions in bank: {total_questions}")
        self.stdout.write(f"📊 Question types: {by_type}")
        self.stdout.write(f"📊 Difficulty levels: {by_difficulty}") 