import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  Stop as StopIcon,
  Refresh as ResetIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Timer as TimerIcon,
  Code as CodeIcon,
  Brush as DrawingIcon,
  Edit as NotesIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { executeCode } from '../../services/candidateService';
import DrawingPane from './DrawingPane';
import NotesPane from './NotesPane';
import PracticeSession from './PracticeSession';

const CodeEditor = ({ question, onClose, onSessionComplete }) => {
  const [code, setCode] = useState(question?.starter_code || '# Write your code here\nprint("Hello, World!")');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showPracticeSession, setShowPracticeSession] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const editorRef = useRef(null);

  // Determine if this is a system design question
  const isSystemDesign = question?.tags?.some(tag => 
    tag.toLowerCase().includes('system_design') || 
    tag.toLowerCase().includes('architecture') ||
    tag.toLowerCase().includes('design')
  );

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    // Set focus to editor
    editor.focus();
  };

  const runCode = async () => {
    if (!code.trim()) {
      setError('Please write some code first!');
      return;
    }

    setIsRunning(true);
    setError('');
    setOutput('');
    setSuccess(false);
    const startTime = Date.now();

    try {
      console.log('🚀 Starting code execution...');
      const result = await executeCode(code, 'python');
      console.log('✅ Code execution result:', result);
      
      if (result.success) {
        setOutput(result.output);
        setSuccess(true);
        setExecutionTime(result.execution_time || (Date.now() - startTime));
        console.log('✅ Code executed successfully');
      } else {
        setError(result.error || 'Code execution failed');
        setOutput(result.output || '');
        console.log('❌ Code execution failed:', result.error);
      }
    } catch (err) {
      console.error('❌ Code execution error:', err);
      setError('Execution failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(question?.starter_code || '# Write your code here\nprint("Hello, World!")');
    setOutput('');
    setError('');
    setSuccess(false);
    setExecutionTime(0);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${question?.title || 'code'}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDrawingSave = (drawingData) => {
    console.log('🎨 Drawing saved:', drawingData);
    // TODO: Save to backend
  };

  const handleNotesSave = (notesData) => {
    console.log('📝 Notes saved:', notesData);
    // TODO: Save to backend
  };

  const handleSessionComplete = (sessionData) => {
    console.log('🎯 Session completed:', sessionData);
    setSessionHistory(prev => [...prev, sessionData]);
    
    // Call parent handler to update XP and stats
    if (onSessionComplete) {
      onSessionComplete(sessionData);
    }
    
    // TODO: Save to backend and update user XP
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                🚀 Code Playground
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {question?.title || 'Practice your coding skills'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label={question?.difficulty || 'Medium'} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
              <Chip 
                icon={<TimerIcon />} 
                label={`${question?.time_limit || 15}m`} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
              <Button
                variant="contained"
                startIcon={<TrophyIcon />}
                onClick={() => setShowPracticeSession(true)}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                Start Practice Session
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Practice Session Overlay */}
      {showPracticeSession && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.8)', 
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: 600, 
            maxHeight: '90vh', 
            overflow: 'auto',
            backgroundColor: 'white',
            borderRadius: 2,
            p: 2
          }}>
            <PracticeSession 
              question={question}
              onSessionComplete={handleSessionComplete}
              onClose={() => setShowPracticeSession(false)}
            />
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
        {/* Left Panel - Tabbed Interface */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 48,
                    textTransform: 'none',
                    fontWeight: 500
                  }
                }}
              >
                <Tab 
                  icon={<CodeIcon />} 
                  label="Code" 
                  iconPosition="start"
                  sx={{ 
                    backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
                    color: activeTab === 0 ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: activeTab === 0 ? 'primary.dark' : 'action.hover'
                    }
                  }}
                />
                <Tab 
                  icon={<DrawingIcon />} 
                  label="Drawing" 
                  iconPosition="start"
                  sx={{ 
                    backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
                    color: activeTab === 1 ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: activeTab === 1 ? 'primary.dark' : 'action.hover'
                    }
                  }}
                />
                <Tab 
                  icon={<NotesIcon />} 
                  label="Notes" 
                  iconPosition="start"
                  sx={{ 
                    backgroundColor: activeTab === 2 ? 'primary.main' : 'transparent',
                    color: activeTab === 2 ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: activeTab === 2 ? 'primary.dark' : 'action.hover'
                    }
                  }}
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ flex: 1, p: 2 }}>
              {activeTab === 0 && (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Code Editor Toolbar */}
                  <Box sx={{ 
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8f9fa',
                    p: 1,
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      💻 Code Editor
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Copy Code">
                        <IconButton size="small" onClick={copyCode}>
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Code">
                        <IconButton size="small" onClick={downloadCode}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Code">
                        <IconButton size="small" onClick={resetCode}>
                          <ResetIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {/* Monaco Editor */}
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <Editor
                      height="100%"
                      defaultLanguage="python"
                      value={code}
                      onChange={setCode}
                      onMount={handleEditorDidMount}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        parameterHints: { enabled: true },
                        formatOnPaste: true,
                        formatOnType: true,
                        padding: { top: 16, bottom: 16 },
                        lineHeight: 22,
                        scrollbar: {
                          vertical: 'visible',
                          horizontal: 'visible',
                          verticalScrollbarSize: 12,
                          horizontalScrollbarSize: 12
                        }
                      }}
                    />
                  </Box>
                </Box>
              )}

              {activeTab === 1 && (
                <DrawingPane 
                  question={question} 
                  onSave={handleDrawingSave}
                />
              )}

              {activeTab === 2 && (
                <NotesPane 
                  question={question} 
                  onSave={handleNotesSave}
                />
              )}
            </Box>
          </Card>
        </Box>

        {/* Right Panel - Context & Output */}
        <Box sx={{ width: 400, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Tab-specific Controls */}
          {activeTab === 0 && (
            <>
              {/* Run Button */}
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={isRunning ? <CircularProgress size={20} color="inherit" /> : <RunIcon />}
                      onClick={runCode}
                      disabled={isRunning}
                      sx={{
                        flex: 1,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': { background: 'linear-gradient(45deg, #5a6fd8, #6a4190)' }
                      }}
                    >
                      {isRunning ? 'Running...' : 'Run Code'}
                    </Button>
                    {executionTime > 0 && (
                      <Chip
                        icon={<TimerIcon />}
                        label={`${executionTime}ms`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Output Panel */}
              <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#f8f9fa'
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    📤 Output
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2, minHeight: 0 }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Code executed successfully!
                    </Alert>
                  )}
                  {output && (
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: '#1e1e1e',
                        color: '#d4d4d4',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        overflow: 'auto',
                        maxHeight: '100%',
                        border: '1px solid #333'
                      }}
                    >
                      {output}
                    </Paper>
                  )}
                  {!output && !error && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      color: 'text.secondary',
                      fontStyle: 'italic'
                    }}>
                      Run your code to see the output here
                    </Box>
                  )}
                </Box>
              </Card>
            </>
          )}

          {activeTab === 1 && (
            <Card>
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  🎨 Drawing Tips
                </Typography>
              </Box>
              <CardContent>
                <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                  Use the drawing tools to create system architecture diagrams, flowcharts, or any visual representations.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip label="Select tool to move shapes" size="small" variant="outlined" />
                  <Chip label="Click to add shapes" size="small" variant="outlined" />
                  <Chip label="Drag to draw freehand" size="small" variant="outlined" />
                  <Chip label="Use arrows for flow" size="small" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && (
            <Card>
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  📝 Notes Tips
                </Typography>
              </Box>
              <CardContent>
                <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                  Document your approach, explanations, and thoughts. Use Markdown formatting for better organization.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip label="**Bold** for emphasis" size="small" variant="outlined" />
                  <Chip label="*Italic* for highlights" size="small" variant="outlined" />
                  <Chip label="Use ## for headers" size="small" variant="outlined" />
                  <Chip label="Quick insert buttons available" size="small" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Question Description */}
          {question && (
            <Card>
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  📝 Problem Description
                </Typography>
              </Box>
              <CardContent>
                <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {question.description}
                </Typography>
                {question.tags && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {question.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CodeEditor; 