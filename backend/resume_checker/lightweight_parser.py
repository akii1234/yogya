"""
Lightweight Resume Parser Module
================================

A fast, efficient, and intelligent resume parser that extracts structured data
without heavy ML models. Designed specifically for the Yogya hiring platform.

Features:
- Fast processing (0.5-3 seconds)
- Low memory usage (<100MB)
- High accuracy for common resume formats
- Structured data extraction
"""

import re
import json
from typing import Dict, List, Optional, Any
import logging
# Import file processing functions from nlp_utils
# Note: This import is removed to avoid circular import
# File processing will be handled in nlp_utils

logger = logging.getLogger(__name__)


class LightweightResumeParser:
    """
    Fast and efficient resume parser using optimized patterns and templates.
    """
    
    def __init__(self):
        # Compile regex patterns for better performance
        self._compile_patterns()
        
        # Resume section headers - IMPROVED
        self.section_headers = {
            'contact': ['contact', 'personal', 'profile'],
            'experience': ['experience', 'work history', 'employment', 'career'],
            'education': ['education', 'academic', 'qualifications'],
            'skills': ['skills', 'technical skills', 'competencies', 'expertise', 'technologies', 'development tools', 'tools & scripting languages', 'web technologies'],
            'summary': ['summary', 'objective', 'profile', 'about', 'professional summary'],
            'projects': ['projects', 'portfolio', 'achievements'],
            'certifications': ['certifications', 'certificates', 'accreditations'],
            'languages': ['languages', 'language skills']
        }
    
    def _compile_patterns(self):
        """Compile regex patterns for better performance"""
        
        # Email pattern
        self.email_pattern = re.compile(
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        )
        
        # Phone patterns (international and local) - IMPROVED
        self.phone_patterns = [
            re.compile(r'Phone:\s*([+\d\s\-\(\)\.]+)', re.IGNORECASE),  # Phone: prefix (FIRST)
            re.compile(r'Tel[ephone]*:\s*([+\d\s\-\(\)\.]+)', re.IGNORECASE),  # Tel: prefix (SECOND)
            re.compile(r'\+?[0-9]{1,4}[\s.-]?[0-9]{3,4}[\s.-]?[0-9]{3,4}[\s.-]?[0-9]{3,4}'),  # International with separators
            re.compile(r'\+?1?\s*\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}'),  # US/Canada
            re.compile(r'\+?[0-9]{1,4}[\s.-]?[0-9]{5,15}'),  # International (fixed range)
            re.compile(r'[0-9]{10,15}'),  # Simple numeric
        ]
        
        # Date patterns
        self.date_patterns = [
            re.compile(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}'),
            re.compile(r'\d{1,2}/\d{1,2}/\d{4}'),
            re.compile(r'\d{4}-\d{1,2}'),
            re.compile(r'\d{4}\s*-\s*\d{4}'),  # Year ranges
            re.compile(r'\d{4}\s*-\s*Present'),
            re.compile(r'\d{4}\s*-\s*Current')
        ]
        
        # Experience patterns - IMPROVED
        self.experience_patterns = [
            re.compile(r'(\d+)\+?\s*years?\s*experience', re.IGNORECASE),
            re.compile(r'experience\s*of\s*(\d+)\+?\s*years?', re.IGNORECASE),
            re.compile(r'(\d+)\+?\s*years?\s*in', re.IGNORECASE),
            re.compile(r'(\d+)\+?\s*years?\s*working', re.IGNORECASE),
            re.compile(r'minimum\s*(\d+)\+?\s*years?', re.IGNORECASE),
            re.compile(r'at\s*least\s*(\d+)\+?\s*years?', re.IGNORECASE),
            re.compile(r'(\d+)\+?\s*years?', re.IGNORECASE),  # Simple years pattern
            re.compile(r'(\d+)\+?\s*years?\s*of', re.IGNORECASE),  # years of
            re.compile(r'(\d+)\+?\s*years?\s*expertise', re.IGNORECASE),  # years expertise
            re.compile(r'(\d+)\+?\s*years?\s*in\s*the\s*field', re.IGNORECASE),  # years in the field
        ]
        
        # Job title patterns
        self.job_title_patterns = [
            re.compile(r'(Senior|Junior|Lead|Principal|Staff|Associate)?\s*(Software|Full.?Stack|Front.?end|Back.?end|DevOps|Data|ML|AI|Mobile|Web|UI/UX|QA|Test|System|Network|Security|Cloud|Database|Business|Product|Project|Scrum|Agile|Technical|Solution|Enterprise|Application|Platform|Infrastructure|Site|Site Reliability|Release|Build|Automation|Performance|Quality|Compliance|Governance|Architecture|Design|Development|Engineering|Programmer|Coder|Developer|Engineer|Analyst|Consultant|Manager|Director|Head|VP|CTO|CEO|Founder|Co.?founder|Owner|Freelancer|Contractor|Consultant|Specialist|Expert|Guru|Ninja|Rockstar|Wizard|Hacker|Coder|Programmer)\s*(Developer|Engineer|Architect|Analyst|Consultant|Manager|Director|Lead|Specialist|Expert|Guru|Ninja|Rockstar|Wizard|Hacker|Coder|Programmer)?', re.IGNORECASE)
        ]
        
        # Company patterns
        self.company_patterns = [
            re.compile(r'at\s+([A-Z][A-Za-z0-9\s&.,]+?)(?:\s*[-–—]\s*|$)'),
            re.compile(r'([A-Z][A-Za-z0-9\s&.,]+?)\s*[-–—]\s*[A-Z]'),
            re.compile(r'([A-Z][A-Za-z0-9\s&.,]+?)\s*Inc\.?'),
            re.compile(r'([A-Z][A-Za-z0-9\s&.,]+?)\s*Corp\.?'),
            re.compile(r'([A-Z][A-Za-z0-9\s&.,]+?)\s*LLC'),
            re.compile(r'([A-Z][A-Za-z0-9\s&.,]+?)\s*Ltd\.?')
        ]
    
    def parse_resume(self, text: str) -> Dict[str, Any]:
        """
        Main parsing function that extracts structured data from resume text.
        
        Args:
            text: Raw resume text
            
        Returns:
            Dictionary with structured resume data
        """
        try:
            # Clean and normalize text
            cleaned_text = self._clean_text(text)
            
            # Extract sections
            sections = self._extract_sections(cleaned_text)
            
            # Parse each section
            parsed_data = {
                'contact': self._parse_contact(cleaned_text),  # Use full text for contact extraction
                'experience': self._parse_experience(sections.get('experience', '')),
                'education': self._parse_education(sections.get('education', '')),
                'skills': self._parse_skills(sections.get('skills', '')),
                'summary': self._parse_summary(sections.get('summary', '')),
                'projects': self._parse_projects(sections.get('projects', '')),
                'certifications': self._parse_certifications(sections.get('certifications', '')),
                'languages': self._parse_languages(sections.get('languages', '')),
                'total_experience_years': self._calculate_total_experience(cleaned_text),  # Use full text for experience calculation
                'extracted_text': cleaned_text
            }
            
            # Validate and clean data
            parsed_data = self._validate_and_clean(parsed_data)
            
            return parsed_data
            
        except Exception as e:
            logger.error(f"Error parsing resume: {e}")
            return {
                'error': f'Failed to parse resume: {str(e)}',
                'extracted_text': text
            }
        
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Normalize line breaks first
        text = re.sub(r'\r\n', '\n', text)
        text = re.sub(r'\r', '\n', text)
        
        # Remove extra whitespace but preserve line breaks
        lines = text.split('\n')
        cleaned_lines = []
        for line in lines:
            # Clean each line but preserve structure
            cleaned_line = re.sub(r'\s+', ' ', line.strip())
            if cleaned_line:
                cleaned_lines.append(cleaned_line)
        
        return '\n'.join(cleaned_lines)

    def _extract_sections(self, text: str) -> Dict[str, str]:
        """Extract different sections from resume text"""
        sections = {}
        lines = text.split('\n')
        
        current_section = 'unknown'
        current_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line is a section header
            detected_section = self._detect_section_header(line)
            
            if detected_section != 'unknown':
                # Save previous section
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                
                # Start new section
                current_section = detected_section
                current_content = []
            else:
                # Add line to current section
                current_content.append(line)
        
        # Save last section
        if current_content:
            sections[current_section] = '\n'.join(current_content)
        
        return sections

    def _detect_section_header(self, line: str) -> str:
        """Detect if a line is a section header"""
        line_lower = line.lower()
        
        # Check for section headers
        for section, keywords in self.section_headers.items():
            for keyword in keywords:
                if keyword in line_lower and len(line.split()) <= 3:
                    return section
        
        return 'unknown'
        
    def _parse_contact(self, text: str) -> Dict[str, str]:
        """Parse contact information"""
        contact = {}
        
        # Extract email
        email_match = self.email_pattern.search(text)
        if email_match:
            contact['email'] = email_match.group()
        
        # Extract phone - IMPROVED
        for pattern in self.phone_patterns:
            phone_match = pattern.search(text)
            if phone_match:
                # Handle patterns with groups (like Phone: prefix)
                if phone_match.groups():
                    contact['phone'] = phone_match.group(1).strip()
                else:
                    contact['phone'] = phone_match.group().strip()
                break
        
        # Extract name (first line that looks like a name)
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if self._looks_like_name(line):
                contact['name'] = line
                break
        
        # Extract location - USING SPA CY NER
        try:
            from .nlp_utils import extract_location_with_spacy
            location = extract_location_with_spacy(text)
            if location:
                contact['location'] = location
        except ImportError:
            # Fallback to regex if spaCy is not available
            location_patterns = [
                r'Location:\s*([A-Z][a-z]+,\s*[A-Z][a-z]+)',  # Location: City, Country
                r'Location:\s*([A-Z][a-z]+,\s*[A-Z]{2})',  # Location: City, State
                r'([A-Z][a-z]+,\s*[A-Z]{2})',  # City, State
                r'([A-Z][a-z]+,\s*[A-Z][a-z]+)',  # City, Country
                r'([A-Z][a-z]+\s*[-–—]\s*[A-Z][a-z]+)',  # City - Country
            ]
            
            for pattern in location_patterns:
                location_match = re.search(pattern, text)
                if location_match:
                    contact['location'] = location_match.group(1)
                    break
        
        # Extract LinkedIn
        linkedin_pattern = re.compile(r'linkedin\.com/in/[a-zA-Z0-9-]+')
        linkedin_match = linkedin_pattern.search(text)
        if linkedin_match:
            contact['linkedin'] = linkedin_match.group()
        
        # Extract GitHub
        github_pattern = re.compile(r'github\.com/[a-zA-Z0-9-]+')
        github_match = github_pattern.search(text)
        if github_match:
            contact['github'] = github_match.group()
        
        return contact

    def _looks_like_name(self, text: str) -> bool:
        """Check if text looks like a person's name - IMPROVED"""
        if not text or len(text.split()) > 4:
            return False
        
        # Check for name patterns - IMPROVED to handle ALL CAPS and Title Case
        name_patterns = [
            r'^[A-Z][a-z]+\s+[A-Z][a-z]+$',  # First Last (Title Case)
            r'^[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+$',  # First Middle Last (Title Case)
            r'^[A-Z][a-z]+\s+[A-Z]\.\s*[A-Z][a-z]+$',  # First M. Last (Title Case)
            r'^[A-Z]+\s+[A-Z]+$',  # FIRST LAST (ALL CAPS)
            r'^[A-Z]+\s+[A-Z]+\s+[A-Z]+$',  # FIRST MIDDLE LAST (ALL CAPS)
            r'^[A-Z][a-z]+\s+[A-Z]+$',  # First LAST (Mixed)
            r'^[A-Z]+\s+[A-Z][a-z]+$',  # FIRST Last (Mixed)
        ]
        
        for pattern in name_patterns:
            if re.match(pattern, text):
                return True
        
        return False
        
    def _parse_experience(self, text: str) -> List[Dict[str, str]]:
        """Parse work experience section"""
        experiences = []
        
        # Split by potential job entries
        job_entries = self._split_experience_entries(text)
        
        for entry in job_entries:
            if not entry.strip():
                continue
            
            experience = self._parse_single_experience(entry)
            if experience.get('title') or experience.get('company'):
                experiences.append(experience)
        
        return experiences

    def _split_experience_entries(self, text: str) -> List[str]:
        """Split experience section into individual job entries"""
        # Common patterns that indicate new job entries
        split_patterns = [
            r'\n(?=[A-Z][a-z]+\s+[-–—]\s*[A-Z])',  # Title - Company
            r'\n(?=[A-Z][a-z]+\s+at\s+[A-Z])',  # Title at Company
            r'\n(?=\d{4}\s*[-–—]\s*\d{4})',  # Date ranges
            r'\n(?=Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)',  # Month names
        ]
        
        entries = [text]
        for pattern in split_patterns:
            new_entries = []
            for entry in entries:
                split_parts = re.split(pattern, entry)
                new_entries.extend(split_parts)
            entries = new_entries
        
        return entries

    def _parse_single_experience(self, text: str) -> Dict[str, str]:
        """Parse a single work experience entry"""
        experience = {}
        
        lines = text.split('\n')
        
        # Extract job title
        for line in lines:
            for pattern in self.job_title_patterns:
                match = pattern.search(line)
                if match:
                    experience['title'] = match.group().strip()
                    break
            if experience.get('title'):
                break
        
        # Extract company name
        for line in lines:
            for pattern in self.company_patterns:
                match = pattern.search(line)
                if match:
                    experience['company'] = match.group(1).strip()
                    break
            if experience.get('company'):
                break
        
        # Extract dates
        dates = self._extract_dates(text)
        if len(dates) >= 2:
            experience['start_date'] = dates[0]
            experience['end_date'] = dates[1]
        elif len(dates) == 1:
            experience['start_date'] = dates[0]
        
        # Extract location
        location_patterns = [
            r'([A-Z][a-z]+,\s*[A-Z]{2})',  # City, State
            r'([A-Z][a-z]+,\s*[A-Z][a-z]+)',  # City, Country
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, text)
            if match:
                experience['location'] = match.group(1)
                break
        
        # Extract description
        description_lines = []
        for line in lines:
            line = line.strip()
            if line and not any(pattern.search(line) for pattern in self.job_title_patterns + self.company_patterns):
                description_lines.append(line)
        
        if description_lines:
            experience['description'] = ' '.join(description_lines)
        
        return experience

    def _extract_dates(self, text: str) -> List[str]:
        """Extract dates from text"""
        dates = []
        
        for pattern in self.date_patterns:
            matches = pattern.findall(text)
            dates.extend(matches)
        
        return dates
        
    def _parse_education(self, text: str) -> List[Dict[str, str]]:
        """Parse education section"""
        educations = []
        
        # Split by potential education entries
        edu_entries = re.split(r'\n(?=[A-Z][a-z]+\s+[-–—]|Bachelor|Master|PhD|B\.|M\.|Ph\.)', text)
        
        for entry in edu_entries:
            if not entry.strip():
                continue
            
            education = self._parse_single_education(entry)
            if education.get('degree') or education.get('institution'):
                educations.append(education)
        
        return educations

    def _parse_single_education(self, text: str) -> Dict[str, str]:
        """Parse a single education entry"""
        education = {}
        
        # Extract degree
        degree_patterns = [
            r'\b(Bachelor|Master|PhD|B\.|M\.|Ph\.|Associate|Diploma|Certificate)\b',
        ]
        
        for pattern in degree_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                education['degree'] = match.group()
                break
        
        # Extract field of study
        field_patterns = [
            r'in\s+([A-Za-z\s]+?)(?:\s*[-–—]|$)',
            r'([A-Za-z\s]+?)\s*[-–—]',
        ]
        
        for pattern in field_patterns:
            match = re.search(pattern, text)
            if match:
                education['field'] = match.group(1).strip()
                break
        
        # Extract institution
        institution_patterns = [
            r'[-–—]\s*([A-Z][A-Za-z\s&.,]+?)(?:\s*[-–—]|$)',
            r'at\s+([A-Z][A-Za-z\s&.,]+?)(?:\s*[-–—]|$)',
        ]
        
        for pattern in institution_patterns:
            match = re.search(pattern, text)
            if match:
                education['institution'] = match.group(1).strip()
                break
        
        # Extract dates
        dates = self._extract_dates(text)
        if len(dates) >= 2:
            education['start_date'] = dates[0]
            education['end_date'] = dates[1]
        elif len(dates) == 1:
            education['start_date'] = dates[0]
        
        # Extract GPA
        gpa_match = re.search(r'GPA[:\s]*([0-9]\.[0-9]{1,2})', text, re.IGNORECASE)
        if gpa_match:
            education['gpa'] = gpa_match.group(1)
        
        return education
        
    def _parse_skills(self, text: str) -> List[str]:
        """Parse skills section - IMPROVED"""
        skills = []
        
        # Handle different skill formats
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Handle "Technology: Java, J2EE, Spring" format
            if ':' in line:
                parts = line.split(':', 1)
                if len(parts) == 2:
                    skill_list = parts[1].strip()
                    # Split by commas and clean
                    for skill in re.split(r'[,•\s]+', skill_list):
                        skill = skill.strip()
                        if skill and len(skill) > 1:
                            # Clean the skill
                            clean_skill = re.sub(r'[^\w\s-]', '', skill).strip()
                            if clean_skill and len(clean_skill) > 1:
                                skills.append(clean_skill)
            else:
                # Handle regular skill format
                skill_entries = re.split(r'[,•\n\r\t]', line)
                for entry in skill_entries:
                    entry = entry.strip()
                    if entry and len(entry) > 1:
                        # Clean the skill
                        skill = re.sub(r'[^\w\s-]', '', entry).strip()
                        if skill and len(skill) > 1:
                            skills.append(skill)
        
        return list(set(skills))  # Remove duplicates

    def _parse_summary(self, text: str) -> str:
        """Parse summary/objective section"""
        return text.strip()

    def _parse_projects(self, text: str) -> List[Dict[str, str]]:
        """Parse projects section"""
        projects = []
        
        # Split by project entries
        project_entries = re.split(r'\n(?=[A-Z][a-z]+\s+[-–—]|Project|Portfolio)', text)
        
        for entry in project_entries:
            if not entry.strip():
                continue
            
            project = self._parse_single_project(entry)
            if project:
                projects.append(project)
        
        return projects

    def _parse_single_project(self, text: str) -> Optional[Dict[str, str]]:
        """Parse a single project entry"""
        lines = text.split('\n')
        
        project = {}
        
        # Extract project name (first line)
        if lines:
            project['name'] = lines[0].strip()
        
        # Extract description
        description_lines = []
        for line in lines[1:]:
            line = line.strip()
            if line and not line.startswith('•'):
                description_lines.append(line)
        
        if description_lines:
            project['description'] = ' '.join(description_lines)
        
        return project if project else None

    def _parse_certifications(self, text: str) -> List[str]:
        """Parse certifications section"""
        certifications = []
        
        # Split by common delimiters
        cert_entries = re.split(r'[,•\n\r\t]', text)
        
        for entry in cert_entries:
            entry = entry.strip()
            if entry and len(entry) > 3:
                certifications.append(entry)
        
        return certifications

    def _parse_languages(self, text: str) -> List[str]:
        """Parse languages section"""
        languages = []
        
        # Split by common delimiters
        lang_entries = re.split(r'[,•\n\r\t]', text)
        
        for entry in lang_entries:
            entry = entry.strip()
            if entry and len(entry) > 1:
                languages.append(entry)
        
        return languages
        
    def _calculate_total_experience(self, experience_text: str) -> int:
        """Calculate total years of experience - IMPROVED"""
        max_years = 0
        
        # Method 1: Pattern-based extraction
        for pattern in self.experience_patterns:
            matches = pattern.findall(experience_text)
            for match in matches:
                try:
                    years = int(match)
                    max_years = max(max_years, years)
                except ValueError:
                    continue
        
        # Method 2: Date-based calculation (if pattern method fails)
        if max_years == 0:
            max_years = self._calculate_experience_from_dates(experience_text)
        
        # Method 3: Summary-based extraction (if both above fail)
        if max_years == 0:
            max_years = self._extract_experience_from_summary(experience_text)
        
        return max_years
    
    def _calculate_experience_from_dates(self, text: str) -> int:
        """Calculate experience from job dates"""
        try:
            # Extract all date patterns
            date_patterns = [
                r'(\d{4})\s*[-–—]\s*(\d{4})',  # 2020-2023
                r'(\d{4})\s*[-–—]\s*Present',  # 2020-Present
                r'(\d{4})\s*[-–—]\s*Current',  # 2020-Current
                r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s*[-–—]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})',  # Jan 2020 - Dec 2023
            ]
            
            start_years = []
            end_years = []
            
            for pattern in date_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                for match in matches:
                    if len(match) == 2:  # Year-Year format
                        try:
                            start_years.append(int(match[0]))
                            end_years.append(int(match[1]))
                        except ValueError:
                            continue
                    elif len(match) == 4:  # Month Year - Month Year format
                        try:
                            start_years.append(int(match[1]))
                            end_years.append(int(match[3]))
                        except ValueError:
                            continue
            
            # Calculate total experience
            if start_years and end_years:
                total_years = 0
                for start, end in zip(start_years, end_years):
                    if end > start:
                        total_years += (end - start)
                
                # Add current year if there's a "Present" or "Current" entry
                from datetime import datetime
                current_year = datetime.now().year
                for start in start_years:
                    if start > 0 and start <= current_year:
                        total_years = max(total_years, current_year - start)
                
                return total_years
            
        except Exception as e:
            print(f"Error in date-based calculation: {e}")
        
        return 0
    
    def _extract_experience_from_summary(self, text: str) -> int:
        """Extract experience from summary text"""
        try:
            # Look for experience mentions in summary
            summary_patterns = [
                r'(\d+)\+?\s*years?\s*experience',
                r'experience\s*of\s*(\d+)\+?\s*years?',
                r'(\d+)\+?\s*years?\s*expertise',
                r'(\d+)\+?\s*years?\s*in\s*the\s*field',
                r'(\d+)\+?\s*years?\s*working',
                r'(\d+)\+?\s*years?\s*of\s*experience',
            ]
            
            for pattern in summary_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                for match in matches:
                    try:
                        years = int(match)
                        return years
                    except ValueError:
                        continue
        
        except Exception as e:
            print(f"Error in summary-based extraction: {e}")
        
        return 0

    def _validate_and_clean(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean extracted data"""
        
        # Validate contact info
        if data.get('contact'):
            contact = data['contact']
            if contact.get('email') and not self._is_valid_email(contact['email']):
                contact['email'] = None
            if contact.get('phone') and not self._is_valid_phone(contact['phone']):
                contact['phone'] = None
        
        # Remove duplicates from skills
        if data.get('skills'):
            data['skills'] = list(set(data['skills']))
        
        return data

    def _is_valid_email(self, email: str) -> bool:
        """Validate email format"""
        return bool(self.email_pattern.match(email))

    def _is_valid_phone(self, phone: str) -> bool:
        """Validate phone format"""
        for pattern in self.phone_patterns:
            if pattern.match(phone):
                return True
        return False


# Convenience function for easy usage
def parse_resume_lightweight(text: str) -> Dict[str, Any]:
    """
    Convenience function to parse resume text using the lightweight parser.
    
    Args:
        text: Raw resume text
        
    Returns:
        Dictionary with structured resume data
    """
    parser = LightweightResumeParser()
    return parser.parse_resume(text)


def parse_resume_file(file_path: str) -> Dict[str, Any]:
    """
    Convenience function to parse resume file using the lightweight parser.
    Note: This function requires text to be extracted separately to avoid circular imports.
    
    Args:
        file_path: Path to the resume file (PDF, DOCX, TXT)
        
    Returns:
        Dictionary with structured resume data
    """
    try:
        # Note: Text extraction should be done in nlp_utils to avoid circular import
        # This function is kept for backward compatibility but requires pre-extracted text
        logger.warning("parse_resume_file requires pre-extracted text to avoid circular import")
        return {
            'error': 'parse_resume_file requires pre-extracted text. Use parse_resume_lightweight() with extracted text instead.',
            'file_path': file_path
        }
        
    except Exception as e:
        logger.error(f"Error parsing resume file {file_path}: {e}")
        return {
            'error': f'Failed to parse resume file: {str(e)}',
            'file_path': file_path
        }


# Performance testing function
def benchmark_parser(text: str, iterations: int = 100) -> Dict[str, float]:
    """
    Benchmark the parser performance.
    
    Args:
        text: Resume text to parse
        iterations: Number of iterations for benchmarking
        
    Returns:
        Dictionary with performance metrics
    """
    import time
    
    parser = LightweightResumeParser()
    
    # Warm up
    for _ in range(10):
        parser.parse_resume(text)
    
    # Benchmark
    start_time = time.time()
    for _ in range(iterations):
        parser.parse_resume(text)
    end_time = time.time()
    
    total_time = end_time - start_time
    avg_time = total_time / iterations
    
    return {
        'total_time': total_time,
        'avg_time_per_parse': avg_time,
        'parses_per_second': iterations / total_time,
        'iterations': iterations
    }


# Test function
def test_parser():
    """Test the parser with sample resume text"""
    test_resume = """
John Doe
john.doe@email.com
+1-555-123-4567
San Francisco, CA

SUMMARY
Experienced software engineer with 5+ years in full-stack development.

EXPERIENCE
Senior Software Engineer - Tech Corp
2020-2023
Led team of 5 developers, built microservices using Python and Django

Software Developer - Startup Inc
2018-2020
Developed REST APIs using Flask and PostgreSQL

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley
2014-2018

SKILLS
Python, Django, Flask, JavaScript, React, AWS, Docker, Kubernetes, PostgreSQL, MongoDB, Git, Linux, DevOps, CI/CD, REST APIs, GraphQL, Microservices
"""
    
    result = parse_resume_lightweight(test_resume)
    print("Parsed Resume Data:")
    print(json.dumps(result, indent=2))
    
    # Benchmark
    benchmark_result = benchmark_parser(test_resume, 100)
    print("\nPerformance Benchmark:")
    print(json.dumps(benchmark_result, indent=2))


if __name__ == "__main__":
    test_parser()