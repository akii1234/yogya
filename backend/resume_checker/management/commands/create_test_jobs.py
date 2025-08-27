from django.core.management.base import BaseCommand
from django.utils import timezone
from resume_checker.models import JobDescription
import random
from datetime import timedelta

class Command(BaseCommand):
    help = 'Create 100 realistic test jobs for application testing'

    def handle(self, *args, **options):
        # Company data
        companies = ["BigTech"]

        # Job titles by category
        job_titles = {
            'frontend': [
                "Frontend Developer", "React Developer", "Vue.js Developer", "Angular Developer",
                "UI/UX Developer", "Frontend Engineer", "JavaScript Developer", "TypeScript Developer"
            ],
            'backend': [
                "Backend Developer", "Python Developer", "Java Developer", "Node.js Developer",
                "C# Developer", "PHP Developer", "Backend Engineer", "API Developer"
            ],
            'fullstack': [
                "Full Stack Developer", "Full Stack Engineer", "Web Developer", "Software Developer",
                "Application Developer", "Full Stack Architect"
            ],
            'data': [
                "Data Scientist", "Data Engineer", "Machine Learning Engineer", "Data Analyst",
                "ML Engineer", "AI Engineer", "Data Architect", "Business Intelligence Developer"
            ],
            'devops': [
                "DevOps Engineer", "Site Reliability Engineer", "Infrastructure Engineer",
                "Cloud Engineer", "Platform Engineer", "Systems Engineer"
            ],
            'mobile': [
                "Mobile Developer", "iOS Developer", "Android Developer", "React Native Developer",
                "Flutter Developer", "Mobile Engineer"
            ],
            'qa': [
                "QA Engineer", "Test Engineer", "Quality Assurance Engineer", "Automation Tester",
                "SDET", "Test Lead"
            ],
            'security': [
                "Security Engineer", "Cybersecurity Engineer", "Application Security Engineer",
                "Security Analyst", "Penetration Tester"
            ],
            'product': [
                "Product Manager", "Product Owner", "Technical Product Manager", "Product Analyst",
                "Product Lead", "Senior Product Manager"
            ]
        }

        # Skills by category
        skills_data = {
            'frontend': [
                "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "HTML5", "CSS3", "Sass",
                "Webpack", "Redux", "Next.js", "Tailwind CSS", "Bootstrap", "GraphQL"
            ],
            'backend': [
                "Python", "Java", "Node.js", "C#", "PHP", "Django", "Flask", "Spring Boot",
                "Express.js", ".NET", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker"
            ],
            'fullstack': [
                "JavaScript", "Python", "React", "Node.js", "Django", "PostgreSQL", "MongoDB",
                "Docker", "AWS", "Git", "REST APIs", "TypeScript", "Express.js"
            ],
            'data': [
                "Python", "R", "SQL", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch",
                "Spark", "Jupyter", "Tableau", "Machine Learning", "Deep Learning", "Statistics"
            ],
            'devops': [
                "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "Ansible", "Jenkins",
                "Linux", "Bash", "Python", "Prometheus", "Grafana", "ELK Stack"
            ],
            'mobile': [
                "Swift", "Kotlin", "React Native", "Flutter", "Dart", "Xcode", "Android Studio",
                "Firebase", "Mobile UI/UX", "iOS", "Android"
            ],
            'qa': [
                "Selenium", "Cypress", "Jest", "JUnit", "TestNG", "Postman", "JMeter", "Appium",
                "Cucumber", "BDD", "TDD", "API Testing"
            ],
            'security': [
                "OWASP", "Penetration Testing", "Vulnerability Assessment", "Cryptography",
                "Network Security", "Application Security", "Incident Response", "SIEM"
            ],
            'product': [
                "Product Strategy", "User Research", "A/B Testing", "Data Analysis", "Agile",
                "Scrum", "JIRA", "Confluence", "Figma", "Product Roadmapping"
            ]
        }

        # Locations
        locations = [
            "Pune, India", "Hyderabad, India", "Bangalore, India", 
            "London, UK", "Manchester, UK", "Birmingham, UK", "Edinburgh, UK",
            "Remote", "Hybrid - Pune", "Hybrid - Hyderabad", "Hybrid - Bangalore",
            "Hybrid - London", "Hybrid - Manchester"
        ]

        # Experience levels
        experience_levels = ["entry", "junior", "mid", "senior", "lead"]

        # Job types
        job_types = ["full_time", "part_time", "contract", "internship"]



        # Benefits
        benefits = [
            "Health Insurance", "Dental Insurance", "Vision Insurance", "401(k) Matching",
            "Stock Options", "Remote Work", "Flexible Hours", "Unlimited PTO",
            "Professional Development", "Gym Membership", "Free Lunch", "Transportation Allowance"
        ]

        # Departments
        departments = [
            "Engineering", "Product Development", "Data Science", "DevOps", "Mobile Development",
            "Quality Assurance", "Security", "Product Management", "Research & Development",
            "Digital Products", "Innovation", "Technology", "Software Development"
        ]

        jobs_created = 0
        
        for i in range(100):
            # Select random category
            category = random.choice(list(job_titles.keys()))
            
            # Select random company
            company = random.choice(companies)
            
            # Select random job title from category
            title = random.choice(job_titles[category])
            
            # Select random location
            location = random.choice(locations)
            
            # Select random department
            department = random.choice(departments)
            
            # Select random experience level
            experience_level = random.choice(experience_levels)
            
            # Select random job type
            job_type = random.choice(job_types)
            
            # Select random benefits (2-5 benefits)
            selected_benefits = random.sample(benefits, random.randint(2, 5))
            
            # Select random skills from category (3-8 skills)
            available_skills = skills_data[category]
            selected_skills = random.sample(available_skills, min(random.randint(3, 8), len(available_skills)))
            
            # Generate job description
            description = f"We are looking for a talented {title} to join our growing team at {company}. You will be responsible for developing innovative solutions using {', '.join(selected_skills[:3])}. The ideal candidate will have experience with modern development practices and a passion for creating high-quality software that impacts millions of users."
            
            # Generate requirements
            requirements = f"• Strong proficiency in {', '.join(selected_skills[:3])}\n• Experience with modern development practices and methodologies\n• Strong problem-solving and analytical skills\n• Excellent communication and collaboration abilities\n• Bachelor's degree in Computer Science or related field"
            
            # Set minimum experience years based on level
            if experience_level == "senior":
                min_experience_years = random.randint(5, 8)
                requirements += f"\n• {min_experience_years}+ years of experience in {category} development\n• Experience leading technical teams and mentoring junior developers\n• Strong architectural and design skills\n• Experience with agile development methodologies"
            elif experience_level == "lead":
                min_experience_years = random.randint(7, 10)
                requirements += f"\n• {min_experience_years}+ years of experience in {category} development\n• Experience leading technical teams and mentoring junior developers\n• Strong architectural and design skills\n• Experience with agile development methodologies"
            elif experience_level == "mid":
                min_experience_years = random.randint(2, 5)
                requirements += f"\n• {min_experience_years}+ years of experience in {category} development\n• Experience working in collaborative team environments\n• Strong problem-solving and analytical skills\n• Knowledge of software development best practices"
            elif experience_level == "junior":
                min_experience_years = random.randint(1, 3)
                requirements += f"\n• {min_experience_years}+ years of experience in {category} development\n• Strong academic background in Computer Science or related field\n• Passion for learning and growth\n• Experience with personal projects or open source contributions"
            else:  # entry
                min_experience_years = 0
                requirements += f"\n• {random.randint(0, 1)}+ years of experience in {category} development (or relevant coursework)\n• Strong academic background in Computer Science or related field\n• Passion for learning and growth\n• Experience with personal projects or open source contributions"
            
            # Generate random dates
            created_date = timezone.now() - timedelta(days=random.randint(0, 30))
            deadline_date = created_date + timedelta(days=random.randint(7, 60))
            
            # Create job description
            job = JobDescription.objects.create(
                title=title,
                company=company,
                department=department,
                location=location,
                description=description,
                requirements=requirements,
                experience_level=experience_level,
                min_experience_years=min_experience_years,
                employment_type=job_type,
                status='active',
                posted_date=created_date,
                extracted_skills=selected_skills
            )
            
            jobs_created += 1
            
            if jobs_created % 10 == 0:
                self.stdout.write(f"✅ Created {jobs_created} jobs...")
        
        self.stdout.write(
            self.style.SUCCESS(f'🎉 Successfully created {jobs_created} test jobs!')
        )
        
        # Show distribution by category
        self.stdout.write(f'📊 Job Distribution by Category:')
        for category in job_titles.keys():
            count = JobDescription.objects.filter(title__in=job_titles[category]).count()
            self.stdout.write(f'   • {category.title()}: {count} jobs')
        
        # Show distribution by experience level
        self.stdout.write(f'📈 Experience Level Distribution:')
        for level in experience_levels:
            count = JobDescription.objects.filter(experience_level=level).count()
            self.stdout.write(f'   • {level}: {count} jobs')
        
        # Show distribution by location
        self.stdout.write(f'🌍 Top Locations:')
        location_counts = {}
        for job in JobDescription.objects.all():
            location_counts[job.location] = location_counts.get(job.location, 0) + 1
        
        for location, count in sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            self.stdout.write(f'   • {location}: {count} jobs')
        
        # Show distribution by employment type
        self.stdout.write(f'💼 Employment Type Distribution:')
        employment_counts = {}
        for job in JobDescription.objects.all():
            employment_counts[job.employment_type] = employment_counts.get(job.employment_type, 0) + 1
        
        for employment_type, count in sorted(employment_counts.items(), key=lambda x: x[1], reverse=True):
            self.stdout.write(f'   • {employment_type}: {count} jobs')
        
        self.stdout.write(f'🎯 Total Jobs Available: {JobDescription.objects.filter(status="active").count()}')
