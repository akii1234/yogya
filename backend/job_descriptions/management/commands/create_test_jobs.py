from django.core.management.base import BaseCommand
from django.utils import timezone
from resume_checker.models import JobDescription
import random
from datetime import timedelta

class Command(BaseCommand):
    help = 'Create 100 realistic test jobs for application testing'

    def handle(self, *args, **options):
        # Company data
        companies = [
            "BigTech"
        ]

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
            "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA",
            "Denver, CO", "Chicago, IL", "Los Angeles, CA", "Atlanta, GA", "Washington, DC",
            "Portland, OR", "Nashville, TN", "Miami, FL", "Phoenix, AZ", "Dallas, TX",
            "Remote", "Hybrid - San Francisco", "Hybrid - New York", "Hybrid - Seattle"
        ]

        # Experience levels
        experience_levels = ["Entry", "Junior", "Mid", "Senior", "Lead", "Principal"]

        # Job types
        job_types = ["Full-time", "Part-time", "Contract", "Internship"]

        # Salary ranges (in thousands)
        salary_ranges = [
            "40000-60000", "50000-70000", "60000-80000", "70000-90000", "80000-100000",
            "90000-110000", "100000-130000", "120000-150000", "140000-170000", "160000-190000",
            "180000-220000", "200000-250000", "250000-300000"
        ]

        # Benefits
        benefits = [
            "Health Insurance", "Dental Insurance", "Vision Insurance", "401(k) Matching",
            "Stock Options", "Remote Work", "Flexible Hours", "Unlimited PTO",
            "Professional Development", "Gym Membership", "Free Lunch", "Transportation Allowance"
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
            
            # Select random experience level
            experience_level = random.choice(experience_levels)
            
            # Select random job type
            job_type = random.choice(job_types)
            
            # Select random salary range
            salary_range = random.choice(salary_ranges)
            
            # Select random benefits (2-5 benefits)
            selected_benefits = random.sample(benefits, random.randint(2, 5))
            
            # Select random skills from category (3-8 skills)
            available_skills = skills_data[category]
            selected_skills = random.sample(available_skills, min(random.randint(3, 8), len(available_skills)))
            
            # Generate job description
            description = f"We are looking for a talented {title} to join our growing team at {company}. You will be responsible for developing innovative solutions using {', '.join(selected_skills[:3])}. The ideal candidate will have experience with modern development practices and a passion for creating high-quality software that impacts millions of users."
            
            # Generate requirements
            requirements = f"• Strong proficiency in {', '.join(selected_skills[:3])}\n• Experience with modern development practices and methodologies\n• Strong problem-solving and analytical skills\n• Excellent communication and collaboration abilities\n• Bachelor's degree in Computer Science or related field"
            
            # Add experience requirements based on level
            if experience_level in ["Senior", "Lead", "Principal"]:
                requirements += f"\n• {random.randint(3, 8)}+ years of experience in {category} development\n• Experience leading technical teams and mentoring junior developers\n• Strong architectural and design skills\n• Experience with agile development methodologies"
            elif experience_level in ["Mid"]:
                requirements += f"\n• {random.randint(2, 5)}+ years of experience in {category} development\n• Experience working in collaborative team environments\n• Strong problem-solving and analytical skills\n• Knowledge of software development best practices"
            else:
                requirements += f"\n• {random.randint(0, 2)}+ years of experience in {category} development (or relevant coursework)\n• Strong academic background in Computer Science or related field\n• Passion for learning and growth\n• Experience with personal projects or open source contributions"
            
            # Generate random dates
            created_date = timezone.now() - timedelta(days=random.randint(0, 30))
            deadline_date = created_date + timedelta(days=random.randint(7, 60))
            
            # Create job description
            job = JobDescription.objects.create(
                title=title,
                company=company,
                location=location,
                description=description,
                requirements=requirements,
                salary_range=salary_range,
                job_type=job_type,
                experience_level=experience_level,
                skills=selected_skills,
                benefits=selected_benefits,
                created_at=created_date,
                deadline=deadline_date,
                is_active=True
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
        
        # Show distribution by salary range
        self.stdout.write(f'💰 Top Salary Ranges:')
        salary_counts = {}
        for job in JobDescription.objects.all():
            salary_counts[job.salary_range] = salary_counts.get(job.salary_range, 0) + 1
        
        for salary_range, count in sorted(salary_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            self.stdout.write(f'   • {salary_range}: {count} jobs')
        
        self.stdout.write(f'🎯 Total Jobs Available: {JobDescription.objects.filter(is_active=True).count()}')
