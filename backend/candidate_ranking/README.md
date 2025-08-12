# Candidate Ranking System

## Overview

The Candidate Ranking System is a comprehensive solution for automatically ranking and evaluating candidates against job requirements. It provides intelligent matching based on skills, experience, education, and location compatibility.

## Features

### Core Functionality
- **Automated Candidate Ranking**: AI-powered scoring based on multiple criteria
- **Multi-criteria Evaluation**: Skills, experience, education, and location matching
- **Customizable Weights**: Configurable importance for different criteria
- **Batch Processing**: Process multiple candidates simultaneously
- **Real-time Analytics**: Comprehensive insights and statistics
- **Status Management**: Shortlist, reject, and track candidate status

### Technical Features
- **RESTful API**: Complete API for frontend integration
- **Database Models**: Structured data storage with relationships
- **Service Layer**: Business logic separation
- **Admin Interface**: Django admin integration
- **Authentication**: JWT-based security

## Architecture

### Models

#### CandidateRanking
- `ranking_id`: Unique identifier (RANK-XXXXXX)
- `job_description`: Foreign key to JobDescription
- `candidate`: Foreign key to Candidate
- `application`: Optional link to Application
- `overall_score`: 0-100 ranking score
- `skill_match_score`: Skills compatibility score
- `experience_match_score`: Experience level score
- `education_match_score`: Education match score
- `location_match_score`: Location compatibility score
- `matched_skills`: List of matching skills
- `missing_skills`: List of missing skills
- `skill_gap_percentage`: Percentage of missing skills
- `experience_years`: Candidate's experience
- `required_experience_years`: Job requirement
- `experience_gap`: Difference in experience
- `experience_status`: Overqualified/Well Matched/Underqualified
- `is_top_candidate`: Top performer flag
- `is_shortlisted`: Shortlist status
- `is_rejected`: Rejection status
- `hr_notes`: HR comments
- `created_at`, `updated_at`: Timestamps

#### RankingBatch
- `batch_id`: Unique identifier (BATCH-XXXXXXXX)
- `job_description`: Associated job
- `total_candidates`: Number of candidates processed
- `ranked_candidates`: Successfully ranked count
- `failed_rankings`: Failed ranking count
- `processing_time_seconds`: Processing duration
- `created_by`: User who initiated ranking
- `status`: Batch status (active/completed/failed)

#### RankingCriteria
- `name`: Criteria name
- `skill_weight`: Skills importance (0-100)
- `experience_weight`: Experience importance (0-100)
- `education_weight`: Education importance (0-100)
- `location_weight`: Location importance (0-100)
- `is_active`: Active criteria flag
- `created_at`, `updated_at`: Timestamps

### API Endpoints

#### Ranking Operations
- `POST /api/candidate-ranking/rank/` - Rank candidates for a job
- `GET /api/candidate-ranking/job/{job_id}/` - Get rankings for a job
- `GET /api/candidate-ranking/candidate/{candidate_id}/` - Get candidate rankings
- `PUT /api/candidate-ranking/ranking/{ranking_id}/status/` - Update ranking status

#### Management
- `GET /api/candidate-ranking/batches/` - Get ranking batches
- `GET /api/candidate-ranking/criteria/` - Get ranking criteria
- `GET /api/candidate-ranking/analytics/{job_id}/` - Get ranking analytics

#### Jobs & Candidates
- `GET /api/jobs/active/` - Get active jobs
- `GET /api/jobs/{job_id}/candidates/` - Get candidates for a job

### Service Layer

#### CandidateRankingService
- `rank_candidates_for_job()`: Main ranking function
- `_calculate_candidate_score()`: Score calculation logic
- `_calculate_skill_score()`: Skills matching algorithm
- `_calculate_experience_score()`: Experience evaluation
- `_calculate_education_score()`: Education matching
- `_calculate_location_score()`: Location compatibility
- `get_top_candidates()`: Retrieve top performers

## Usage

### Backend Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Migrations**
   ```bash
   python manage.py makemigrations candidate_ranking
   python manage.py migrate
   ```

3. **Create Superuser** (for admin access)
   ```bash
   python manage.py createsuperuser
   ```

4. **Start Server**
   ```bash
   python manage.py runserver 8001
   ```

