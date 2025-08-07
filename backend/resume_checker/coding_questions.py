"""
Coding Questions Management
Loads and manages coding questions from JSON database
"""

import json
import os
from typing import Dict, List, Optional
from django.conf import settings

class CodingQuestionsManager:
    """Manages coding questions database and selection"""
    
    def __init__(self):
        self.questions_db = None
        self.load_questions()
    
    def load_questions(self):
        """Load coding questions from JSON file"""
        try:
            # Try to load from the data directory
            file_path = os.path.join(
                os.path.dirname(__file__), 
                'data', 
                'full_coding_questions_database.json'
            )
            
            print(f"DEBUG: Trying to load coding questions from: {file_path}")
            print(f"DEBUG: File exists: {os.path.exists(file_path)}")
            
            with open(file_path, 'r', encoding='utf-8') as file:
                self.questions_db = json.load(file)
                print(f"DEBUG: Successfully loaded coding questions database with {len(self.questions_db)} technologies")
                print(f"DEBUG: Available technologies: {list(self.questions_db.keys())}")
                
        except FileNotFoundError:
            print(f"Warning: Coding questions database not found at {file_path}")
            self.questions_db = {}
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in coding questions database: {e}")
            self.questions_db = {}
        except Exception as e:
            print(f"Error loading coding questions: {e}")
            self.questions_db = {}
    
    def get_experience_level(self, years_of_experience: int) -> str:
        """Determine experience level based on years of experience"""
        if years_of_experience <= 2:
            return "junior"
        elif years_of_experience <= 5:
            return "mid"
        else:
            return "senior"
    
    def find_relevant_technologies(self, candidate_skills: List[str], job_skills: List[str]) -> List[str]:
        """Find technologies that are relevant for coding questions"""
        # Map common skill variations to question categories
        skill_mapping = {
            # Java variations
            "java": "java", "spring": "java", "spring boot": "java", "hibernate": "java",
            "junit": "java", "maven": "java", "gradle": "java", "j2ee": "java",
            
            # Python variations
            "python": "python", "django": "python", "flask": "python", "pandas": "python",
            "numpy": "python", "scikit-learn": "python", "tensorflow": "python", "pytorch": "python",
            "fastapi": "python", "celery": "python",
            
            # JavaScript variations
            "javascript": "javascript", "js": "javascript", "node.js": "javascript",
            "react": "javascript", "vue": "javascript", "angular": "javascript",
            "typescript": "javascript", "es6": "javascript", "express": "javascript",
            
            # SQL variations
            "sql": "sql", "mysql": "sql", "postgresql": "sql", "oracle": "sql",
            "sqlite": "sql", "database": "sql", "pl/sql": "sql",
            
            # DevOps variations
            "devops": "devops", "docker": "devops", "kubernetes": "devops", "k8s": "devops",
            "jenkins": "devops", "git": "devops", "ci/cd": "devops", "cicd": "devops",
            "terraform": "devops", "ansible": "devops", "puppet": "devops", "chef": "devops",
            "github actions": "devops", "gitlab ci": "devops", "azure devops": "devops",
            "shell scripting": "devops", "bash": "devops", "linux": "devops",
            
            # Cloud variations
            "aws": "cloud", "amazon web services": "cloud", "ec2": "cloud", "s3": "cloud",
            "lambda": "cloud", "cloudfront": "cloud", "route53": "cloud", "rds": "cloud",
            "dynamodb": "cloud", "vpc": "cloud", "iam": "cloud", "cloudformation": "cloud",
            "azure": "cloud", "microsoft azure": "cloud", "gcp": "cloud", "google cloud": "cloud",
            "google cloud platform": "cloud", "kubernetes engine": "cloud", "compute engine": "cloud",
            "cloud storage": "cloud", "cloud sql": "cloud", "cloud functions": "cloud",
            
            # System Design variations
            "system design": "system_design", "architecture": "system_design",
            "microservices": "system_design", "distributed systems": "system_design",
            "scalability": "system_design"
        }
        
        relevant_techs = set()
        
        # Check candidate skills
        for skill in candidate_skills:
            skill_lower = skill.lower()
            if skill_lower in skill_mapping:
                relevant_techs.add(skill_mapping[skill_lower])
        
        # Check job skills
        for skill in job_skills:
            skill_lower = skill.lower()
            if skill_lower in skill_mapping:
                relevant_techs.add(skill_mapping[skill_lower])
        
        return list(relevant_techs)
    
    def get_questions_for_tech(self, technology: str, experience_level: str, max_questions: int = 5) -> List[Dict]:
        """Get questions for a specific technology and experience level"""
        if not self.questions_db or technology not in self.questions_db:
            return []
        
        if experience_level not in self.questions_db[technology]:
            return []
        
        questions = self.questions_db[technology][experience_level]
        return questions[:max_questions]
    
    def prioritize_questions(self, questions: List[Dict], job_skills: List[str], max_questions: int = 15) -> List[Dict]:
        """Prioritize questions based on job requirements"""
        if not questions:
            return []
        
        # Simple prioritization: prefer questions that match job skills
        prioritized = []
        
        # First, add questions that match job skills
        for question in questions:
            question_tags = set(tag.lower() for tag in question.get('tags', []))
            job_skills_lower = set(skill.lower() for skill in job_skills)
            
            if question_tags & job_skills_lower:  # Intersection
                prioritized.append(question)
        
        # Then add remaining questions
        for question in questions:
            if question not in prioritized:
                prioritized.append(question)
        
        return prioritized[:max_questions]
    
    def generate_personalized_questions(self, candidate_skills: List[str], candidate_experience: int, job_skills: List[str]) -> Dict:
        """Generate personalized coding questions based on candidate profile and job requirements"""
        
        print(f"DEBUG: Generating questions for skills: {candidate_skills}")
        print(f"DEBUG: Candidate experience: {candidate_experience}")
        print(f"DEBUG: Job skills: {job_skills}")
        
        # Determine experience level
        experience_level = self.get_experience_level(candidate_experience)
        print(f"DEBUG: Experience level: {experience_level}")
        
        # Find relevant technologies
        relevant_techs = self.find_relevant_technologies(candidate_skills, job_skills)
        print(f"DEBUG: Relevant technologies: {relevant_techs}")
        
        # If no relevant techs found, use defaults based on experience
        if not relevant_techs:
            if experience_level == "junior":
                relevant_techs = ["python", "javascript"]  # Common for beginners
            elif experience_level == "mid":
                relevant_techs = ["java", "python", "javascript"]
            else:
                relevant_techs = ["java", "python", "system_design"]  # Senior level
        
        # Collect questions from relevant technologies
        all_questions = []
        for tech in relevant_techs:
            tech_questions = self.get_questions_for_tech(tech, experience_level)
            all_questions.extend(tech_questions)
        
        # If still no questions, try other experience levels
        if not all_questions:
            for tech in relevant_techs:
                for level in ["junior", "mid", "senior"]:
                    if level != experience_level:
                        tech_questions = self.get_questions_for_tech(tech, level)
                        all_questions.extend(tech_questions)
        
        # Prioritize questions based on job requirements
        prioritized_questions = self.prioritize_questions(all_questions, job_skills)
        
        # Calculate estimated time
        estimated_time = sum(q.get('time_limit', 15) for q in prioritized_questions)
        
        # Group questions by technology
        questions_by_tech = {}
        for question in prioritized_questions:
            tech = question.get('tags', [])[0] if question.get('tags') else 'general'
            if tech not in questions_by_tech:
                questions_by_tech[tech] = []
            questions_by_tech[tech].append(question)
        
        return {
            'questions': prioritized_questions,
            'questions_by_technology': questions_by_tech,
            'total_questions': len(prioritized_questions),
            'technologies': relevant_techs,
            'experience_level': experience_level,
            'estimated_time': estimated_time,
            'difficulty_breakdown': self._get_difficulty_breakdown(prioritized_questions)
        }
    
    def _get_difficulty_breakdown(self, questions: List[Dict]) -> Dict:
        """Get breakdown of questions by difficulty"""
        breakdown = {'easy': 0, 'medium': 0, 'hard': 0}
        for question in questions:
            difficulty = question.get('difficulty', 'medium')
            if difficulty in breakdown:
                breakdown[difficulty] += 1
        return breakdown
    
    def get_question_by_id(self, question_id: str) -> Optional[Dict]:
        """Get a specific question by ID"""
        if not self.questions_db:
            return None
        
        for tech in self.questions_db.values():
            for level in tech.values():
                for question in level:
                    if question.get('id') == question_id:
                        return question
        
        return None
    
    def get_questions_summary(self) -> Dict:
        """Get summary of available questions"""
        if not self.questions_db:
            return {'total_questions': 0, 'technologies': [], 'levels': []}
        
        total_questions = 0
        technologies = list(self.questions_db.keys())
        levels = set()
        
        for tech in self.questions_db.values():
            for level, questions in tech.items():
                levels.add(level)
                total_questions += len(questions)
        
        return {
            'total_questions': total_questions,
            'technologies': technologies,
            'levels': list(levels)
        }


# Global instance
coding_questions_manager = CodingQuestionsManager() 