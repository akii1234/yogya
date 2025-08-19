"""
Detailed Scoring Analysis Utilities
Provides comprehensive breakdown of candidate-job matching scores
"""

def calculate_detailed_match_score(job_data, candidate_skills, candidate_experience, candidate_education, candidate_location=None):
    """
    Calculate detailed ATS match score with comprehensive breakdown.
    
    Args:
        job_data (dict): Job description data
        candidate_skills (list): Candidate's skills
        candidate_experience (int): Candidate's years of experience
        candidate_education (str): Candidate's education level
        candidate_location (str): Candidate's location (optional)
    
    Returns:
        dict: Detailed scoring breakdown with recommendations
    """
    
    detailed_analysis = {
        'overall_score': 0,
        'skill_analysis': {
            'score': 0,
            'weight': 40,
            'matched_skills': [],
            'missing_skills': [],
            'total_required': 0,
            'match_percentage': 0,
            'strengths': [],
            'weaknesses': [],
            'recommendations': []
        },
        'experience_analysis': {
            'score': 0,
            'weight': 30,
            'required_years': 0,
            'candidate_years': candidate_experience,
            'gap': 0,
            'status': 'unknown',
            'recommendations': []
        },
        'education_analysis': {
            'score': 0,
            'weight': 20,
            'required_level': '',
            'candidate_level': candidate_education,
            'status': 'unknown',
            'recommendations': []
        },
        'location_analysis': {
            'score': 0,
            'weight': 10,
            'job_location': '',
            'candidate_location': candidate_location,
            'status': 'unknown',
            'recommendations': []
        },
        'overall_recommendations': [],
        'improvement_areas': [],
        'strengths': []
    }
    
    try:
        # 1. SKILL ANALYSIS (40% weight)
        job_skills = job_data.get('extracted_skills', [])
        
        # Handle cases where skills are missing
        if not candidate_skills:
            detailed_analysis['skill_analysis'].update({
                'score': 0,
                'matched_skills': [],
                'missing_skills': job_skills,
                'total_required': len(job_skills),
                'match_percentage': 0,
                'strengths': [],
                'weaknesses': ['No skills data available. Please upload your resume to get skill-based matching.'],
                'recommendations': ['Upload your resume to extract skills automatically', 'Manually add your skills to your profile']
            })
            detailed_analysis['improvement_areas'].append('Skills data missing')
        elif not job_skills:
            detailed_analysis['skill_analysis'].update({
                'score': 50,  # Neutral score when job has no skills specified
                'matched_skills': candidate_skills,
                'missing_skills': [],
                'total_required': 0,
                'match_percentage': 100,
                'strengths': [f'You have {len(candidate_skills)} skills listed'],
                'weaknesses': ['Job description does not specify required skills'],
                'recommendations': ['Job requirements are not clearly specified']
            })
        else:
            # Both job and candidate have skills - perform normal analysis
            # Convert to lowercase for comparison
            job_skills_lower = [skill.lower() for skill in job_skills]
            candidate_skills_lower = [skill.lower() for skill in candidate_skills]
            
            # Find matching and missing skills
            matching_skills = set(job_skills_lower) & set(candidate_skills_lower)
            missing_skills = set(job_skills_lower) - set(candidate_skills_lower)
            
            # Calculate skill score
            skill_score = (len(matching_skills) / len(job_skills_lower)) * 100 if job_skills_lower else 0
            
            # Convert back to original case for display
            matched_skills_display = [skill for skill in candidate_skills if skill.lower() in matching_skills]
            missing_skills_display = [skill for skill in job_skills if skill.lower() in missing_skills]
            
            detailed_analysis['skill_analysis'].update({
                'score': round(skill_score, 1),
                'matched_skills': matched_skills_display,
                'missing_skills': missing_skills_display,
                'total_required': len(job_skills),
                'match_percentage': round((len(matching_skills) / len(job_skills_lower)) * 100, 1) if job_skills_lower else 0
            })
            
            # Analyze skill strengths and weaknesses (only for normal case)
            if matched_skills_display:
                detailed_analysis['skill_analysis']['strengths'] = [
                    f"You have {len(matched_skills_display)} required skills",
                    f"Strong in: {', '.join(matched_skills_display[:3])}"
                ]
                detailed_analysis['strengths'].extend([
                    f"✅ {skill}" for skill in matched_skills_display[:5]
                ])
            
            if missing_skills_display:
                detailed_analysis['skill_analysis']['weaknesses'] = [
                    f"Missing {len(missing_skills_display)} required skills",
                    f"Need to learn: {', '.join(missing_skills_display[:3])}"
                ]
                detailed_analysis['improvement_areas'].extend([
                    f"❌ {skill}" for skill in missing_skills_display[:5]
                ])
                
                # Generate skill recommendations
                if len(missing_skills_display) <= 3:
                    detailed_analysis['skill_analysis']['recommendations'].append(
                        f"Focus on learning {', '.join(missing_skills_display)} to significantly improve your match"
                    )
                else:
                    detailed_analysis['skill_analysis']['recommendations'].append(
                        f"Prioritize learning the top 3 missing skills: {', '.join(missing_skills_display[:3])}"
                    )
        
        # 2. EXPERIENCE ANALYSIS (30% weight)
        job_experience = job_data.get('min_experience_years', 0)
        detailed_analysis['experience_analysis'].update({
            'required_years': job_experience,
            'candidate_years': candidate_experience,
            'gap': candidate_experience - job_experience
        })
        
        if candidate_experience >= job_experience:
            experience_score = 100
            status = 'exceeds'
            detailed_analysis['experience_analysis']['recommendations'].append(
                f"✅ You exceed the required experience by {candidate_experience - job_experience} years"
            )
            detailed_analysis['strengths'].append(f"✅ {candidate_experience} years experience (required: {job_experience})")
        elif candidate_experience > 0:
            experience_score = min(100, (candidate_experience / job_experience) * 100)
            status = 'below'
            gap = job_experience - candidate_experience
            detailed_analysis['experience_analysis']['recommendations'].append(
                f"You need {gap} more years of experience to meet the requirement"
            )
            detailed_analysis['improvement_areas'].append(f"❌ Experience gap: {gap} years")
        else:
            experience_score = 0
            status = 'none'
            detailed_analysis['experience_analysis']['recommendations'].append(
                "No experience data available. Please update your profile with work experience."
            )
            detailed_analysis['improvement_areas'].append("❌ No experience data")
        
        detailed_analysis['experience_analysis'].update({
            'score': round(experience_score, 1),
            'status': status
        })
        
        # 3. EDUCATION ANALYSIS (20% weight)
        job_education = job_data.get('experience_level', '')
        education_score = 0
        
        if candidate_education:
            education_mapping = {
                'high_school': 25,
                'associate': 50,
                'bachelor': 75,
                'master': 90,
                'phd': 100
            }
            candidate_education_score = education_mapping.get(candidate_education.lower(), 0)
            
            # Adjust score based on job level
            if job_education == 'entry':
                education_score = min(100, candidate_education_score)
                status = 'suitable'
            elif job_education == 'junior':
                education_score = min(100, candidate_education_score * 1.1)
                status = 'suitable' if candidate_education_score >= 50 else 'below'
            elif job_education == 'mid':
                education_score = min(100, candidate_education_score * 1.2)
                status = 'suitable' if candidate_education_score >= 60 else 'below'
            elif job_education == 'senior':
                education_score = min(100, candidate_education_score * 1.3)
                status = 'suitable' if candidate_education_score >= 70 else 'below'
            elif job_education == 'lead':
                education_score = min(100, candidate_education_score * 1.4)
                status = 'suitable' if candidate_education_score >= 80 else 'below'
            else:
                education_score = candidate_education_score
                status = 'suitable'
            
            if status == 'suitable':
                detailed_analysis['education_analysis']['recommendations'].append(
                    f"✅ Your {candidate_education} degree is suitable for this position"
                )
                detailed_analysis['strengths'].append(f"✅ {candidate_education} degree")
            else:
                detailed_analysis['education_analysis']['recommendations'].append(
                    f"Consider pursuing higher education to improve your match"
                )
                detailed_analysis['improvement_areas'].append(f"❌ Education level: {candidate_education}")
        else:
            detailed_analysis['education_analysis']['recommendations'].append(
                "No education data available. Please update your profile with education details."
            )
            detailed_analysis['improvement_areas'].append("❌ No education data")
        
        detailed_analysis['education_analysis'].update({
            'score': round(education_score, 1),
            'required_level': job_education,
            'status': status
        })
        
        # 4. LOCATION ANALYSIS (10% weight)
        job_location = job_data.get('location', '')
        detailed_analysis['location_analysis'].update({
            'job_location': job_location,
            'candidate_location': candidate_location
        })
        
        # Check if job is remote
        if job_location and any(keyword in job_location.lower() for keyword in ['remote', 'work from home', 'wfh', 'virtual']):
            location_score = 100
            status = 'remote'
            detailed_analysis['location_analysis']['recommendations'].append(
                "✅ This is a remote position - location is not a constraint"
            )
            detailed_analysis['strengths'].append("✅ Remote position")
        else:
            # Basic location matching (can be enhanced with geocoding)
            location_score = 80  # Default score for non-remote jobs
            status = 'onsite'
            detailed_analysis['location_analysis']['recommendations'].append(
                "This appears to be an on-site position. Consider location compatibility."
            )
        
        detailed_analysis['location_analysis'].update({
            'score': location_score,
            'status': status
        })
        
        # 5. CALCULATE OVERALL SCORE
        skill_weight = detailed_analysis['skill_analysis']['weight'] / 100
        experience_weight = detailed_analysis['experience_analysis']['weight'] / 100
        education_weight = detailed_analysis['education_analysis']['weight'] / 100
        location_weight = detailed_analysis['location_analysis']['weight'] / 100
        
        overall_score = (
            (detailed_analysis['skill_analysis']['score'] * skill_weight) +
            (detailed_analysis['experience_analysis']['score'] * experience_weight) +
            (detailed_analysis['education_analysis']['score'] * education_weight) +
            (detailed_analysis['location_analysis']['score'] * location_weight)
        )
        
        detailed_analysis['overall_score'] = round(overall_score, 1)
        
        # 6. GENERATE OVERALL RECOMMENDATIONS
        if overall_score >= 80:
            detailed_analysis['overall_recommendations'].append("🎯 Excellent match! You're well-qualified for this position.")
        elif overall_score >= 60:
            detailed_analysis['overall_recommendations'].append("👍 Good match with some areas for improvement.")
        elif overall_score >= 40:
            detailed_analysis['overall_recommendations'].append("⚠️ Fair match. Consider focusing on key improvement areas.")
        else:
            detailed_analysis['overall_recommendations'].append("📝 Low match. This position may not be the best fit currently.")
        
        # Add specific improvement suggestions
        if detailed_analysis['improvement_areas']:
            detailed_analysis['overall_recommendations'].append(
                f"Focus on: {', '.join(detailed_analysis['improvement_areas'][:3])}"
            )
        
        # Add strength highlights
        if detailed_analysis['strengths']:
            detailed_analysis['overall_recommendations'].append(
                f"Your strengths: {', '.join(detailed_analysis['strengths'][:3])}"
            )
        
        return detailed_analysis
        
    except Exception as e:
        print(f"Error in detailed scoring: {e}")
        return {
            'overall_score': 0,
            'error': f'Scoring calculation failed: {str(e)}',
            'overall_recommendations': ['Unable to calculate detailed score. Please try again.']
        }


