from django.core.management.base import BaseCommand
from competency_hiring.models import QuestionBank
from django.db import transaction


class Command(BaseCommand):
    help = 'Populate question bank with sample questions and tags for AI integration'

    def handle(self, *args, **options):
        with transaction.atomic():
            self.stdout.write('Creating question bank with sample questions...')
            
            questions_data = [
                {
                    "question_text": "Tell me about a time when you had to debug a critical production issue. What was your approach?",
                    "question_type": "behavioral",
                    "tags": ["debugging", "production", "problem-solving", "technical", "senior"],
                    "difficulty": "hard",
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
                    ],
                    "star_structure": {
                        "situation": "Production bug affecting users",
                        "task": "Debug and fix the issue quickly",
                        "action": "Systematic debugging approach",
                        "result": "Successfully resolved the issue"
                    }
                },
                {
                    "question_text": "Describe a situation where you had to explain a complex technical concept to a non-technical stakeholder. How did you approach it?",
                    "question_type": "behavioral",
                    "tags": ["communication", "stakeholder-management", "soft-skills", "mid-level"],
                    "difficulty": "medium",
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
                    ],
                    "star_structure": {
                        "situation": "Need to explain technical concept",
                        "task": "Make it understandable to non-technical audience",
                        "action": "Used analogies and simplified language",
                        "result": "Stakeholder understood and made informed decision"
                    }
                },
                {
                    "question_text": "How would you design a scalable microservices architecture for a high-traffic e-commerce platform?",
                    "question_type": "technical",
                    "tags": ["architecture", "microservices", "scalability", "senior", "technical"],
                    "difficulty": "hard",
                    "evaluation_criteria": [
                        "Shows architectural thinking",
                        "Considers scalability factors",
                        "Addresses potential challenges",
                        "Demonstrates technical depth"
                    ],
                    "expected_answer_points": [
                        "Service decomposition strategy",
                        "Load balancing approach",
                        "Data consistency considerations",
                        "Monitoring and observability"
                    ]
                },
                {
                    "question_text": "Tell me about a time when you helped a struggling team member. What was the situation and how did you support them?",
                    "question_type": "behavioral",
                    "tags": ["collaboration", "teamwork", "leadership", "soft-skills", "mid-level"],
                    "difficulty": "medium",
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
                    ],
                    "star_structure": {
                        "situation": "Team member struggling with task",
                        "task": "Help them succeed without taking over",
                        "action": "Provided guidance and support",
                        "result": "Team member completed the task successfully"
                    }
                },
                {
                    "question_text": "What's the most challenging bug you've ever fixed? Walk me through your debugging process.",
                    "question_type": "technical",
                    "tags": ["debugging", "problem-solving", "technical", "mid-level"],
                    "difficulty": "medium",
                    "evaluation_criteria": [
                        "Demonstrates systematic approach",
                        "Shows persistence and creativity",
                        "Explains technical concepts clearly",
                        "Shows learning from experience"
                    ],
                    "expected_answer_points": [
                        "Reproduced the issue consistently",
                        "Used appropriate debugging tools",
                        "Isolated the root cause",
                        "Implemented and tested the fix"
                    ]
                },
                {
                    "question_text": "How do you stay updated with the latest technologies and industry trends?",
                    "question_type": "behavioral",
                    "tags": ["learning-agility", "growth-mindset", "soft-skills", "all-levels"],
                    "difficulty": "easy",
                    "evaluation_criteria": [
                        "Shows curiosity and eagerness to learn",
                        "Demonstrates systematic learning approach",
                        "Applies new knowledge practically",
                        "Shares knowledge with team"
                    ],
                    "expected_answer_points": [
                        "Follows industry blogs and publications",
                        "Participates in conferences or meetups",
                        "Takes online courses or certifications",
                        "Experiments with new technologies"
                    ]
                },
                {
                    "question_text": "Describe a time when you had to make a difficult technical decision with limited information. How did you proceed?",
                    "question_type": "behavioral",
                    "tags": ["decision-making", "technical-leadership", "senior", "problem-solving"],
                    "difficulty": "hard",
                    "evaluation_criteria": [
                        "Shows analytical thinking",
                        "Considers multiple perspectives",
                        "Makes informed decisions",
                        "Takes responsibility for outcomes"
                    ],
                    "expected_answer_points": [
                        "Gathered available information",
                        "Evaluated trade-offs",
                        "Consulted with stakeholders",
                        "Monitored outcomes and adjusted"
                    ],
                    "star_structure": {
                        "situation": "Faced with limited information for technical decision",
                        "task": "Make the best possible decision",
                        "action": "Analyzed available data and consulted team",
                        "result": "Made informed decision and monitored results"
                    }
                },
                {
                    "question_text": "How would you handle a situation where your team disagrees with your technical approach?",
                    "question_type": "situational",
                    "tags": ["conflict-resolution", "leadership", "teamwork", "mid-level"],
                    "difficulty": "medium",
                    "evaluation_criteria": [
                        "Shows openness to feedback",
                        "Demonstrates conflict resolution skills",
                        "Focuses on team success",
                        "Maintains professional relationships"
                    ],
                    "expected_answer_points": [
                        "Listened to team concerns",
                        "Explained reasoning clearly",
                        "Considered alternative approaches",
                        "Reached consensus or compromise"
                    ]
                }
            ]
            
            for q_data in questions_data:
                question, created = QuestionBank.objects.get_or_create(
                    question_text=q_data["question_text"],
                    defaults=q_data
                )
                if created:
                    self.stdout.write(f'Created question: {question.question_text[:50]}...')
                else:
                    self.stdout.write(f'Question already exists: {question.question_text[:50]}...')
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully populated question bank with {len(questions_data)} questions'
                )
            ) 