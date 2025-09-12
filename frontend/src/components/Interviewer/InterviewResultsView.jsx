import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Card, CardContent, Chip, Stack, 
  Grid, LinearProgress, Rating, Accordion, AccordionSummary, 
  AccordionDetails, Divider, Alert, Button
} from '@mui/material';
import {
  Assessment, ExpandMore, CheckCircle, Star, 
  TrendingUp, TrendingDown, TrendingFlat
} from '@mui/icons-material';

const InterviewResultsView = ({ interviewId, onClose }) => {
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for the completed interview
  const mockResultsData = {
    candidate: {
      name: "John Candidate",
      email: "candidate@yogya.com",
      role: "Python Developer"
    },
    interview: {
      id: "INT-FB9704CD",
      date: "2025-09-03",
      duration: "45 minutes",
      overallScore: 82.70,
      status: "completed"
    },
    competencyEvaluations: [
      {
        competency: "Python Programming",
        score: 85,
        level: "proficient",
        feedback: "Strong understanding of Python syntax, data structures, and OOP concepts. Demonstrated good problem-solving skills with clean, readable code.",
        strengths: "Excellent grasp of Python fundamentals, good use of list comprehensions, and proper error handling.",
        areasForImprovement: "Could benefit from more advanced Python features like decorators and context managers.",
        questions: [
          {
            text: "Explain the difference between a list and a tuple in Python.",
            answer: "Lists are mutable, tuples are immutable. Lists use square brackets, tuples use parentheses.",
            score: 9,
            feedback: "Excellent explanation with clear examples."
          },
          {
            text: "Write a Python snippet to reverse a string without using slicing.",
            answer: "def reverse_string(s): return ''.join(reversed(s))",
            score: 8,
            feedback: "Good solution, could also mention alternative approaches."
          }
        ]
      },
      {
        competency: "Django Framework",
        score: 78,
        level: "competent",
        feedback: "Good knowledge of Django models, views, and templates. Some gaps in advanced features like middleware and signals.",
        strengths: "Solid understanding of Django ORM, URL routing, and template system.",
        areasForImprovement: "Needs more experience with Django REST framework and advanced Django features.",
        questions: [
          {
            text: "How do you handle database migrations in Django?",
            answer: "Using makemigrations and migrate commands, with proper version control.",
            score: 7,
            feedback: "Correct approach, could elaborate on rollback strategies."
          }
        ]
      },
      {
        competency: "Database Design",
        score: 82,
        level: "proficient",
        feedback: "Solid understanding of relational databases, SQL queries, and database optimization techniques.",
        strengths: "Good knowledge of database normalization, indexing, and query optimization.",
        areasForImprovement: "Could improve knowledge of NoSQL databases and advanced database concepts.",
        questions: [
          {
            text: "Explain the difference between INNER JOIN and LEFT JOIN.",
            answer: "INNER JOIN returns only matching records, LEFT JOIN returns all records from left table.",
            score: 8,
            feedback: "Clear and accurate explanation."
          }
        ]
      },
      {
        competency: "API Development",
        score: 90,
        level: "expert",
        feedback: "Excellent knowledge of REST APIs, authentication, and API design patterns. Very strong in this area.",
        strengths: "Outstanding API design skills, proper HTTP status codes, and comprehensive error handling.",
        areasForImprovement: "Consider learning GraphQL for more complex API requirements.",
        questions: [
          {
            text: "How would you implement JWT authentication in a REST API?",
            answer: "Generate JWT token on login, include in Authorization header, validate on each request.",
            score: 10,
            feedback: "Perfect understanding of JWT implementation and security considerations."
          }
        ]
      },
      {
        competency: "Testing",
        score: 75,
        level: "competent",
        feedback: "Basic understanding of unit testing and test-driven development. Needs improvement in integration testing.",
        strengths: "Good knowledge of pytest and basic unit testing concepts.",
        areasForImprovement: "Needs more experience with integration testing, mocking, and test coverage analysis.",
        questions: [
          {
            text: "Write a simple unit test for a Python function.",
            answer: "def test_function(): assert my_function(2, 3) == 5",
            score: 7,
            feedback: "Basic test structure, could improve with more comprehensive test cases."
          }
        ]
      },
      {
        competency: "Problem Solving",
        score: 88,
        level: "proficient",
        feedback: "Strong analytical thinking and problem-solving approach. Able to break down complex problems into manageable parts.",
        strengths: "Excellent logical reasoning, good use of algorithms and data structures.",
        areasForImprovement: "Could improve in system design and scalability considerations.",
        questions: [
          {
            text: "How would you optimize a slow database query?",
            answer: "Add indexes, analyze query execution plan, consider query rewriting or database optimization.",
            score: 9,
            feedback: "Comprehensive approach to query optimization."
          }
        ]
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInterviewData(mockResultsData);
      setLoading(false);
    }, 1000);
  }, [interviewId]);

  const getScoreColor = (score) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getScoreIcon = (score) => {
    if (score >= 85) return <TrendingUp color="success" />;
    if (score >= 70) return <TrendingFlat color="warning" />;
    return <TrendingDown color="error" />;
  };

  const getLevelColor = (level) => {
    const colors = {
      'novice': 'error',
      'beginner': 'warning',
      'competent': 'info',
      'proficient': 'success',
      'expert': 'success'
    };
    return colors[level] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading interview results...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              Interview Results
            </Typography>
            <Typography variant="h6" gutterBottom>
              {interviewData.candidate.name} - {interviewData.candidate.role}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Chip label={`Interview ID: ${interviewData.interview.id}`} variant="outlined" />
              <Chip label={`Date: ${interviewData.interview.date}`} variant="outlined" />
              <Chip label={`Duration: ${interviewData.interview.duration}`} variant="outlined" />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              <Assessment color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {interviewData.interview.overallScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall Score
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Competency Breakdown */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Detailed Competency Analysis
      </Typography>

      {interviewData.competencyEvaluations.map((evaluation, index) => (
        <Accordion key={index} sx={{ mb: 2, borderRadius: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {evaluation.competency}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Chip 
                    label={evaluation.level.toUpperCase()} 
                    color={getLevelColor(evaluation.level)}
                    size="small"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getScoreIcon(evaluation.score)}
                    <Typography variant="body2" color="text.secondary">
                      {evaluation.score}% Score
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={evaluation.score}
                  color={getScoreColor(evaluation.score)}
                  sx={{ width: 100, height: 8, borderRadius: 4 }}
                />
                <Typography variant="h6" fontWeight="bold" color={getScoreColor(evaluation.score)}>
                  {evaluation.score}%
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Feedback Section */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Evaluation Feedback
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {evaluation.feedback}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Strengths
                    </Typography>
                    <Typography variant="body2" color="success.main" paragraph>
                      {evaluation.strengths}
                    </Typography>
                    
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Areas for Improvement
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      {evaluation.areasForImprovement}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Questions Section */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Question Analysis
                    </Typography>
                    <Stack spacing={2}>
                      {evaluation.questions.map((question, qIndex) => (
                        <Box key={qIndex} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Q{qIndex + 1}: {question.text}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            <strong>Answer:</strong> {question.answer}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Rating value={question.score / 2} precision={0.5} readOnly size="small" />
                            <Typography variant="body2" fontWeight="bold">
                              {question.score}/10
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {question.feedback}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Summary */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Interview Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {interviewData.competencyEvaluations.filter(e => e.score >= 85).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Excellent Scores (≥85%)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {interviewData.competencyEvaluations.filter(e => e.score >= 70 && e.score < 85).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Good Scores (70-84%)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {interviewData.competencyEvaluations.filter(e => e.score < 70).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Needs Improvement (<70%)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default InterviewResultsView;


