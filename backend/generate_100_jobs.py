import csv
import random
from datetime import datetime, timedelta

# Job titles and companies for variety
job_titles = [
    "Software Engineer", "Data Scientist", "Product Manager", "UX Designer", "DevOps Engineer",
    "Frontend Developer", "Backend Developer", "QA Engineer", "Mobile Developer", "Cybersecurity Analyst",
    "Machine Learning Engineer", "Cloud Architect", "Database Administrator", "Network Engineer", "System Administrator",
    "Business Analyst", "Project Manager", "Scrum Master", "Technical Writer", "Support Engineer",
    "Sales Engineer", "Marketing Manager", "Content Strategist", "SEO Specialist", "Digital Marketing Manager",
    "Financial Analyst", "HR Specialist", "Legal Counsel", "Operations Manager", "Customer Success Manager"
]

companies = ["BigTech"]

departments = [
    "Engineering", "Data Science", "Product Management", "Design", "Operations", "Marketing", "Sales",
    "Human Resources", "Finance", "Legal", "Customer Success", "Business Development", "Research & Development"
]

locations = [
    "San Francisco", "New York", "Seattle", "Los Angeles", "Remote", "Chicago", "Boston", "Austin", "Denver",
    "Washington DC", "Atlanta", "Miami", "Dallas", "Phoenix", "Portland", "San Diego", "Nashville", "Charlotte",
    "Minneapolis", "Salt Lake City"
]

employment_types = ["Full-time", "Part-time", "Contract", "Freelance"]

# Generate 100 job descriptions
jobs = []
for i in range(100):
    title = random.choice(job_titles)
    company = random.choice(companies)
    department = random.choice(departments)
    location = random.choice(locations)
    employment_type = random.choice(employment_types)
    
    # Generate realistic salary ranges
    base_salary = random.randint(50000, 150000)
    salary_min = base_salary
    salary_max = base_salary + random.randint(10000, 30000)
    
    # Generate description
    description = f"We are seeking a talented {title} to join our dynamic team at {company}. This role offers exciting opportunities to work on cutting-edge projects and grow your career."
    
    # Generate requirements
    requirements = f"Bachelor's degree in relevant field, {random.randint(1, 5)}+ years of experience, Strong problem-solving skills, Excellent communication abilities"
    
    # Generate benefits
    benefits = "Health insurance, 401(k) matching, Flexible work hours, Professional development"
    
    # Generate contact info
    contact_email = "hr@wipro.com"
    contact_phone = f"+1-555-{random.randint(1000, 9999)}"
    
    # Generate deadline (random date in next 6 months)
    deadline = datetime.now() + timedelta(days=random.randint(30, 180))
    application_deadline = deadline.strftime("%Y-%m-%d")
    
    jobs.append([
        title, company, department, description, requirements, location, employment_type, salary_min, salary_max,
        benefits, contact_email, contact_phone, application_deadline
    ])

# Write to CSV
with open('job_template_100.csv', 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    # Write header
    writer.writerow([
        'title', 'company', 'department', 'description', 'requirements', 'location', 'employment_type', 
        'salary_min', 'salary_max', 'benefits', 'contact_email', 'contact_phone', 'application_deadline'
    ])
    # Write jobs
    writer.writerows(jobs)

print(f"Generated {len(jobs)} job descriptions in job_template_100.csv") 