def get_match_level(score):
    """Get match level based on score."""
    if score is None:
        return 'unknown'
    elif score >= 80:
        return 'excellent'
    elif score >= 60:
        return 'good'
    elif score >= 40:
        return 'fair'
    else:
        return 'poor'


def generate_improvement_plan(detailed_analysis):
    """
    Generate a structured improvement plan based on detailed analysis.
    
    Args:
        detailed_analysis (dict): Detailed scoring analysis
    
    Returns:
        dict: Structured improvement plan
    """
    
    improvement_plan = {
        'priority_areas': [],
        'skill_development': [],
        'experience_growth': [],
        'education_advancement': [],
        'timeline': '3-6 months',
        'estimated_score_improvement': 0
    }
    
    # Analyze skill gaps
    missing_skills = detailed_analysis['skill_analysis'].get('missing_skills', [])
    if missing_skills:
        improvement_plan['priority_areas'].append('Skill Development')
        improvement_plan['skill_development'] = [
            f"Learn {skill}" for skill in missing_skills[:3]
        ]
        improvement_plan['estimated_score_improvement'] += 15
    
    # Analyze experience gaps
    experience_gap = detailed_analysis['experience_analysis'].get('gap', 0)
    if experience_gap > 0:
        improvement_plan['priority_areas'].append('Experience Building')
        improvement_plan['experience_growth'] = [
            f"Gain {experience_gap} more years of relevant experience",
            "Consider freelance or project work",
            "Take on more responsibilities in current role"
        ]
        improvement_plan['estimated_score_improvement'] += 10
    
    # Analyze education gaps
    education_status = detailed_analysis['education_analysis'].get('status', 'unknown')
    if education_status == 'below':
        improvement_plan['priority_areas'].append('Education Advancement')
        improvement_plan['education_advancement'] = [
            "Consider pursuing relevant certifications",
            "Look into online courses or bootcamps",
            "Explore degree programs in your field"
        ]
        improvement_plan['estimated_score_improvement'] += 8
    
    return improvement_plan 