import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  People,
  Star,
  ThumbDown,
  Psychology,
  LocationOn
} from '@mui/icons-material';
import rankingService from '../../services/rankingService';

const RankingAnalytics = ({ jobId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (jobId) {
      loadAnalytics(jobId);
    }
  }, [jobId]);

  const loadAnalytics = async (jobId) => {
    try {
      setLoading(true);
      setError('');
      
      // TODO: Replace with actual API call
      const mockAnalytics = {
        job_id: jobId,
        job_title: 'Senior Python Developer',
        total_candidates: 4,
        analytics: {
          score_stats: {
            average_score: 70.36,
            max_score: 93.0,
            min_score: 43.93,
            score_range: 49.07
          },
          score_distribution: {
            high_matches: 2,
            medium_matches: 1,
            low_matches: 1,
            high_match_percentage: 50.0,
            medium_match_percentage: 25.0,
            low_match_percentage: 25.0
          },
          candidate_status: {
            top_candidates: 2,
            shortlisted: 0,
            rejected: 0,
            pending_review: 4
          },
          experience_analysis: {
            overqualified: 1,
            well_matched: 2,
            underqualified: 1,
            overqualified_percentage: 25.0,
            well_matched_percentage: 50.0,
            underqualified_percentage: 25.0
          }
        }
      };
      
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return null;
  }

  const { score_stats, score_distribution, candidate_status, experience_analysis } = analytics.analytics;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp color="primary" />
        Ranking Analytics
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {analytics.job_title}
      </Typography>

      <Grid container spacing={3}>
        {/* Score Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Score Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" color="primary">
                    {score_stats.average_score}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Score
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="success.main">
                    {score_stats.max_score}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Highest Score
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="error.main">
                    {score_stats.min_score}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Lowest Score
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="warning.main">
                    {score_stats.score_range}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Score Range
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Candidate Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Candidate Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Star color="success" sx={{ mr: 1 }} />
                    <Typography variant="h4" color="success.main">
                      {candidate_status.top_candidates}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Top Candidates
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <People color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h4" color="primary">
                      {candidate_status.pending_review}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Pending Review
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Star color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h4" color="warning.main">
                      {candidate_status.shortlisted}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Shortlisted
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ThumbDown color="error" sx={{ mr: 1 }} />
                    <Typography variant="h4" color="error.main">
                      {candidate_status.rejected}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Rejected
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Score Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Score Distribution
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">High Match (80%+)</Typography>
                  <Typography variant="body2" color="success.main">
                    {score_distribution.high_matches} ({score_distribution.high_match_percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={score_distribution.high_match_percentage}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Medium Match (60-79%)</Typography>
                  <Typography variant="body2" color="warning.main">
                    {score_distribution.medium_matches} ({score_distribution.medium_match_percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={score_distribution.medium_match_percentage}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Low Match (<60%)</Typography>
                  <Typography variant="body2" color="error.main">
                    {score_distribution.low_matches} ({score_distribution.low_match_percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={score_distribution.low_match_percentage}
                  color="error"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Experience Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Experience Analysis
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Overqualified</Typography>
                  <Typography variant="body2" color="warning.main">
                    {experience_analysis.overqualified} ({experience_analysis.overqualified_percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={experience_analysis.overqualified_percentage}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Well Matched</Typography>
                  <Typography variant="body2" color="success.main">
                    {experience_analysis.well_matched} ({experience_analysis.well_matched_percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={experience_analysis.well_matched_percentage}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Underqualified</Typography>
                  <Typography variant="body2" color="error.main">
                    {experience_analysis.underqualified} ({experience_analysis.underqualified_percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={experience_analysis.underqualified_percentage}
                  color="error"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {analytics.total_candidates}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Candidates
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {score_distribution.high_matches}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      High Quality Matches
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {experience_analysis.well_matched}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Experience Fit
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {candidate_status.top_candidates}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Top Candidates
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RankingAnalytics; 