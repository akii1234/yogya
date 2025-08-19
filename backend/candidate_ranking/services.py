from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from typing import List, Dict, Tuple, Optional
import logging

from .models import CandidateRanking, RankingBatch, RankingCriteria
from resume_checker.models import JobDescription, Candidate, Application

logger = logging.getLogger(__name__)


class CandidateRankingService:
    """
    Service class for candidate ranking operations.
    Implements a simple skill-based matching algorithm.
    """
    
    def __init__(self, criteria: Optional[RankingCriteria] = None):
        """
        Initialize the ranking service with optional custom criteria.
        If no criteria provided, uses the default criteria.
        """
        self.criteria = criteria or self._get_default_criteria()
    
    def _get_default_criteria(self) -> RankingCriteria:
        """Get the default ranking criteria"""
        try:
            return RankingCriteria.objects.get(is_default=True, is_active=True)
        except RankingCriteria.DoesNotExist:
            # Create default criteria if none exists
            return RankingCriteria.objects.create(
                name="Default Criteria",
                description="Default ranking criteria for all jobs",
                skill_weight=40,
                experience_weight=30,
                education_weight=20,
                location_weight=10,
                is_default=True
            )
    
    def rank_candidates_for_job(
        self, 
        job_description: JobDescription, 
        candidates: List[Candidate],
        created_by=None
    ) -> RankingBatch:
        """
        Rank candidates for a specific job.
        
        Args:
            job_description: The job to rank candidates for
            candidates: List of candidates to rank
            created_by: User who initiated the ranking
            
        Returns:
            RankingBatch: The batch containing all ranking results
        """
        logger.info(f"Starting ranking for job {job_description.job_id} with {len(candidates)} candidates")
        
        # Create ranking batch
        batch = RankingBatch.objects.create(
            job_description=job_description,
            total_candidates=len(candidates),
            created_by=created_by,
            status='processing'
        )
        
        try:
            # Clear existing rankings for this job
            CandidateRanking.objects.filter(job_description=job_description).delete()
            
            # Calculate scores for all candidates
            ranking_results = []
            for candidate in candidates:
                try:
                    score_data = self._calculate_candidate_score(job_description, candidate)
                    ranking_results.append((candidate, score_data))
                    batch.ranked_candidates += 1
                except Exception as e:
                    logger.error(f"Failed to rank candidate {candidate.candidate_id}: {str(e)}")
                    batch.failed_rankings += 1
            
            # Sort by overall score (descending)
            ranking_results.sort(key=lambda x: x[1]['overall_score'], reverse=True)
            
            # Create ranking records
            with transaction.atomic():
                for rank_position, (candidate, score_data) in enumerate(ranking_results, 1):
                    # Get or create application
                    application = None
                    try:
                        application = Application.objects.get(
                            job_description=job_description,
                            candidate=candidate
                        )
                    except Application.DoesNotExist:
                        pass
                    
                    # Create ranking record
                    CandidateRanking.objects.create(
                        job_description=job_description,
                        candidate=candidate,
                        application=application,
                        overall_score=score_data['overall_score'],
                        skill_match_score=score_data['skill_match_score'],
                        experience_match_score=score_data['experience_match_score'],
                        education_match_score=score_data['education_match_score'],
                        location_match_score=score_data['location_match_score'],
                        rank_position=rank_position,
                        total_candidates=len(candidates),
                        matched_skills=score_data['matched_skills'],
                        missing_skills=score_data['missing_skills'],
                        skill_gap_percentage=score_data['skill_gap_percentage'],
                        experience_years=candidate.total_experience_years,
                        required_experience_years=job_description.min_experience_years,
                        experience_gap=candidate.total_experience_years - job_description.min_experience_years,
                        last_ranked_at=timezone.now()
                    )
            
            # Update batch status
            batch.status = 'completed'
            batch.completed_at = timezone.now()
            batch.processing_time_seconds = int((batch.completed_at - batch.started_at).total_seconds())
            batch.save()
            
            logger.info(f"Completed ranking for job {job_description.job_id}. "
                       f"Ranked: {batch.ranked_candidates}, Failed: {batch.failed_rankings}")
            
            return batch
            
        except Exception as e:
            logger.error(f"Failed to complete ranking batch {batch.batch_id}: {str(e)}")
            batch.status = 'failed'
            batch.error_message = str(e)
            batch.completed_at = timezone.now()
            batch.save()
            raise
    
    def _calculate_candidate_score(self, job: JobDescription, candidate: Candidate) -> Dict:
        """
        Calculate comprehensive score for a candidate against a job.
        
        Args:
            job: Job description
            candidate: Candidate to score
            
        Returns:
            Dict containing all score components and analysis
        """
        # Calculate individual scores
        skill_score = self._calculate_skill_score(job, candidate)
        experience_score = self._calculate_experience_score(job, candidate)
        education_score = self._calculate_education_score(job, candidate)
        location_score = self._calculate_location_score(job, candidate)
        
        # Calculate weighted overall score
        overall_score = (
            (skill_score['score'] * float(self.criteria.skill_weight) / 100) +
            (experience_score * float(self.criteria.experience_weight) / 100) +
            (education_score * float(self.criteria.education_weight) / 100) +
            (location_score * float(self.criteria.location_weight) / 100)
        )
        
        return {
            'overall_score': round(overall_score, 2),
            'skill_match_score': skill_score['score'],
            'experience_match_score': experience_score,
            'education_match_score': education_score,
            'location_match_score': location_score,
            'matched_skills': skill_score['matched_skills'],
            'missing_skills': skill_score['missing_skills'],
            'skill_gap_percentage': skill_score['gap_percentage']
        }
    
    def _calculate_skill_score(self, job: JobDescription, candidate: Candidate) -> Dict:
        """
        Calculate skill matching score using traditional logic.
        
        Args:
            job: Job description
            candidate: Candidate to evaluate
            
        Returns:
            Dict with score and skill analysis
        """
        # Get job skills (from extracted_skills or parse description)
        job_skills = set()
        if job.extracted_skills:
            if isinstance(job.extracted_skills, list):
                job_skills = set(skill.lower().strip() for skill in job.extracted_skills)
            else:
                # Handle case where extracted_skills might be a string or other format
                job_skills = self._extract_skills_from_text(job.description)
        else:
            # Simple skill extraction from description
            job_skills = self._extract_skills_from_text(job.description)
        
        # Get candidate skills
        candidate_skills = set()
        if candidate.skills:
            candidate_skills = set(skill.lower().strip() for skill in candidate.skills)
        
        # Calculate matches
        matched_skills = job_skills.intersection(candidate_skills)
        missing_skills = job_skills - candidate_skills
        
        # Calculate score
        if not job_skills:
            score = 50  # Neutral score if no skills specified
        else:
            match_ratio = len(matched_skills) / len(job_skills)
            score = min(100, match_ratio * 100)
        
        # Calculate gap percentage
        gap_percentage = 0
        if job_skills:
            gap_percentage = (len(missing_skills) / len(job_skills)) * 100
        
        return {
            'score': round(score, 2),
            'matched_skills': list(matched_skills),
            'missing_skills': list(missing_skills),
            'gap_percentage': round(gap_percentage, 2)
        }
    

    

    
    def _calculate_experience_score(self, job: JobDescription, candidate: Candidate) -> float:
        """
        Calculate experience matching score.
        
        Args:
            job: Job description
            candidate: Candidate to evaluate
            
        Returns:
            Experience score (0-100)
        """
        required_years = job.min_experience_years
        candidate_years = candidate.total_experience_years
        
        if required_years == 0:
            return 100  # Perfect score for entry-level positions
        
        # Calculate experience ratio
        if candidate_years >= required_years:
            # Bonus for having more experience, but cap at 120%
            ratio = min(1.2, candidate_years / required_years)
            score = min(100, ratio * 100)
        else:
            # Penalty for insufficient experience
            ratio = candidate_years / required_years
            score = max(0, ratio * 80)  # Max 80% for underqualified candidates
        
        return round(score, 2)
    
    def _calculate_education_score(self, job: JobDescription, candidate: Candidate) -> float:
        """
        Calculate education matching score.
        
        Args:
            job: Job description
            candidate: Candidate to evaluate
            
        Returns:
            Education score (0-100)
        """
        # Education level mapping
        education_levels = {
            'high_school': 1,
            'associate': 2,
            'bachelor': 3,
            'master': 4,
            'phd': 5
        }
        
        # Default to bachelor's degree for most professional jobs
        required_level = 3  # bachelor's degree
        candidate_level = education_levels.get(candidate.highest_education, 0)
        
        if candidate_level >= required_level:
            # Bonus for higher education
            score = min(100, (candidate_level / required_level) * 90)
        else:
            # Penalty for lower education
            score = max(0, (candidate_level / required_level) * 70)
        
        return round(score, 2)
    
    def _calculate_location_score(self, job: JobDescription, candidate: Candidate) -> float:
        """
        Calculate location compatibility score.
        
        Args:
            job: Job description
            candidate: Candidate to evaluate
            
        Returns:
            Location score (0-100)
        """
        # Simple location matching - can be enhanced with geocoding
        if not job.location or not candidate.city:
            return 50  # Neutral score if location info missing
        
        job_location = job.location.lower().strip()
        candidate_location = candidate.city.lower().strip()
        
        # Exact match
        if job_location == candidate_location:
            return 100
        
        # Partial match (same state/country)
        if candidate.state and job_location in candidate.state.lower():
            return 80
        
        # Remote work consideration
        if 'remote' in job_location or 'work from home' in job_location:
            return 90
        
        # Different locations
        return 30
    
    def _extract_skills_from_text(self, text: str) -> set:
        """
        Simple skill extraction from text.
        This is a basic implementation - can be enhanced with NLP.
        
        Args:
            text: Text to extract skills from
            
        Returns:
            Set of extracted skills
        """
        # Common technical skills
        common_skills = {
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
            'sql', 'mysql', 'postgresql', 'mongodb', 'aws', 'azure', 'docker',
            'kubernetes', 'git', 'agile', 'scrum', 'machine learning', 'ai',
            'data science', 'html', 'css', 'php', 'c++', 'c#', '.net', 'spring',
            'django', 'flask', 'express', 'typescript', 'redux', 'vuex'
        }
        
        text_lower = text.lower()
        found_skills = set()
        
        for skill in common_skills:
            if skill in text_lower:
                found_skills.add(skill)
        
        return found_skills
    
    def get_top_candidates(self, job_description: JobDescription, limit: int = 10) -> List[CandidateRanking]:
        """
        Get top ranked candidates for a job.
        
        Args:
            job_description: Job to get candidates for
            limit: Maximum number of candidates to return
            
        Returns:
            List of top candidate rankings
        """
        return CandidateRanking.objects.filter(
            job_description=job_description,
            status='active'
        ).order_by('rank_position')[:limit]
    
    def get_candidate_rankings(self, candidate: Candidate) -> List[CandidateRanking]:
        """
        Get all rankings for a specific candidate.
        
        Args:
            candidate: Candidate to get rankings for
            
        Returns:
            List of candidate rankings
        """
        return CandidateRanking.objects.filter(
            candidate=candidate,
            status='active'
        ).order_by('-overall_score')
    
    def update_ranking_status(
        self, 
        ranking: CandidateRanking, 
        is_shortlisted: bool = None, 
        is_rejected: bool = None,
        hr_notes: str = None
    ) -> CandidateRanking:
        """
        Update HR actions on a ranking.
        
        Args:
            ranking: Ranking to update
            is_shortlisted: Whether candidate is shortlisted
            is_rejected: Whether candidate is rejected
            hr_notes: HR notes
            
        Returns:
            Updated ranking
        """
        if is_shortlisted is not None:
            ranking.is_shortlisted = is_shortlisted
        if is_rejected is not None:
            ranking.is_rejected = is_rejected
        if hr_notes is not None:
            ranking.hr_notes = hr_notes
        
        ranking.save()
        return ranking 