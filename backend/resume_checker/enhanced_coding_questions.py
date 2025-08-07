"""
Enhanced Coding Questions Management
Advanced algorithm with semantic matching, AI tagging, diversity scoring, and versioning
"""

import json
import os
from typing import Dict, List, Optional, Tuple
from collections import Counter
from datetime import datetime
import numpy as np
from django.conf import settings

# Import semantic matching libraries
try:
    from sentence_transformers import SentenceTransformer, util
    SEMANTIC_AVAILABLE = True
except ImportError:
    SEMANTIC_AVAILABLE = False
    print("Warning: sentence-transformers not available. Using fallback matching.")

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("Warning: OpenAI not available. Using fallback tagging.")

class EnhancedCodingQuestionsManager:
    """Enhanced coding questions manager with semantic matching and AI features"""
    
    def __init__(self):
        self.questions_db = None
        self.semantic_model = None
        self.load_questions()
        self.initialize_semantic_model()
    
    def initialize_semantic_model(self):
        """Initialize semantic matching model"""
        if SEMANTIC_AVAILABLE:
            try:
                self.semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
                print("✅ Semantic model loaded successfully")
            except Exception as e:
                print(f"❌ Error loading semantic model: {e}")
                self.semantic_model = None
        else:
            print("⚠️ Semantic matching disabled - install sentence-transformers")
    
    def load_questions(self):
        """Load coding questions from JSON file with versioning"""
        try:
            file_path = os.path.join(
                os.path.dirname(__file__), 
                'data', 
                'enhanced_coding_questions_database.json'
            )
            
            print(f"DEBUG: Loading enhanced coding questions from: {file_path}")
            
            with open(file_path, 'r', encoding='utf-8') as file:
                self.questions_db = json.load(file)
                
            # Validate versioning
            if 'metadata' not in self.questions_db:
                self.questions_db['metadata'] = {
                    'version': 'v1.0',
                    'created_at': datetime.now().isoformat(),
                    'last_updated': datetime.now().isoformat(),
                    'total_questions': self._count_total_questions()
                }
                
            print(f"✅ Loaded {self.questions_db['metadata']['total_questions']} questions")
                
        except FileNotFoundError:
            print(f"⚠️ Enhanced questions database not found. Creating fallback...")
            self.questions_db = self._create_fallback_database()
        except Exception as e:
            print(f"❌ Error loading questions: {e}")
            self.questions_db = self._create_fallback_database()
    
    def _create_fallback_database(self) -> Dict:
        """Create fallback database with basic questions"""
        return {
            'metadata': {
                'version': 'v1.0-fallback',
                'created_at': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat(),
                'total_questions': 0
            },
            'questions': {}
        }
    
    def _count_total_questions(self) -> int:
        """Count total questions in database"""
        count = 0
        for tech in self.questions_db.get('questions', {}).values():
            for level in tech.values():
                count += len(level)
        return count
    
    def get_experience_level(self, years_of_experience: int) -> str:
        """Determine experience level based on years of experience"""
        if years_of_experience <= 2:
            return "junior"
        elif years_of_experience <= 5:
            return "mid"
        else:
            return "senior"

    def prioritize_technologies_for_role(self, relevant_techs: List[str], job_title: str, job_description: str = "") -> List[str]:
        """Reorder technologies based on role-specific priority"""
        job_text = (job_title + " " + job_description).lower()
        
        # Role-based priority mapping
        if any(keyword in job_text for keyword in ["devops", "platform", "infrastructure", "sre", "site reliability"]):
            preferred_order = ["devops", "cloud", "system_design", "python", "sql"]
        elif any(keyword in job_text for keyword in ["backend", "api", "server", "microservices", "python backend", "django", "flask", "fastapi"]):
            preferred_order = ["python", "java", "system_design", "sql", "javascript"]
        elif any(keyword in job_text for keyword in ["frontend", "ui", "ux", "react", "angular", "vue"]):
            preferred_order = ["javascript", "web_development", "css", "html"]
        elif any(keyword in job_text for keyword in ["ml", "ai", "machine learning", "data science", "analytics"]):
            preferred_order = ["ml_ai", "python", "sql", "statistics"]
        elif any(keyword in job_text for keyword in ["mobile", "ios", "android", "react native"]):
            preferred_order = ["mobile", "javascript", "java", "swift"]
        elif any(keyword in job_text for keyword in ["full stack", "fullstack"]):
            preferred_order = ["javascript", "python", "java", "sql", "web_development"]
        else:
            # Default order for general roles
            preferred_order = ["python", "java", "javascript", "sql", "system_design"]

        # Sort relevant techs based on preferred order
        ordered = sorted(
            relevant_techs,
            key=lambda x: preferred_order.index(x) if x in preferred_order else len(preferred_order)
        )
        
        print(f"DEBUG: Role-based prioritization - Job: {job_title}, Preferred: {preferred_order}, Ordered: {ordered}")
        return ordered
    
    def semantic_similarity_match(self, job_description: str, questions: List[Dict]) -> List[Tuple[Dict, float]]:
        """Calculate semantic similarity between job description and questions"""
        if not self.semantic_model or not questions:
            return [(q, 0.5) for q in questions]  # Fallback: equal scores
        
        try:
            # Encode job description
            jd_embedding = self.semantic_model.encode(job_description)
            
            # Encode question descriptions
            question_texts = [q.get('description', '') for q in questions]
            question_embeddings = self.semantic_model.encode(question_texts)
            
            # Calculate cosine similarity
            scores = util.cos_sim(jd_embedding, question_embeddings)[0]
            
            # Return questions with similarity scores
            return [(questions[i], float(scores[i])) for i in range(len(questions))]
            
        except Exception as e:
            print(f"❌ Semantic matching error: {e}")
            return [(q, 0.5) for q in questions]
    
    def auto_tag_question(self, question_text: str) -> List[str]:
        """Use AI to automatically tag questions"""
        if not OPENAI_AVAILABLE:
            return self._fallback_tagging(question_text)
        
        try:
            # Use OpenAI to generate tags
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a coding question analyzer. Extract relevant tags from the question. Return only a JSON array of tags."
                    },
                    {
                        "role": "user", 
                        "content": f"Analyze this coding question and extract tags: {question_text}"
                    }
                ],
                max_tokens=100,
                temperature=0.3
            )
            
            # Parse response
            tags_text = response.choices[0].message.content.strip()
            if tags_text.startswith('[') and tags_text.endswith(']'):
                import ast
                return ast.literal_eval(tags_text)
            else:
                return self._fallback_tagging(question_text)
                
        except Exception as e:
            print(f"❌ AI tagging error: {e}")
            return self._fallback_tagging(question_text)
    
    def _fallback_tagging(self, question_text: str) -> List[str]:
        """Fallback tagging using keyword matching"""
        text_lower = question_text.lower()
        tags = []
        
        # Basic keyword matching
        if any(word in text_lower for word in ['array', 'list', 'vector']):
            tags.append('data_structures')
        if any(word in text_lower for word in ['sort', 'search', 'algorithm']):
            tags.append('algorithms')
        if any(word in text_lower for word in ['tree', 'graph', 'linked']):
            tags.append('advanced_data_structures')
        if any(word in text_lower for word in ['database', 'sql', 'query']):
            tags.append('database')
        if any(word in text_lower for word in ['api', 'rest', 'http']):
            tags.append('web_development')
        if any(word in text_lower for word in ['thread', 'concurrent', 'async']):
            tags.append('concurrency')
        
        return tags if tags else ['general']
    
    def calculate_diversity_score(self, questions: List[Dict]) -> float:
        """Calculate diversity score based on question categories"""
        if not questions:
            return 0.0
        
        # Extract categories
        categories = [q.get('category', 'general') for q in questions]
        category_counts = Counter(categories)
        
        # Diversity metrics
        unique_categories = len(category_counts)
        total_questions = len(questions)
        
        # Calculate diversity score (0-1)
        # Higher score = more diverse
        diversity_score = unique_categories / min(total_questions, 5)  # Normalize to 5 categories max
        
        return min(diversity_score, 1.0)
    
    def ensure_diversity(self, questions: List[Dict], target_categories: List[str] = None) -> List[Dict]:
        """Ensure question diversity by category"""
        if not questions:
            return questions
        
        if target_categories is None:
            target_categories = ['data_structures', 'algorithms', 'system_design', 'database', 'web_development']
        
        # Group questions by category
        questions_by_category = {}
        for q in questions:
            category = q.get('category', 'general')
            if category not in questions_by_category:
                questions_by_category[category] = []
            questions_by_category[category].append(q)
        
        # Select diverse questions
        diverse_questions = []
        max_per_category = max(1, len(questions) // len(target_categories))
        
        # First, ensure at least one question from each target category
        for category in target_categories:
            if category in questions_by_category and questions_by_category[category]:
                diverse_questions.append(questions_by_category[category][0])
        
        # Then fill remaining slots with best questions
        remaining_slots = len(questions) - len(diverse_questions)
        if remaining_slots > 0:
            # Get all questions not yet selected
            selected_ids = {q.get('id') for q in diverse_questions}
            remaining_questions = [q for q in questions if q.get('id') not in selected_ids]
            
            # Sort by relevance and add to diverse set
            remaining_questions.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            diverse_questions.extend(remaining_questions[:remaining_slots])
        
        return diverse_questions
    
    def find_relevant_technologies(self, candidate_skills: List[str], job_skills: List[str]) -> List[str]:
        """Find technologies that are relevant for coding questions"""
        # Enhanced skill mapping with more variations
        skill_mapping = {
            # Java Ecosystem
            "java": "java", "spring": "java", "spring boot": "java", "hibernate": "java",
            "junit": "java", "maven": "java", "gradle": "java", "j2ee": "java",
            "jsp": "java", "servlet": "java", "jpa": "java", "spring mvc": "java",
            
            # Python Ecosystem
            "python": "python", "django": "python", "flask": "python", "pandas": "python",
            "numpy": "python", "scikit-learn": "python", "tensorflow": "python", "pytorch": "python",
            "fastapi": "python", "celery": "python", "matplotlib": "python", "seaborn": "python",
            "requests": "python", "beautifulsoup": "python", "selenium": "python",
            
            # JavaScript Ecosystem
            "javascript": "javascript", "js": "javascript", "node.js": "javascript",
            "react": "javascript", "vue": "javascript", "angular": "javascript",
            "typescript": "javascript", "es6": "javascript", "express": "javascript",
            "next.js": "javascript", "nuxt.js": "javascript", "redux": "javascript",
            
            # Database & SQL
            "sql": "sql", "mysql": "sql", "postgresql": "sql", "oracle": "sql",
            "sqlite": "sql", "database": "sql", "pl/sql": "sql", "mongodb": "nosql",
            "redis": "nosql", "cassandra": "nosql", "elasticsearch": "nosql",
            
            # DevOps & Infrastructure
            "devops": "devops", "docker": "devops", "kubernetes": "devops", "k8s": "devops",
            "jenkins": "devops", "git": "devops", "ci/cd": "devops", "cicd": "devops",
            "terraform": "devops", "ansible": "devops", "puppet": "devops", "chef": "devops",
            "github actions": "devops", "gitlab ci": "devops", "azure devops": "devops",
            "shell scripting": "devops", "bash": "devops", "linux": "devops",
            "monitoring": "devops", "observability": "devops", "grafana": "devops",
            "prometheus": "devops", "incident response": "devops", "alerting": "devops",
            "infrastructure as code": "devops", "iac": "devops", "platform engineering": "devops",
            "sre": "devops", "site reliability": "devops", "reliability engineering": "devops",
            "logging": "devops", "elk stack": "devops", "elasticsearch": "devops",
            "logstash": "devops", "kibana": "devops", "splunk": "devops", "datadog": "devops",
            "new relic": "devops", "apm": "devops", "application performance monitoring": "devops",
            "load balancer": "devops", "nginx": "devops", "haproxy": "devops", "traefik": "devops",
            "service mesh": "devops", "istio": "devops", "linkerd": "devops", "consul": "devops",
            "vault": "devops", "secrets management": "devops", "configuration management": "devops",
            
            # Cloud Platforms
            "aws": "cloud", "amazon web services": "cloud", "ec2": "cloud", "s3": "cloud",
            "lambda": "cloud", "cloudfront": "cloud", "route53": "cloud", "rds": "cloud",
            "dynamodb": "cloud", "vpc": "cloud", "iam": "cloud", "cloudformation": "cloud",
            "azure": "cloud", "microsoft azure": "cloud", "gcp": "cloud", "google cloud": "cloud",
            "google cloud platform": "cloud", "kubernetes engine": "cloud", "compute engine": "cloud",
            "cloud storage": "cloud", "cloud sql": "cloud", "cloud functions": "cloud",
            
            # System Design & Architecture
            "system design": "system_design", "architecture": "system_design",
            "microservices": "system_design", "distributed systems": "system_design",
            "scalability": "system_design", "load balancing": "system_design",
            "caching": "system_design", "message queue": "system_design",
            
            # Mobile Development
            "android": "mobile", "ios": "mobile", "react native": "mobile",
            "flutter": "mobile", "kotlin": "mobile", "swift": "mobile",
            
            # Machine Learning & AI
            "machine learning": "ml_ai", "deep learning": "ml_ai", "neural networks": "ml_ai",
            "computer vision": "ml_ai", "nlp": "ml_ai", "natural language processing": "ml_ai"
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
        if not self.questions_db or 'questions' not in self.questions_db:
            return []
        
        questions = self.questions_db.get('questions', {})
        if technology not in questions:
            return []
        
        if experience_level not in questions[technology]:
            return []
        
        tech_questions = questions[technology][experience_level]
        return tech_questions[:max_questions]
    
    def prioritize_questions(self, questions: List[Dict], job_skills: List[str], job_description: str = "", max_questions: int = 15) -> List[Dict]:
        """Enhanced question prioritization with semantic matching"""
        if not questions:
            return []
        
        # Step 1: Calculate semantic similarity if job description available
        if job_description and self.semantic_model:
            questions_with_scores = self.semantic_similarity_match(job_description, questions)
        else:
            questions_with_scores = [(q, 0.5) for q in questions]
        
        # Step 2: Calculate tag-based relevance
        for question, score in questions_with_scores:
            question_tags = set(tag.lower() for tag in question.get('tags', []))
            job_skills_lower = set(skill.lower() for skill in job_skills)
            
            # Calculate tag overlap score
            tag_overlap = len(question_tags & job_skills_lower) / max(len(job_skills_lower), 1)
            
            # Combine semantic and tag scores
            combined_score = (score * 0.6) + (tag_overlap * 0.4)
            question['relevance_score'] = combined_score
        
        # Step 3: Sort by combined relevance score
        questions_with_scores.sort(key=lambda x: x[1], reverse=True)
        prioritized = [q for q, _ in questions_with_scores]
        
        # Step 4: Ensure diversity
        diverse_questions = self.ensure_diversity(prioritized[:max_questions])
        
        return diverse_questions
    
    def generate_personalized_questions(self, candidate_skills: List[str], candidate_experience: int, 
                                      job_skills: List[str], job_description: str = "", job_title: str = "") -> Dict:
        """Generate personalized coding questions with enhanced features"""
        
        print(f"DEBUG: Generating enhanced questions for skills: {candidate_skills}")
        print(f"DEBUG: Candidate experience: {candidate_experience}")
        print(f"DEBUG: Job skills: {job_skills}")
        print(f"DEBUG: Job title: {job_title}")
        print(f"DEBUG: Job description length: {len(job_description)}")
        
        # Determine experience level
        experience_level = self.get_experience_level(candidate_experience)
        print(f"DEBUG: Experience level: {experience_level}")
        
        # Find relevant technologies
        relevant_techs = self.find_relevant_technologies(candidate_skills, job_skills)
        print(f"DEBUG: Relevant technologies before role prioritization: {relevant_techs}")
        
        # Apply role-based technology prioritization
        relevant_techs = self.prioritize_technologies_for_role(relevant_techs, job_title, job_description)
        print(f"DEBUG: Relevant technologies after role prioritization: {relevant_techs}")
        
        # Smart fallback based on job type if no relevant techs found
        if not relevant_techs:
            job_text = (job_title + " " + job_description).lower()
            
            if any(keyword in job_text for keyword in ["devops", "platform", "infrastructure", "sre", "site reliability"]):
                relevant_techs = ["devops", "cloud", "system_design", "python"]
            elif any(keyword in job_text for keyword in ["frontend", "ui", "ux", "react", "angular", "vue"]):
                relevant_techs = ["javascript", "web_development"]
            elif any(keyword in job_text for keyword in ["ml", "ai", "machine learning", "data science", "analytics"]):
                relevant_techs = ["ml_ai", "python", "sql"]
            elif any(keyword in job_text for keyword in ["mobile", "ios", "android", "react native"]):
                relevant_techs = ["mobile", "javascript", "java"]
            elif any(keyword in job_text for keyword in ["full stack", "fullstack"]):
                relevant_techs = ["javascript", "python", "java", "sql"]
            else:
                # Default fallback based on experience level
                if experience_level == "junior":
                    relevant_techs = ["python", "javascript"]
                elif experience_level == "mid":
                    relevant_techs = ["java", "python", "javascript"]
                else:
                    relevant_techs = ["java", "python", "system_design"]
            
            print(f"DEBUG: Using fallback technologies: {relevant_techs}")
        
        # Collect questions from relevant technologies with difficulty mix
        all_questions = []
        
        # For senior candidates, include a mix of difficulties
        if experience_level == "senior":
            # Get 60% senior questions, 30% mid questions, 10% junior questions
            for tech in relevant_techs:
                # Senior questions (hard)
                senior_questions = self.get_questions_for_tech(tech, "senior")
                all_questions.extend(senior_questions[:3])  # Limit to 3 per tech
                
                # Mid questions (medium)
                mid_questions = self.get_questions_for_tech(tech, "mid")
                all_questions.extend(mid_questions[:2])  # Limit to 2 per tech
                
                # Junior questions (easy) - for warm-up
                junior_questions = self.get_questions_for_tech(tech, "junior")
                all_questions.extend(junior_questions[:1])  # Limit to 1 per tech
        else:
            # For junior/mid candidates, stick to their level with some variety
            for tech in relevant_techs:
                tech_questions = self.get_questions_for_tech(tech, experience_level)
                all_questions.extend(tech_questions)
                
                # Add some questions from adjacent levels for variety
                if experience_level == "junior":
                    mid_questions = self.get_questions_for_tech(tech, "mid")
                    all_questions.extend(mid_questions[:1])
                elif experience_level == "mid":
                    senior_questions = self.get_questions_for_tech(tech, "senior")
                    all_questions.extend(senior_questions[:1])
        
        # Fallback to other experience levels if still no questions
        if not all_questions:
            for tech in relevant_techs:
                for level in ["junior", "mid", "senior"]:
                    if level != experience_level:
                        tech_questions = self.get_questions_for_tech(tech, level)
                        all_questions.extend(tech_questions)
        
        # Enhanced prioritization with semantic matching
        prioritized_questions = self.prioritize_questions(all_questions, job_skills, job_description)
        
        # Calculate metrics
        estimated_time = sum(q.get('time_limit', 15) for q in prioritized_questions)
        diversity_score = self.calculate_diversity_score(prioritized_questions)
        
        # Group questions by technology
        questions_by_tech = {}
        for question in prioritized_questions:
            tech = question.get('tags', [])[0] if question.get('tags') else 'general'
            if tech not in questions_by_tech:
                questions_by_tech[tech] = []
            questions_by_tech[tech].append(question)
        
        # Add versioning and metadata
        result = {
            'questions': prioritized_questions,
            'questions_by_technology': questions_by_tech,
            'total_questions': len(prioritized_questions),
            'technologies': relevant_techs,
            'experience_level': experience_level,
            'estimated_time': estimated_time,
            'difficulty_breakdown': self._get_difficulty_breakdown(prioritized_questions),
            'diversity_score': diversity_score,
            'metadata': {
                'algorithm_version': 'enhanced_v1.0',
                'semantic_matching': self.semantic_model is not None,
                'ai_tagging': OPENAI_AVAILABLE,
                'generated_at': datetime.now().isoformat(),
                'candidate_skills_count': len(candidate_skills),
                'job_skills_count': len(job_skills),
                'job_description_length': len(job_description)
            }
        }
        
        return result
    
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
        if not self.questions_db or 'questions' not in self.questions_db:
            return None
        
        questions = self.questions_db.get('questions', {})
        for tech in questions.values():
            for level in tech.values():
                for question in level:
                    if question.get('id') == question_id:
                        return question
        
        return None
    
    def get_questions_summary(self) -> Dict:
        """Get summary of available questions with enhanced metadata"""
        if not self.questions_db:
            return {'total_questions': 0, 'technologies': [], 'levels': []}
        
        metadata = self.questions_db.get('metadata', {})
        questions = self.questions_db.get('questions', {})
        
        total_questions = 0
        technologies = list(questions.keys())
        levels = set()
        
        for tech in questions.values():
            for level, tech_questions in tech.items():
                levels.add(level)
                total_questions += len(tech_questions)
        
        return {
            'total_questions': total_questions,
            'technologies': technologies,
            'levels': list(levels),
            'metadata': metadata,
            'semantic_matching_available': self.semantic_model is not None,
            'ai_tagging_available': OPENAI_AVAILABLE
        }

# Global instance
enhanced_coding_questions_manager = EnhancedCodingQuestionsManager()

# Additional enhanced features
class QuestionPoolVersioning:
    """Manages question pool versioning and tracking"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.version_data = self.load_version_data()
    
    def load_version_data(self) -> Dict:
        """Load version tracking data"""
        try:
            with open(self.db_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                'versions': {},
                'question_usage': {},
                'performance_metrics': {},
                'last_updated': datetime.now().isoformat()
            }
    
    def save_version_data(self):
        """Save version tracking data"""
        with open(self.db_path, 'w') as f:
            json.dump(self.version_data, f, indent=2)
    
    def track_question_usage(self, question_id: str, job_id: str, candidate_id: str):
        """Track when a question is used"""
        if question_id not in self.version_data['question_usage']:
            self.version_data['question_usage'][question_id] = {
                'used_count': 0,
                'used_in_jobs': [],
                'used_by_candidates': [],
                'first_used': datetime.now().isoformat(),
                'last_used': datetime.now().isoformat()
            }
        
        usage = self.version_data['question_usage'][question_id]
        usage['used_count'] += 1
        usage['last_used'] = datetime.now().isoformat()
        
        if job_id not in usage['used_in_jobs']:
            usage['used_in_jobs'].append(job_id)
        
        if candidate_id not in usage['used_by_candidates']:
            usage['used_by_candidates'].append(candidate_id)
        
        self.save_version_data()
    
    def track_performance(self, question_id: str, candidate_id: str, 
                         time_taken: int, accuracy: float, difficulty_rating: str):
        """Track candidate performance on questions"""
        if question_id not in self.version_data['performance_metrics']:
            self.version_data['performance_metrics'][question_id] = {
                'total_attempts': 0,
                'avg_time_taken': 0,
                'avg_accuracy': 0,
                'difficulty_ratings': [],
                'abandonment_rate': 0,
                'abandoned_count': 0
            }
        
        metrics = self.version_data['performance_metrics'][question_id]
        metrics['total_attempts'] += 1
        
        # Update average time
        total_time = metrics['avg_time_taken'] * (metrics['total_attempts'] - 1) + time_taken
        metrics['avg_time_taken'] = total_time / metrics['total_attempts']
        
        # Update average accuracy
        total_accuracy = metrics['avg_accuracy'] * (metrics['total_attempts'] - 1) + accuracy
        metrics['avg_accuracy'] = total_accuracy / metrics['total_attempts']
        
        # Track difficulty ratings
        metrics['difficulty_ratings'].append(difficulty_rating)
        
        # Track abandonment (if accuracy is 0 and time is very low)
        if accuracy == 0 and time_taken < 30:  # Less than 30 seconds
            metrics['abandoned_count'] += 1
        
        metrics['abandonment_rate'] = metrics['abandoned_count'] / metrics['total_attempts']
        
        self.save_version_data()
    
    def get_question_analytics(self, question_id: str) -> Dict:
        """Get analytics for a specific question"""
        usage = self.version_data['question_usage'].get(question_id, {})
        performance = self.version_data['performance_metrics'].get(question_id, {})
        
        return {
            'question_id': question_id,
            'usage': usage,
            'performance': performance,
            'popularity_score': usage.get('used_count', 0),
            'difficulty_score': self._calculate_difficulty_score(performance),
            'effectiveness_score': self._calculate_effectiveness_score(performance)
        }
    
    def _calculate_difficulty_score(self, performance: Dict) -> float:
        """Calculate difficulty score based on performance metrics"""
        if not performance or performance['total_attempts'] == 0:
            return 0.5
        
        # Factors: low accuracy, high abandonment, long time taken
        accuracy_factor = 1 - performance['avg_accuracy']
        abandonment_factor = performance['abandonment_rate']
        time_factor = min(performance['avg_time_taken'] / 600, 1.0)  # Normalize to 10 minutes
        
        # Weighted average
        difficulty_score = (accuracy_factor * 0.4 + abandonment_factor * 0.3 + time_factor * 0.3)
        return min(difficulty_score, 1.0)
    
    def _calculate_effectiveness_score(self, performance: Dict) -> float:
        """Calculate effectiveness score for question selection"""
        if not performance or performance['total_attempts'] == 0:
            return 0.5
        
        # Factors: moderate accuracy, low abandonment, reasonable time
        accuracy_factor = performance['avg_accuracy']
        abandonment_factor = 1 - performance['abandonment_rate']
        time_factor = 1 - min(performance['avg_time_taken'] / 600, 1.0)
        
        # Weighted average
        effectiveness_score = (accuracy_factor * 0.4 + abandonment_factor * 0.3 + time_factor * 0.3)
        return min(effectiveness_score, 1.0)


class AIGeneratedQuestions:
    """AI-powered question generation and enhancement"""
    
    def __init__(self):
        self.openai_available = OPENAI_AVAILABLE
    
    def generate_question_variations(self, base_question: str, technology: str, 
                                   difficulty: str, count: int = 3) -> List[Dict]:
        """Generate variations of a base question using AI"""
        if not self.openai_available:
            return []
        
        try:
            prompt = f"""
            Generate {count} variations of this coding question for {technology} at {difficulty} level.
            Base question: {base_question}
            
            Each variation should:
            1. Maintain the same core concept
            2. Have different context/scenario
            3. Vary in complexity within the {difficulty} range
            4. Include different edge cases
            
            Return as JSON array with objects containing: title, description, difficulty, tags, time_limit
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a coding question generator. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            # Parse response
            import ast
            variations = ast.literal_eval(response.choices[0].message.content)
            return variations
            
        except Exception as e:
            print(f"❌ AI question generation error: {e}")
            return []
    
    def enhance_question_with_context(self, question: Dict, job_context: str) -> Dict:
        """Enhance a question with job-specific context"""
        if not self.openai_available:
            return question
        
        try:
            prompt = f"""
            Enhance this coding question with context from the job description:
            
            Job Context: {job_context}
            
            Original Question: {question.get('description', '')}
            
            Make the question more relevant to the job by:
            1. Adding domain-specific context
            2. Mentioning relevant technologies
            3. Making it more realistic to the job role
            
            Return the enhanced question description.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a question enhancer. Return only the enhanced description."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.5
            )
            
            enhanced_description = response.choices[0].message.content.strip()
            question['enhanced_description'] = enhanced_description
            question['original_description'] = question.get('description', '')
            question['description'] = enhanced_description
            
            return question
            
        except Exception as e:
            print(f"❌ AI question enhancement error: {e}")
            return question


class GamificationEngine:
    """Gamification features for candidate engagement"""
    
    def __init__(self):
        self.achievements = {
            'speed_demon': {'name': 'Speed Demon', 'description': 'Complete 5 questions in under 10 minutes each'},
            'accuracy_master': {'name': 'Accuracy Master', 'description': 'Achieve 90%+ accuracy on 10 questions'},
            'diversity_explorer': {'name': 'Diversity Explorer', 'description': 'Solve questions from 5 different categories'},
            'persistence_payoff': {'name': 'Persistence Payoff', 'description': 'Complete 20 questions total'},
            'difficulty_climber': {'name': 'Difficulty Climber', 'description': 'Solve 3 hard questions successfully'}
        }
    
    def calculate_xp(self, question_difficulty: str, time_taken: int, accuracy: float, 
                    is_first_attempt: bool = True) -> int:
        """Calculate XP for completing a question"""
        base_xp = {
            'easy': 10,
            'medium': 25,
            'hard': 50
        }
        
        xp = base_xp.get(question_difficulty, 25)
        
        # Time bonus (faster = more XP)
        time_bonus = max(0, 10 - (time_taken // 60))  # Bonus for completing under 10 minutes
        xp += time_bonus
        
        # Accuracy bonus
        accuracy_bonus = int(accuracy * 20)  # Up to 20 XP for perfect accuracy
        xp += accuracy_bonus
        
        # First attempt bonus
        if is_first_attempt:
            xp += 5
        
        return xp
    
    def check_achievements(self, candidate_stats: Dict) -> List[str]:
        """Check if candidate has earned new achievements"""
        earned_achievements = []
        
        # Speed Demon
        if candidate_stats.get('fast_completions', 0) >= 5:
            earned_achievements.append('speed_demon')
        
        # Accuracy Master
        if candidate_stats.get('high_accuracy_count', 0) >= 10:
            earned_achievements.append('accuracy_master')
        
        # Diversity Explorer
        if len(candidate_stats.get('categories_solved', set())) >= 5:
            earned_achievements.append('diversity_explorer')
        
        # Persistence Payoff
        if candidate_stats.get('total_questions_solved', 0) >= 20:
            earned_achievements.append('persistence_payoff')
        
        # Difficulty Climber
        if candidate_stats.get('hard_questions_solved', 0) >= 3:
            earned_achievements.append('difficulty_climber')
        
        return earned_achievements
    
    def get_leaderboard_data(self, candidates_data: List[Dict]) -> List[Dict]:
        """Generate leaderboard data"""
        leaderboard = []
        
        for candidate in candidates_data:
            score = (
                candidate.get('total_xp', 0) * 0.4 +
                candidate.get('total_questions_solved', 0) * 10 * 0.3 +
                candidate.get('avg_accuracy', 0) * 100 * 0.3
            )
            
            leaderboard.append({
                'candidate_id': candidate.get('id'),
                'name': candidate.get('name'),
                'score': score,
                'xp': candidate.get('total_xp', 0),
                'questions_solved': candidate.get('total_questions_solved', 0),
                'avg_accuracy': candidate.get('avg_accuracy', 0),
                'achievements': candidate.get('achievements', [])
            })
        
        # Sort by score descending
        leaderboard.sort(key=lambda x: x['score'], reverse=True)
        return leaderboard


class FeedbackLoopOptimizer:
    """Optimizes question selection based on feedback data"""
    
    def __init__(self, versioning_manager: QuestionPoolVersioning):
        self.versioning_manager = versioning_manager
    
    def optimize_question_selection(self, candidate_profile: Dict, available_questions: List[Dict]) -> List[Dict]:
        """Optimize question selection based on historical performance"""
        if not available_questions:
            return available_questions
        
        # Get historical performance data
        performance_data = self._get_performance_data()
        
        # Score questions based on multiple factors
        scored_questions = []
        for question in available_questions:
            score = self._calculate_question_score(question, candidate_profile, performance_data)
            scored_questions.append((question, score))
        
        # Sort by score and return top questions
        scored_questions.sort(key=lambda x: x[1], reverse=True)
        return [q for q, _ in scored_questions]
    
    def _get_performance_data(self) -> Dict:
        """Get aggregated performance data"""
        return self.versioning_manager.version_data.get('performance_metrics', {})
    
    def _calculate_question_score(self, question: Dict, candidate_profile: Dict, 
                                performance_data: Dict) -> float:
        """Calculate optimal score for question selection"""
        question_id = question.get('id')
        performance = performance_data.get(question_id, {})
        
        # Base score from relevance
        base_score = question.get('relevance_score', 0.5)
        
        # Performance-based adjustments
        if performance:
            # Prefer questions with moderate difficulty for the candidate's level
            difficulty_score = self._calculate_optimal_difficulty(performance, candidate_profile)
            
            # Prefer questions with good effectiveness scores
            effectiveness_score = performance.get('effectiveness_score', 0.5)
            
            # Combine scores
            final_score = (
                base_score * 0.4 +
                difficulty_score * 0.3 +
                effectiveness_score * 0.3
            )
        else:
            final_score = base_score
        
        return final_score
    
    def _calculate_optimal_difficulty(self, performance: Dict, candidate_profile: Dict) -> float:
        """Calculate optimal difficulty based on candidate level and historical performance"""
        candidate_level = candidate_profile.get('experience_level', 'mid')
        avg_accuracy = performance.get('avg_accuracy', 0.5)
        
        # Target accuracy ranges by level
        target_ranges = {
            'junior': (0.3, 0.6),  # 30-60% accuracy is good for juniors
            'mid': (0.5, 0.8),     # 50-80% accuracy is good for mid-level
            'senior': (0.7, 0.9)   # 70-90% accuracy is good for seniors
        }
        
        target_min, target_max = target_ranges.get(candidate_level, (0.5, 0.8))
        
        if target_min <= avg_accuracy <= target_max:
            return 1.0  # Perfect difficulty
        elif avg_accuracy < target_min:
            return 0.3  # Too hard
        else:
            return 0.7  # Too easy but still acceptable


# Initialize enhanced components
question_versioning = QuestionPoolVersioning(os.path.join(os.path.dirname(__file__), 'data', 'question_versioning.json'))
ai_question_generator = AIGeneratedQuestions()
gamification_engine = GamificationEngine()
feedback_optimizer = FeedbackLoopOptimizer(question_versioning)

# Enhanced main function that uses all features
def generate_enhanced_personalized_questions(candidate_skills: List[str], 
                                           candidate_experience: int,
                                           job_skills: List[str], 
                                           job_description: str = "",
                                           candidate_id: str = None,
                                           job_id: str = None) -> Dict:
    """Generate personalized questions using all enhanced features"""
    
    # Extract job title from job description if available
    job_title = ""
    if job_description:
        # Try to extract job title from the first line or first few words
        lines = job_description.split('\n')
        if lines:
            first_line = lines[0].strip()
            if len(first_line) < 100:  # Likely a title if short
                job_title = first_line
            else:
                # Extract first few words as potential title
                words = first_line.split()[:5]
                job_title = " ".join(words)
    
    # Generate base questions with role-based prioritization
    base_result = enhanced_coding_questions_manager.generate_personalized_questions(
        candidate_skills, candidate_experience, job_skills, job_description, job_title
    )
    
    # Enhance questions with AI context
    enhanced_questions = []
    for question in base_result['questions']:
        enhanced_question = ai_question_generator.enhance_question_with_context(
            question, job_description
        )
        enhanced_questions.append(enhanced_question)
    
    # Optimize selection using feedback loop
    candidate_profile = {
        'experience_level': base_result['experience_level'],
        'skills': candidate_skills
    }
    
    optimized_questions = feedback_optimizer.optimize_question_selection(
        candidate_profile, enhanced_questions
    )
    
    # Add gamification elements
    gamification_data = {
        'available_achievements': list(gamification_engine.achievements.keys()),
        'xp_per_question': {
            'easy': 10,
            'medium': 25,
            'hard': 50
        },
        'total_possible_xp': sum(
            gamification_engine.calculate_xp(q.get('difficulty', 'medium'), 0, 1.0)
            for q in optimized_questions
        )
    }
    
    # Track usage if IDs provided
    if candidate_id and job_id:
        for question in optimized_questions:
            question_versioning.track_question_usage(
                question.get('id'), job_id, candidate_id
            )
    
    # Enhanced result with all features
    enhanced_result = {
        **base_result,
        'questions': optimized_questions,
        'gamification': gamification_data,
        'algorithm_features': {
            'semantic_matching': enhanced_coding_questions_manager.semantic_model is not None,
            'ai_enhancement': ai_question_generator.openai_available,
            'feedback_optimization': True,
            'gamification': True,
            'versioning': True
        },
        'metadata': {
            **base_result.get('metadata', {}),
            'enhanced_version': 'v2.0',
            'features_used': [
                'semantic_matching' if enhanced_coding_questions_manager.semantic_model else 'fallback_matching',
                'ai_enhancement' if ai_question_generator.openai_available else 'basic_questions',
                'feedback_optimization',
                'gamification',
                'versioning'
            ]
        }
    }
    
    return enhanced_result 