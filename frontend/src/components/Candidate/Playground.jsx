import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Avatar,
  Stack
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Work as WorkIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon,
  AutoAwesome as SparklesIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as TrophyIcon,
  FilterList as FilterIcon,

  Stop as StopIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  LocalFireDepartment as FireIcon,
  School as SchoolIcon,
  Build as BuildIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon2,
  Edit as EditIcon
} from '@mui/icons-material';
import { getMyApplications, getEnhancedCodingQuestions } from '../../services/candidateService';
import CodingQuestionsModal from './CodingQuestionsModal';
import CodeEditor from './CodeEditor';

const Playground = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState(() => {
    const savedHistory = localStorage.getItem('yogya_session_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [totalXP, setTotalXP] = useState(() => {
    const savedXP = localStorage.getItem('yogya_total_xp');
    return savedXP ? parseInt(savedXP) : 0;
  });
  const [completedSessions, setCompletedSessions] = useState(() => {
    const savedSessions = localStorage.getItem('yogya_completed_sessions');
    return savedSessions ? parseInt(savedSessions) : 0;
  });

  useEffect(() => {
    loadPlaygroundData();
  }, []);

  const loadPlaygroundData = async () => {
    try {
      setLoading(true);
      const applications = await getMyApplications();
      setAppliedJobs(applications);
      
      // Load questions for all applied jobs
      await loadAllQuestions(applications);
    } catch (error) {
      setError('Failed to load playground data');
      console.error('Error loading playground data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllQuestions = async (jobs) => {
    const allQuestionsData = [];
    console.log('🔄 Loading questions for jobs:', jobs.length);
    
    for (const job of jobs) {
      try {
        if (job.job_id) {
          console.log(`📋 Loading questions for job ${job.job_id}: ${job.jobTitle}`);
          const questions = await getEnhancedCodingQuestions(job.job_id);
          if (questions.enhanced_questions) {
            const questionCount = questions.enhanced_questions.questions?.length || 0;
            console.log(`✅ Loaded ${questionCount} questions for job ${job.job_id}`);
            allQuestionsData.push({
              job: job,
              questions: questions.enhanced_questions,
              metadata: questions.metadata || {}
            });
          } else {
            console.log(`❌ No enhanced questions for job ${job.job_id}`);
          }
        }
      } catch (error) {
        console.error(`Error loading questions for job ${job.job_id}:`, error);
      }
    }
    
    console.log(`🎯 Total jobs with questions: ${allQuestionsData.length}`);
    setAllQuestions(allQuestionsData);
  };

  const getTechnologyIcon = (technology) => {
    const techIcons = {
      'python': <CodeIcon />,
      'java': <CodeIcon />,
      'javascript': <CodeIcon />,
      'react': <CodeIcon />,
      'node': <CodeIcon />,
      'sql': <CodeIcon />,
      'devops': <BuildIcon />,
      'cloud': <BuildIcon />,
      'system_design': <LightbulbIcon />,
      'ml_ai': <BrainIcon />,
      'web_development': <CodeIcon />,
      'mobile': <CodeIcon />,
      'data_structures': <CodeIcon />,
      'algorithms': <CodeIcon />
    };
    return techIcons[technology.toLowerCase()] || <CodeIcon />;
  };

  const getTechnologyColor = (technology) => {
    const techColors = {
      'python': '#3776ab',
      'java': '#ed8b00',
      'javascript': '#f7df1e',
      'react': '#61dafb',
      'node': '#339933',
      'sql': '#336791',
      'devops': '#ff6b35',
      'cloud': '#ff9900',
      'system_design': '#9c27b0',
      'ml_ai': '#4caf50',
      'web_development': '#2196f3',
      'mobile': '#ff5722',
      'data_structures': '#795548',
      'algorithms': '#607d8b'
    };
    return techColors[technology.toLowerCase()] || '#6c5ce7';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#757575';
    }
  };

  const filterQuestionsByDifficulty = (questions, difficulty) => {
    if (difficulty === 'all') return questions;
    return questions.filter(q => q.difficulty === difficulty);
  };



  const saveSession = () => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        endTime: new Date(),
        totalTime: new Date() - currentSession.startTime
      };
      setSessionHistory(prev => [completedSession, ...prev.slice(0, 9)]); // Keep last 10 sessions
      setCurrentSession(null);
    }
  };

  const handleAccordionChange = (tech) => (event, isExpanded) => {
    setExpandedSections(prev => ({
      ...prev,
      [tech]: isExpanded
    }));
  };

  const handleOpenCodeEditor = (question) => {
    setSelectedQuestion(question);
    setShowCodeEditor(true);
  };

  const handleCloseCodeEditor = () => {
    setShowCodeEditor(false);
    setSelectedQuestion(null);
  };

  const handleSessionComplete = (sessionData) => {
    console.log('🎯 Session completed from Playground:', sessionData);
    
    // Update state
    const newTotalXP = totalXP + sessionData.xp;
    const newCompletedSessions = completedSessions + 1;
    
    setTotalXP(newTotalXP);
    setCompletedSessions(newCompletedSessions);
    setSessionHistory(prev => [...prev, sessionData]);
    
    // Persist to localStorage
    localStorage.setItem('yogya_total_xp', newTotalXP.toString());
    localStorage.setItem('yogya_completed_sessions', newCompletedSessions.toString());
    
    // Save session history
    const savedHistory = JSON.parse(localStorage.getItem('yogya_session_history') || '[]');
    savedHistory.push(sessionData);
    localStorage.setItem('yogya_session_history', JSON.stringify(savedHistory));
  };

  const getTotalQuestions = () => {
    return allQuestions.reduce((total, jobData) => {
      const filteredQuestions = filterQuestionsByDifficulty(jobData.questions.questions || [], selectedDifficulty);
      return total + filteredQuestions.length;
    }, 0);
  };

  const getEstimatedTime = () => {
    return allQuestions.reduce((total, jobData) => {
      const filteredQuestions = filterQuestionsByDifficulty(jobData.questions.questions || [], selectedDifficulty);
      return total + filteredQuestions.reduce((sum, q) => sum + (q.time_limit || 15), 0);
    }, 0);
  };

  const groupQuestionsByTechnology = () => {
    const techGroups = {};
    const seenQuestions = new Set(); // Track seen questions to avoid duplicates
    
    allQuestions.forEach(jobData => {
      const questions = filterQuestionsByDifficulty(jobData.questions.questions || [], selectedDifficulty);
      
      questions.forEach(question => {
        // Create a unique identifier for each question to avoid duplicates
        const questionId = `${question.title}-${question.difficulty}`;
        
        if (!seenQuestions.has(questionId)) {
          seenQuestions.add(questionId);
          const tech = question.tags?.[0] || 'general';
          if (!techGroups[tech]) {
            techGroups[tech] = [];
          }
          techGroups[tech].push(question);
        }
      });
    });
    
    return techGroups;
  };

  if (loading && appliedJobs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const techGroups = groupQuestionsByTechnology();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          🎯 AI-Powered Coding Playground
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}>
          Practice with AI-recommended coding questions tailored to your profile and applied jobs. 
          Questions are intelligently selected based on your skills, experience, and target roles.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {getTotalQuestions()}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{
                    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                    fontSize: '0.85rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  AI-Recommended Questions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {Object.keys(techGroups).length}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{
                    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                    fontSize: '0.85rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  Technology Areas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {getEstimatedTime()}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{
                    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                    fontSize: '0.85rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  Minutes Estimated
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {completedSessions}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{
                    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                    fontSize: '0.85rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  Completed Sessions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 1,
                    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                    letterSpacing: '-0.02em'
                  }}
                >
                  <TrophyIcon />
                  {totalXP}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{
                    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                    fontSize: '0.85rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  Total XP Earned
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card sx={{ mb: 4, p: 2, background: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Filter by:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={selectedDifficulty}
                label="Difficulty"
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ddd',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  },
                }}
              >
                <MenuItem value="all">All Difficulties</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
            
            <Chip
              label={`${getTotalQuestions()} questions`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          {currentSession && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<SaveIcon />}
                onClick={saveSession}
              >
                Save Session
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<StopIcon />}
                onClick={() => setCurrentSession(null)}
              >
                End Session
              </Button>
            </Box>
          )}
        </Box>
      </Card>

      {/* Questions by Technology */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
            fontWeight: 600,
            letterSpacing: '-0.02em'
          }}
        >
          <BrainIcon color="primary" />
          AI-Recommended Questions by Technology
        </Typography>

        {Object.keys(techGroups).length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No Questions Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Apply to jobs first to get AI-recommended coding questions based on your profile.
              </Typography>
              <Button variant="contained" color="primary">
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box>
            {Object.entries(techGroups).map(([tech, questions]) => {
              const techColor = getTechnologyColor(tech);
              const techIcon = getTechnologyIcon(tech);
              
              return (
                <Accordion
                  key={tech}
                  expanded={expandedSections[tech] || false}
                  onChange={handleAccordionChange(tech)}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Chip
                        label={tech.replace('_', ' ').toUpperCase()}
                        icon={techIcon}
                        sx={{
                          backgroundColor: `${techColor}20`,
                          color: techColor,
                          fontWeight: 'bold'
                        }}
                      />
                      <Box sx={{ flex: 1 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${questions.length} questions`}
                          size="small"
                          sx={{
                            backgroundColor: `${techColor}20`,
                            color: techColor,
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                                         <Grid container spacing={2}>
                       {questions.map((question, index) => (
                         <Grid item xs={12} key={index}>
                           <Card 
                             sx={{ 
                               p: 2, 
                               border: '1px solid #e0e0e0',
                               '&:hover': {
                                 boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                 borderColor: techColor
                               },
                               transition: 'all 0.2s ease'
                             }}
                           >
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                               <Box sx={{ flex: 1 }}>
                                 <Typography 
                                   variant="h6" 
                                   sx={{ 
                                     fontWeight: 600, 
                                     mb: 1, 
                                     color: 'text.primary',
                                     fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                                     fontSize: '1.1rem',
                                     letterSpacing: '-0.01em'
                                   }}
                                 >
                                   {question.title}
                                 </Typography>
                                 <Typography 
                                   variant="body2" 
                                   color="text.secondary" 
                                   sx={{ 
                                     mb: 2, 
                                     lineHeight: 1.6,
                                     fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
                                     fontSize: '0.9rem',
                                     letterSpacing: '0.01em'
                                   }}
                                 >
                                   {question.description}
                                 </Typography>
                                 <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                   {question.tags?.map((tag, tagIndex) => (
                                     <Chip
                                       key={tagIndex}
                                       label={tag}
                                       size="small"
                                       variant="outlined"
                                       sx={{ 
                                         fontSize: '0.7rem',
                                         backgroundColor: `${techColor}10`,
                                         borderColor: techColor,
                                         color: techColor
                                       }}
                                     />
                                   ))}
                                 </Box>
                                 <Button
                                   variant="contained"
                                   startIcon={<EditIcon />}
                                   onClick={() => handleOpenCodeEditor(question)}
                                   sx={{
                                     background: `linear-gradient(45deg, ${techColor}, ${techColor}80)`,
                                     '&:hover': { background: `linear-gradient(45deg, ${techColor}80, ${techColor})` }
                                   }}
                                 >
                                   Practice Now
                                 </Button>
                               </Box>
                               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                                 <Chip
                                   label={question.difficulty}
                                   size="small"
                                   sx={{
                                     backgroundColor: `${getDifficultyColor(question.difficulty)}20`,
                                     color: getDifficultyColor(question.difficulty),
                                     fontWeight: 'bold'
                                   }}
                                 />
                                 <Chip
                                   icon={<TimerIcon />}
                                   label={`${question.time_limit || 15}m`}
                                   size="small"
                                   variant="outlined"
                                   sx={{ fontSize: '0.7rem' }}
                                 />
                               </Box>
                             </Box>
                           </Card>
                         </Grid>
                       ))}
                     </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Session History */}
      {sessionHistory.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            Recent Practice Sessions
          </Typography>
          <Grid container spacing={2}>
            {sessionHistory.slice(0, 3).map((session) => (
              <Grid key={session.id}>
                <Card sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <TrophyIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Practice Session
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(session.startTime).toLocaleDateString()} • {Math.round(session.totalTime / 60000)}m
                      </Typography>
                    </Box>
                    <Chip
                      label={`${session.questions.length} questions`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Code Editor Modal */}
      {showCodeEditor && selectedQuestion && (
        <Dialog
          open={showCodeEditor}
          onClose={handleCloseCodeEditor}
          maxWidth={false}
          fullWidth
          PaperProps={{
            sx: {
              height: '90vh',
              maxHeight: '90vh',
              width: '95vw',
              maxWidth: '95vw'
            }
          }}
        >
          <CodeEditor 
            question={selectedQuestion} 
            onClose={handleCloseCodeEditor}
            onSessionComplete={handleSessionComplete}
          />
        </Dialog>
      )}
    </Box>
  );
};

export default Playground; 