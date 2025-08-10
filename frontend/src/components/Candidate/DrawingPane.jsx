import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Chip,
  Grid
} from '@mui/material';
import {
  Brush as BrushIcon,
  Square as SquareIcon,
  Circle as CircleIcon,
  ArrowForward as ArrowIcon,
  TextFields as TextIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Stage, Layer, Rect, Circle, Arrow, Text, Line } from 'react-konva';

const DrawingPane = ({ question, onSave }) => {
  const [tool, setTool] = useState('select');
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const stageRef = useRef(null);

  const addShape = (type, props) => {
    const newShape = {
      id: Date.now().toString(),
      type,
      ...props
    };
    
    const newShapes = [...shapes, newShape];
    setShapes(newShapes);
    addToHistory(newShapes);
  };

  const addToHistory = (newShapes) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleMouseDown = (e) => {
    if (tool === 'draw') {
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      setDrawingPoints([pos.x, pos.y]);
    }
  };

  const handleMouseMove = (e) => {
    if (tool === 'draw' && isDrawing) {
      const pos = e.target.getStage().getPointerPosition();
      setDrawingPoints([...drawingPoints, pos.x, pos.y]);
    }
  };

  const handleMouseUp = (e) => {
    if (tool === 'draw' && isDrawing) {
      setIsDrawing(false);
      if (drawingPoints.length >= 4) {
        addShape('line', {
          points: drawingPoints,
          stroke: '#000000',
          strokeWidth: 2,
          tension: 0.5
        });
      }
      setDrawingPoints([]);
    }
  };

  const handleStageClick = (e) => {
    if (tool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
        return;
      }
    }

    if (tool === 'rectangle') {
      const pos = e.target.getStage().getPointerPosition();
      addShape('rect', {
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 60,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 2
      });
    }

    if (tool === 'circle') {
      const pos = e.target.getStage().getPointerPosition();
      addShape('circle', {
        x: pos.x,
        y: pos.y,
        radius: 30,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 2
      });
    }

    if (tool === 'arrow') {
      const pos = e.target.getStage().getPointerPosition();
      addShape('arrow', {
        x: pos.x,
        y: pos.y,
        points: [0, 0, 100, 0],
        stroke: '#000000',
        strokeWidth: 3,
        fill: '#000000'
      });
    }

    if (tool === 'text') {
      const pos = e.target.getStage().getPointerPosition();
      addShape('text', {
        x: pos.x,
        y: pos.y,
        text: 'Text',
        fontSize: 16,
        fill: '#000000'
      });
    }
  };

  const handleShapeClick = (id) => {
    if (tool === 'select') {
      setSelectedId(id);
    }
  };

  const deleteSelected = () => {
    if (selectedId) {
      const newShapes = shapes.filter(shape => shape.id !== selectedId);
      setShapes(newShapes);
      setSelectedId(null);
      addToHistory(newShapes);
    }
  };

  const clearCanvas = () => {
    setShapes([]);
    setSelectedId(null);
    addToHistory([]);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setShapes(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setShapes(history[historyIndex + 1]);
    }
  };

  const downloadImage = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = `${question?.title || 'diagram'}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const saveDrawing = () => {
    if (onSave) {
      onSave({
        shapes,
        questionId: question?.id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const tools = [
    { id: 'select', icon: <BrushIcon />, label: 'Select' },
    { id: 'draw', icon: <BrushIcon />, label: 'Draw' },
    { id: 'rectangle', icon: <SquareIcon />, label: 'Rectangle' },
    { id: 'circle', icon: <CircleIcon />, label: 'Circle' },
    { id: 'arrow', icon: <ArrowIcon />, label: 'Arrow' },
    { id: 'text', icon: <TextIcon />, label: 'Text' }
  ];

  const renderShape = (shape) => {
    const isSelected = selectedId === shape.id;
    
    switch (shape.type) {
      case 'rect':
        return (
          <Rect
            key={shape.id}
            {...shape}
            stroke={isSelected ? '#1976d2' : shape.stroke}
            strokeWidth={isSelected ? 3 : shape.strokeWidth}
            onClick={() => handleShapeClick(shape.id)}
            draggable={tool === 'select'}
          />
        );
      case 'circle':
        return (
          <Circle
            key={shape.id}
            {...shape}
            stroke={isSelected ? '#1976d2' : shape.stroke}
            strokeWidth={isSelected ? 3 : shape.strokeWidth}
            onClick={() => handleShapeClick(shape.id)}
            draggable={tool === 'select'}
          />
        );
      case 'arrow':
        return (
          <Arrow
            key={shape.id}
            {...shape}
            stroke={isSelected ? '#1976d2' : shape.stroke}
            strokeWidth={isSelected ? 3 : shape.strokeWidth}
            onClick={() => handleShapeClick(shape.id)}
            draggable={tool === 'select'}
          />
        );
      case 'text':
        return (
          <Text
            key={shape.id}
            {...shape}
            stroke={isSelected ? '#1976d2' : shape.stroke}
            strokeWidth={isSelected ? 3 : shape.strokeWidth}
            onClick={() => handleShapeClick(shape.id)}
            draggable={tool === 'select'}
          />
        );
      case 'line':
        return (
          <Line
            key={shape.id}
            {...shape}
            stroke={isSelected ? '#1976d2' : shape.stroke}
            strokeWidth={isSelected ? 3 : shape.strokeWidth}
            onClick={() => handleShapeClick(shape.id)}
            draggable={tool === 'select'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ mr: 2, fontWeight: 600 }}>
              🎨 Drawing Tools
            </Typography>
            
            {tools.map((toolItem) => (
              <Tooltip key={toolItem.id} title={toolItem.label}>
                <IconButton
                  size="small"
                  onClick={() => setTool(toolItem.id)}
                  sx={{
                    backgroundColor: tool === toolItem.id ? 'primary.main' : 'transparent',
                    color: tool === toolItem.id ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: tool === toolItem.id ? 'primary.dark' : 'action.hover'
                    }
                  }}
                >
                  {toolItem.icon}
                </IconButton>
              </Tooltip>
            ))}

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Tooltip title="Undo">
              <IconButton size="small" onClick={undo} disabled={historyIndex <= 0}>
                <UndoIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Redo">
              <IconButton size="small" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <RedoIcon />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Tooltip title="Delete Selected">
              <IconButton size="small" onClick={deleteSelected} disabled={!selectedId}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Clear Canvas">
              <IconButton size="small" onClick={clearCanvas}>
                <ClearIcon />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Tooltip title="Save Drawing">
              <IconButton size="small" onClick={saveDrawing}>
                <SaveIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Download as PNG">
              <IconButton size="small" onClick={downloadImage}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
        <Stage
          ref={stageRef}
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleStageClick}
          style={{ backgroundColor: '#fafafa' }}
        >
          <Layer>
            {shapes.map(renderShape)}
            {isDrawing && drawingPoints.length >= 4 && (
              <Line
                points={drawingPoints}
                stroke="#000000"
                strokeWidth={2}
                tension={0.5}
              />
            )}
          </Layer>
        </Stage>
      </Box>

      {/* Status Bar */}
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {selectedId ? `Selected: ${selectedId}` : 'Click to add shapes or select existing ones'}
        </Typography>
        <Chip
          label={`${shapes.length} shapes`}
          size="small"
          variant="outlined"
        />
      </Box>
    </Box>
  );
};

export default DrawingPane; 