import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as ListIcon,
  FormatListNumbered as NumberedListIcon
} from '@mui/icons-material';

const NotesPane = ({ question, onSave }) => {
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');

  const handleSave = () => {
    if (onSave) {
      onSave({
        title,
        notes,
        questionId: question?.id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleDownload = () => {
    const content = `# ${title || question?.title || 'Notes'}\n\n${notes}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || question?.title || 'notes'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setNotes('');
    setTitle('');
  };

  const insertText = (text) => {
    setNotes(prev => prev + text);
  };

  const formatText = (format) => {
    const textarea = document.getElementById('notes-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'bullet':
        formattedText = `\n• ${selectedText}`;
        break;
      case 'numbered':
        formattedText = `\n1. ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }

    const newNotes = notes.substring(0, start) + formattedText + notes.substring(end);
    setNotes(newNotes);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ mr: 2, fontWeight: 600 }}>
              📝 Notes & Explanations
            </Typography>

            <Tooltip title="Bold">
              <IconButton size="small" onClick={() => formatText('bold')}>
                <BoldIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Italic">
              <IconButton size="small" onClick={() => formatText('italic')}>
                <ItalicIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Bullet List">
              <IconButton size="small" onClick={() => formatText('bullet')}>
                <ListIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Numbered List">
              <IconButton size="small" onClick={() => formatText('numbered')}>
                <NumberedListIcon />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Tooltip title="Save Notes">
              <IconButton size="small" onClick={handleSave}>
                <SaveIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Download as Markdown">
              <IconButton size="small" onClick={handleDownload}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Clear All">
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Title Input */}
      <TextField
        label="Title"
        variant="outlined"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a title for your notes..."
        sx={{ mb: 2 }}
        size="small"
      />

      {/* Notes Textarea */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TextField
          id="notes-textarea"
          label="Notes"
          variant="outlined"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your notes, explanations, or thoughts here..."
          multiline
          rows={20}
          sx={{ flex: 1 }}
          InputProps={{
            style: {
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.6'
            }
          }}
        />
      </Box>

      {/* Quick Insert Buttons */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Quick Insert:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => insertText('\n## Approach\n')}
          >
            Approach
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => insertText('\n## Time Complexity\n')}
          >
            Time Complexity
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => insertText('\n## Space Complexity\n')}
          >
            Space Complexity
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => insertText('\n## Edge Cases\n')}
          >
            Edge Cases
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => insertText('\n## Code Explanation\n')}
          >
            Code Explanation
          </Button>
        </Box>
      </Box>

      {/* Status */}
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {notes.length} characters
        </Typography>
        <Chip
          label="Markdown Supported"
          size="small"
          variant="outlined"
        />
      </Box>
    </Box>
  );
};

export default NotesPane; 