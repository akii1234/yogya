from django.core.management.base import BaseCommand
from competency_hiring.models import CompetencyFramework, Competency, InterviewTemplate, InterviewQuestion
from django.db import transaction


class Command(BaseCommand):
    help = 'Populate competency frameworks with enhanced behavioral interview structure'

    def handle(self, *args, **options):
        with transaction.atomic():
            self.stdout.write('Creating enhanced competency frameworks...')
            
            # Create Python Developer Framework
            python_framework = CompetencyFramework.objects.create(
                name="Python Developer - Mid Level",
                description="Competency framework for mid-level Python developers focusing on behavioral assessment",
                technology="Python",
                level="mid"
            )
            
            # Core Competencies for Tech Roles (as suggested)
            competencies_data = [
                {
                    "title": "Problem Solving",
                    "description": "Ability to break down complex problems and implement effective solutions.",
                    "evaluation_method": "STAR",
                    "evaluation_criteria": [
                        "Demonstrates structured thinking",
                        "Breaks down problems into sub-tasks", 
                        "Can debug complex issues independently",
                        "Shows analytical approach to problem-solving"
                    ],
                    "tags": ["Core", "High Priority", "Engineering"],
                    "sample_question": "Tell me about a time when you faced a complex technical problem. How did you approach it?",
                    "weightage": 20.0
                },
                {
                    "title": "Communication",
                    "description": "Clarity in expressing ideas, especially technical concepts to various stakeholders.",
                    "evaluation_method": "STAR",
                    "evaluation_criteria": [
                        "Explains technical concepts clearly",
                        "Adapts communication style to audience",
                        "Provides context and background",
                        "Uses appropriate technical depth"
                    ],
                    "tags": ["Core", "High Priority", "Soft Skills"],
                    "sample_question": "Describe a time you had to explain a technical concept to a non-technical stakeholder.",
                    "weightage": 15.0
                },
                {
                    "title": "Collaboration",
                    "description": "Teamwork, conflict resolution, and ability to work effectively with others.",
                    "evaluation_method": "STAR",
                    "evaluation_criteria": [
                        "Works effectively in team settings",
                        "Resolves conflicts constructively",
                        "Supports team members",
                        "Shares knowledge and resources"
                    ],
                    "tags": ["Core", "High Priority", "Soft Skills"],
                    "sample_question": "When did you help a struggling team member? What was the situation and outcome?",
                    "weightage": 15.0
                },
                {
                    "title": "Ownership",
                    "description": "Initiative, accountability, and taking responsibility for deliverables.",
                    "evaluation_method": "STAR",
                    "evaluation_criteria": [
                        "Takes initiative without being asked",
                        "Follows through on commitments",
                        "Takes responsibility for outcomes",
                        "Shows accountability for mistakes"
                    ],
                    "tags": ["Core", "High Priority", "Leadership"],
                    "sample_question": "Give an example where you took ownership of a delivery that was at risk.",
                    "weightage": 20.0
                },
                {
                    "title": "Learning Agility",
                    "description": "Curiosity, adaptability, and ability to learn new technologies quickly.",
                    "evaluation_method": "STAR",
                    "evaluation_criteria": [
                        "Shows curiosity and eagerness to learn",
                        "Adapts to new technologies quickly",
                        "Learns from mistakes and feedback",
                        "Stays updated with industry trends"
                    ],
                    "tags": ["Core", "Medium Priority", "Growth"],
                    "sample_question": "Tell me about a time you had to pick up a new technology under a tight deadline.",
                    "weightage": 10.0
                },
                {
                    "title": "Technical Depth",
                    "description": "Engineering fundamentals, architecture thinking, and technical expertise.",
                    "evaluation_method": "STAR",
                    "evaluation_criteria": [
                        "Demonstrates strong technical fundamentals",
                        "Shows architectural thinking",
                        "Can design scalable solutions",
                        "Understands trade-offs in technical decisions"
                    ],
                    "tags": ["Core", "High Priority", "Technical"],
                    "sample_question": "Describe the most complex system you've built or contributed to. What were the challenges?",
                    "weightage": 20.0
                }
            ]
            
            # Create competencies
            for comp_data in competencies_data:
                competency = Competency.objects.create(
                    framework=python_framework,
                    title=comp_data["title"],
                    description=comp_data["description"],
                    evaluation_method=comp_data["evaluation_method"],
                    evaluation_criteria=comp_data["evaluation_criteria"],
                    tags=comp_data["tags"],
                    sample_question=comp_data["sample_question"],
                    weightage=comp_data["weightage"],
                    order=len(Competency.objects.filter(framework=python_framework)) + 1
                )
                self.stdout.write(f'Created competency: {competency.title}')
            
            # Create Interview Template
            template = InterviewTemplate.objects.create(
                name="Python Developer - Mid Level Interview",
                framework=python_framework,
                description="Comprehensive behavioral interview template for mid-level Python developers",
                duration_minutes=60
            )
            
            # Create sample questions for each competency
            questions_data = [
                {
                    "competency_title": "Problem Solving",
                    "question_text": "Tell me about a time when you debugged a critical bug in production. What was the situation, what steps did you take, and what was the outcome?",
                    "star_structure": {
                        "situation": "Production bug affecting users",
                        "task": "Debug and fix the issue quickly",
                        "action": "Systematic debugging approach",
                        "result": "Successfully resolved the issue"
                    },
                    "evaluation_criteria": [
                        "Demonstrates systematic debugging approach",
                        "Shows urgency and prioritization",
                        "Explains technical steps clearly",
                        "Shows learning from the experience"
                    ],
                    "expected_answer_points": [
                        "Identified the root cause",
                        "Used appropriate debugging tools",
                        "Communicated with stakeholders",
                        "Implemented a permanent fix"
                    ]
                },
                {
                    "competency_title": "Communication",
                    "question_text": "Describe a time when you had to explain a complex technical concept to a non-technical stakeholder. How did you approach it?",
                    "star_structure": {
                        "situation": "Need to explain technical concept",
                        "task": "Make it understandable to non-technical audience",
                        "action": "Used analogies and simplified language",
                        "result": "Stakeholder understood and made informed decision"
                    },
                    "evaluation_criteria": [
                        "Uses appropriate analogies",
                        "Avoids technical jargon",
                        "Checks for understanding",
                        "Adapts communication style"
                    ],
                    "expected_answer_points": [
                        "Used real-world analogies",
                        "Simplified complex concepts",
                        "Asked for feedback",
                        "Ensured understanding"
                    ]
                },
                {
                    "competency_title": "Collaboration",
                    "question_text": "Tell me about a time when you helped a struggling team member. What was the situation and how did you support them?",
                    "star_structure": {
                        "situation": "Team member struggling with task",
                        "task": "Help them succeed without taking over",
                        "action": "Provided guidance and support",
                        "result": "Team member completed the task successfully"
                    },
                    "evaluation_criteria": [
                        "Shows empathy and patience",
                        "Provides constructive help",
                        "Encourages independence",
                        "Builds team relationships"
                    ],
                    "expected_answer_points": [
                        "Identified the specific struggle",
                        "Provided targeted assistance",
                        "Encouraged problem-solving",
                        "Celebrated their success"
                    ]
                }
            ]
            
            for q_data in questions_data:
                competency = Competency.objects.get(
                    framework=python_framework,
                    title=q_data["competency_title"]
                )
                
                question = InterviewQuestion.objects.create(
                    template=template,
                    competency=competency,
                    question_text=q_data["question_text"],
                    question_type="behavioral",
                    star_structure=q_data["star_structure"],
                    evaluation_criteria=q_data["evaluation_criteria"],
                    expected_answer_points=q_data["expected_answer_points"],
                    time_allocation=8,
                    order=len(InterviewQuestion.objects.filter(template=template)) + 1
                )
                self.stdout.write(f'Created question: {question.question_text[:50]}...')
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created enhanced competency framework with {len(competencies_data)} competencies and {len(questions_data)} sample questions'
                )
            ) 