### Frontend Integration

1. **Import Service**
   ```javascript
   import rankingService from '../../services/rankingService';
   ```

2. **Load Jobs**
   ```javascript
   const response = await rankingService.getActiveJobs();
   setJobs(response.jobs);
   ```

3. **Load Rankings**
   ```javascript
   const response = await rankingService.getJobRankings(jobId);
   setRankings(response.rankings);
   ```

4. **Update Status**
   ```javascript
   await rankingService.shortlistCandidate(rankingId);
   await rankingService.rejectCandidate(rankingId);
   ```

### API Examples

#### Rank Candidates
```bash
POST /api/candidate-ranking/rank/
{
  "job_id": "JOB-XXXXXX",
  "candidate_ids": ["CAN-XXXXXX", "CAN-YYYYYY"],
  "criteria_id": "optional-criteria-id"
}
```

#### Get Job Rankings
```bash
GET /api/candidate-ranking/job/JOB-XXXXXX/
```

#### Update Status
```bash
PUT /api/candidate-ranking/ranking/RANK-XXXXXX/status/
{
  "is_shortlisted": true,
  "is_rejected": false,
  "hr_notes": "Strong technical skills"
}
```

## Scoring Algorithm

### Skills Matching (40% default weight)
- **Exact Match**: 100% score
- **Partial Match**: 50-90% score
- **No Match**: 0% score
- **Gap Calculation**: Missing skills percentage

### Experience Matching (30% default weight)
- **Overqualified**: 90-100% score
- **Well Matched**: 70-90% score
- **Underqualified**: 0-70% score
- **Gap Analysis**: Years difference calculation

### Education Matching (20% default weight)
- **Exact Level**: 100% score
- **Higher Level**: 90-100% score
- **Lower Level**: 0-70% score
- **Field Relevance**: Bonus points for relevant fields

### Location Matching (10% default weight)
- **Same City**: 100% score
- **Same State**: 80% score
- **Same Country**: 60% score
- **Remote Available**: 50% score

## Configuration

### Ranking Criteria
Create custom ranking criteria through Django admin or API:

```python
criteria = RankingCriteria.objects.create(
    name="Technical Focus",
    skill_weight=50,
    experience_weight=30,
    education_weight=15,
    location_weight=5,
    is_active=True
)
```

### Default Weights
- Skills: 40%
- Experience: 30%
- Education: 20%
- Location: 10%

## Analytics

### Available Metrics
- **Score Statistics**: Average, max, min scores
- **Score Distribution**: High/medium/low match percentages
- **Candidate Status**: Top candidates, shortlisted, rejected counts
- **Experience Analysis**: Overqualified, well-matched, underqualified breakdown

### Analytics Endpoint
```bash
GET /api/candidate-ranking/analytics/{job_id}/
```

Returns comprehensive analytics including:
- Score statistics and distribution
- Candidate status breakdown
- Experience level analysis
- Performance metrics

## Testing

### Backend Testing
```bash
# Run the test script
python test_ranking_system.py

# Run Django tests
python manage.py test candidate_ranking
```

### Frontend Testing
- Test job loading and selection
- Test ranking display and filtering
- Test shortlist/reject functionality
- Test view details modal
- Test analytics display

## Troubleshooting

### Common Issues

1. **404 Errors**: Check URL patterns and app inclusion
2. **Authentication Errors**: Verify JWT token configuration
3. **Database Errors**: Run migrations and check model relationships
4. **Performance Issues**: Optimize queries and add indexing

### Debug Mode
Enable debug logging in settings:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'candidate_ranking': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Future Enhancements

### Planned Features
- **Advanced AI Models**: Machine learning-based ranking
- **Interview Scheduling**: Integrated interview management
- **Email Notifications**: Automated candidate communication
- **Bulk Operations**: Mass shortlist/reject functionality
- **Export Features**: CSV/PDF export capabilities
- **Mobile App**: React Native mobile application

### Performance Optimizations
- **Caching**: Redis-based caching for rankings
- **Async Processing**: Celery for background ranking jobs
- **Database Optimization**: Query optimization and indexing
- **API Rate Limiting**: Request throttling and monitoring

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

### Code Standards
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write comprehensive tests
- Update documentation for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above 