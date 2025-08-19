from rest_framework import serializers
from .models import CandidateRanking, RankingBatch, RankingCriteria
from resume_checker.models import JobDescription, Candidate

class RankingCriteriaSerializer(serializers.ModelSerializer):
    """Serializer for RankingCriteria model"""
    class Meta:
        model = RankingCriteria
        fields = '__all__'

class RankingBatchSerializer(serializers.ModelSerializer):
    """Serializer for RankingBatch model"""
    criteria = RankingCriteriaSerializer(read_only=True)
    
    class Meta:
        model = RankingBatch
        fields = '__all__'

class CandidateRankingSerializer(serializers.ModelSerializer):
    """Serializer for CandidateRanking model with enhanced AI analysis"""
    
    # Related information
    job_title = serializers.CharField(source='job_description.title', read_only=True)
    job_company = serializers.CharField(source='job_description.company', read_only=True)
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    
    # AI Analysis fields (if available)
    ai_analysis_available = serializers.SerializerMethodField()
    ai_reasoning = serializers.SerializerMethodField()
    ai_recommendations = serializers.SerializerMethodField()
    traditional_score = serializers.SerializerMethodField()
    score_blending_used = serializers.SerializerMethodField()
    
    # Enhanced skill analysis
    matched_skills_detailed = serializers.SerializerMethodField()
    related_skills = serializers.SerializerMethodField()
    missing_critical_skills = serializers.SerializerMethodField()
    missing_nice_to_have_skills = serializers.SerializerMethodField()
    
    class Meta:
        model = CandidateRanking
        fields = [
            'id', 'ranking_id', 'job_description', 'candidate', 'application',
            'job_title', 'job_company', 'candidate_name', 'candidate_email',
            'overall_score', 'skill_match_score', 'experience_match_score',
            'education_match_score', 'location_match_score',
            'rank_position', 'total_candidates',
            'matched_skills', 'missing_skills', 'skill_gap_percentage',
            'experience_years', 'required_experience_years', 'experience_gap',
            'status', 'is_shortlisted', 'is_rejected', 'hr_notes',
            # AI Analysis fields
            'ai_analysis_available', 'ai_reasoning', 'ai_recommendations',
            'traditional_score', 'score_blending_used',
            'matched_skills_detailed', 'related_skills',
            'missing_critical_skills', 'missing_nice_to_have_skills'
        ]
    
    def get_ai_analysis_available(self, obj):
        """Check if AI analysis is available for this ranking"""
        # This would be stored in the database or calculated on-the-fly
        # For now, we'll check if there's detailed AI analysis data
        return hasattr(obj, 'ai_analysis') and obj.ai_analysis is not None
    
    def get_ai_reasoning(self, obj):
        """Get AI reasoning if available"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            return obj.ai_analysis.get('detailed_reasoning', '')
        return ''
    
    def get_ai_recommendations(self, obj):
        """Get AI recommendations if available"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            return obj.ai_analysis.get('recommendations', [])
        return []
    
    def get_traditional_score(self, obj):
        """Get traditional score if available"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            return obj.ai_analysis.get('traditional_score', None)
        return None
    
    def get_score_blending_used(self, obj):
        """Check if score blending was used"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            return obj.ai_analysis.get('score_blending_used', False)
        return False
    
    def get_matched_skills_detailed(self, obj):
        """Get detailed matched skills from AI analysis"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            return obj.ai_analysis.get('skill_analysis', {}).get('matched_skills', [])
        return obj.matched_skills
    
    def get_related_skills(self, obj):
        """Get related skills from AI analysis"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            return obj.ai_analysis.get('skill_analysis', {}).get('related_skills', [])
        return []
    
    def get_missing_critical_skills(self, obj):
        """Get missing critical skills from AI analysis"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            return obj.ai_analysis.get('skill_analysis', {}).get('missing_critical_skills', [])
        return []
    
    def get_missing_nice_to_have_skills(self, obj):
        """Get missing nice-to-have skills from AI analysis"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            return obj.ai_analysis.get('skill_analysis', {}).get('missing_nice_to_have_skills', [])
        return []

class CandidateRankingDetailSerializer(CandidateRankingSerializer):
    """Detailed serializer with full AI analysis information"""
    
    # Full AI analysis data
    ai_analysis_full = serializers.SerializerMethodField()
    experience_analysis = serializers.SerializerMethodField()
    education_analysis = serializers.SerializerMethodField()
    
    class Meta(CandidateRankingSerializer.Meta):
        fields = CandidateRankingSerializer.Meta.fields + [
            'ai_analysis_full', 'experience_analysis', 'education_analysis'
        ]
    
    def get_ai_analysis_full(self, obj):
        """Get full AI analysis data"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            return obj.ai_analysis
        return None
    
    def get_experience_analysis(self, obj):
        """Get experience analysis from AI"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            return obj.ai_analysis.get('experience_match', {})
        return {}
    
    def get_education_analysis(self, obj):
        """Get education analysis from AI"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            return obj.ai_analysis.get('education_match', {})
        return {}

class JobRankingSummarySerializer(serializers.ModelSerializer):
    """Serializer for job ranking summary with AI insights"""
    
    total_candidates = serializers.SerializerMethodField()
    ai_enhanced_rankings = serializers.SerializerMethodField()
    average_ai_score = serializers.SerializerMethodField()
    average_traditional_score = serializers.SerializerMethodField()
    
    class Meta:
        model = JobDescription
        fields = [
            'id', 'job_id', 'title', 'company', 'department', 'location',
            'total_candidates', 'ai_enhanced_rankings', 'average_ai_score',
            'average_traditional_score'
        ]
    
    def get_total_candidates(self, obj):
        """Get total number of candidates for this job"""
        return obj.candidate_rankings.count()
    
    def get_ai_enhanced_rankings(self, obj):
        """Get count of AI-enhanced rankings"""
        return obj.candidate_rankings.filter(
            skill_match_score__gt=0  # Assuming AI-enhanced rankings have higher scores
        ).count()
    
    def get_average_ai_score(self, obj):
        """Get average AI-enhanced score"""
        rankings = obj.candidate_rankings.all()
        if rankings:
            return sum(r.overall_score for r in rankings) / len(rankings)
        return 0
    
    def get_average_traditional_score(self, obj):
        """Get average traditional score"""
        # This would need to be calculated from stored traditional scores
        return 0
