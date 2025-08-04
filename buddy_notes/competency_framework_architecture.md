# 🏗️ Yogya Competency Framework Architecture

## 📋 **Overview**

The Yogya Competency Framework is a **bias-resistant, AI-ready system** designed to transform traditional hiring from resume-based to competency-based evaluation. It implements **STAR/CAR behavioral interviewing methodology** with structured evaluation criteria and comprehensive analytics.

## 🏗️ **System Architecture**

### **Core Data Model Hierarchy**
```
CompetencyFramework → Competency → InterviewTemplate → InterviewQuestion
                                    ↓
                            CompetencyEvaluation ← InterviewSession
                                    ↓
                            AIInterviewSession → InterviewAnalytics
```

### **Key Components**

#### **1. CompetencyFramework Model**
```python
class CompetencyFramework(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=100, unique=True)  # "Python Developer - Mid Level"
    description = models.TextField()
    technology = models.CharField(max_length=50)  # "Python", "Java", "Data Science"
    level = models.CharField(max_length=20, choices=[
        ('junior', 'Junior'),
        ('mid', 'Mid-Level'),
        ('senior', 'Senior'),
        ('lead', 'Lead'),
        ('architect', 'Architect'),
    ])
    is_active = models.BooleanField(default=True)
```

**Purpose**: Defines role-specific competency frameworks for different technologies and seniority levels.

**Example**: "Python Developer - Mid Level" framework for Python technology at mid-level seniority.

#### **2. Competency Model (6 Core Competencies)**
```python
class Competency(models.Model):
    framework = models.ForeignKey(CompetencyFramework, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)  # "Problem Solving", "Communication"
    description = models.TextField()
    evaluation_method = models.CharField(max_length=10, choices=[
        ('STAR', 'STAR (Situation, Task, Action, Result)'),
        ('CAR', 'CAR (Context, Action, Result)'),
        ('SOAR', 'SOAR (Situation, Obstacle, Action, Result)'),
    ], default='STAR')
    evaluation_criteria = models.JSONField(default=list)
    sample_question = models.TextField()
    weightage = models.DecimalField(max_digits=5, decimal_places=2)  # Percentage
```

**Core Competencies with Weightage**:
1. **Problem Solving** (20%) - Structured thinking, debugging, analytical approach
2. **Communication** (15%) - Technical explanation, audience adaptation
3. **Collaboration** (15%) - Teamwork, conflict resolution, knowledge sharing
4. **Ownership** (20%) - Initiative, accountability, responsibility
5. **Learning Agility** (10%) - Curiosity, adaptability, quick learning
6. **Technical Depth** (20%) - Fundamentals, architecture, scalable solutions

#### **3. InterviewTemplate Model**
```python
class InterviewTemplate(models.Model):
    name = models.CharField(max_length=100)
    framework = models.ForeignKey(CompetencyFramework, on_delete=models.CASCADE)
    description = models.TextField()
    duration_minutes = models.IntegerField(default=60)
    is_active = models.BooleanField(default=True)
```

**Purpose**: Structured interview templates based on competency frameworks with configurable duration.

#### **4. InterviewQuestion Model**
```python
class InterviewQuestion(models.Model):
    template = models.ForeignKey(InterviewTemplate, on_delete=models.CASCADE)
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE)
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=[
        ('behavioral', 'Behavioral (STAR/CAR)'),
        ('technical', 'Technical'),
        ('problem_solving', 'Problem Solving'),
        ('scenario', 'Scenario-Based'),
        ('coding', 'Coding Challenge'),
        ('situational', 'Situational'),
    ], default='behavioral')
    star_structure = models.JSONField(default=dict)
    car_structure = models.JSONField(default=dict)
    evaluation_criteria = models.JSONField(default=list)
    expected_answer_points = models.JSONField(default=list)
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='medium')
    time_allocation = models.IntegerField(default=5)  # Minutes
```

**Purpose**: Individual questions mapped to competencies with structured evaluation criteria.

## 🔬 **Behavioral Interview Methodology**

### **STAR Framework Implementation**
```json
{
  "situation": "Production bug affecting users",
  "task": "Debug and fix the issue quickly", 
  "action": "Systematic debugging approach",
  "result": "Successfully resolved the issue"
}
```

### **CAR Framework Implementation**
```json
{
  "context": "Need to explain technical concept",
  "action": "Used analogies and simplified language",
  "result": "Stakeholder understood and made informed decision"
}
```

### **Sample Behavioral Questions**

#### **Problem Solving (20% weightage)**
- **Question**: "Tell me about a time when you debugged a critical bug in production. What was the situation, what steps did you take, and what was the outcome?"
- **STAR Structure**: Production bug → Debug quickly → Systematic approach → Resolved issue
- **Evaluation Criteria**: 
  - Demonstrates systematic debugging approach
  - Shows urgency and prioritization
  - Explains technical steps clearly
  - Shows learning from the experience

#### **Communication (15% weightage)**
- **Question**: "Describe a time when you had to explain a complex technical concept to a non-technical stakeholder. How did you approach it?"
- **STAR Structure**: Need to explain → Make understandable → Used analogies → Stakeholder understood
- **Evaluation Criteria**:
  - Uses appropriate analogies
  - Avoids technical jargon
  - Checks for understanding
  - Adapts communication style

#### **Collaboration (15% weightage)**
- **Question**: "Tell me about a time when you helped a struggling team member. What was the situation and how did you support them?"
- **STAR Structure**: Team member struggling → Help succeed → Provided guidance → Completed successfully
- **Evaluation Criteria**:
  - Shows empathy and patience
  - Provides constructive help
  - Encourages independence
  - Builds team relationships

## 📊 **Evaluation System**

### **CompetencyEvaluation Model**
```python
class CompetencyEvaluation(models.Model):
    session = models.ForeignKey(InterviewSession, on_delete=models.CASCADE)
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)  # 0-100
    level = models.CharField(max_length=20, choices=[
        ('novice', 'Novice'),
        ('beginner', 'Beginner'),
        ('competent', 'Competent'),
        ('proficient', 'Proficient'),
        ('expert', 'Expert'),
    ])
    feedback = models.TextField()
    strengths = models.TextField()
    areas_for_improvement = models.TextField()
```

### **Scoring System**
- **0-20**: Novice
- **21-40**: Beginner  
- **41-60**: Competent
- **61-80**: Proficient
- **81-100**: Expert

### **Weighted Overall Score Calculation**
```python
# Example calculation
problem_solving_score = 85 * 0.20  # 17.0
communication_score = 75 * 0.15    # 11.25
collaboration_score = 80 * 0.15    # 12.0
ownership_score = 90 * 0.20        # 18.0
learning_agility_score = 70 * 0.10 # 7.0
technical_depth_score = 88 * 0.20  # 17.6

overall_score = 17.0 + 11.25 + 12.0 + 18.0 + 7.0 + 17.6 = 82.85
```

## 🤖 **AI Integration Architecture**

### **AIInterviewSession Model**
```python
class AIInterviewSession(models.Model):
    session = models.OneToOneField(InterviewSession, on_delete=models.CASCADE)
    llm_model = models.CharField(max_length=50, default='gpt-4')
    conversation_history = models.JSONField(default=list)
    current_question_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
```

**Purpose**: Manages AI-powered interview sessions with conversation history and question progression.

### **AI-Ready Features**
1. **LLM Integration**: Ready for OpenAI/Claude API integration
2. **Conversation Management**: Structured AI interview flow
3. **Question Progression**: Dynamic question selection based on responses
4. **Response Analysis**: AI-powered candidate evaluation
5. **Bias Detection**: Automated bias identification

## 📈 **Analytics & Insights**

### **InterviewAnalytics Model**
```python
class InterviewAnalytics(models.Model):
    session = models.OneToOneField(InterviewSession, on_delete=models.CASCADE)
    total_questions_asked = models.IntegerField(default=0)
    total_time_spent = models.IntegerField(default=0)  # Minutes
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2)
    communication_score = models.DecimalField(max_digits=5, decimal_places=2)
    problem_solving_score = models.DecimalField(max_digits=5, decimal_places=2)
    technical_depth_score = models.DecimalField(max_digits=5, decimal_places=2)
    recommendations = models.TextField()
```

### **Analytics Features**
- **Performance Tracking**: Detailed competency scoring
- **Interview Insights**: AI-generated summaries
- **Bias Reports**: Detailed bias analysis
- **Predictive Analytics**: Job success prediction
- **Time Analysis**: Question timing and efficiency

## 🎨 **Frontend Implementation**

### **Competency Management UI**
```
CompetencyPage.jsx
├── CompetencyFrameworkList.jsx (30KB, 852 lines)
├── CompetencyList.jsx (16KB, 469 lines)
└── InterviewTemplateList.jsx (15KB, 424 lines)
```

### **Key Features**
- ✅ **Framework Management**: Create/edit competency frameworks
- ✅ **Competency Editor**: Add/modify competencies with evaluation criteria
- ✅ **Template Builder**: Design interview templates with questions
- ✅ **Question Bank**: Behavioral questions with STAR/CAR structure
- ✅ **Weightage System**: Configurable importance for each competency
- ✅ **Detailed Views**: Expandable cards with full information
- ✅ **Real-time Updates**: Live data synchronization

## 🔧 **API Architecture**

### **Core Endpoints**
```
GET    /api/competency-frameworks/           # List all frameworks
GET    /api/competencies/                    # List competencies with filtering
GET    /api/interview-templates/             # List interview templates
POST   /api/interview-sessions/              # Create interview sessions
POST   /api/ai-interview-sessions/           # Start AI-powered interviews
GET    /api/interview-analytics/             # Get interview analytics
POST   /api/framework-recommendations/       # AI framework recommendations
```

### **Advanced Features**
- **Framework Recommendations**: AI suggests frameworks based on job descriptions
- **Analytics Dashboard**: Interview performance metrics
- **Bias Detection**: AI-powered bias analysis in responses
- **Scoring Algorithms**: Weighted competency evaluation

## 🎯 **Key Differentiators**

### **1. Bias-Resistant Design**
- **Structured Evaluation**: Standardized criteria for each competency
- **STAR/CAR Methodology**: Behavioral interviewing reduces bias
- **Transparent Scoring**: Clear evaluation criteria and weightage
- **Diverse Question Types**: Multiple assessment methods

### **2. AI-Ready Architecture**
- **LLM Integration**: Ready for OpenAI/Claude integration
- **Conversation Management**: Structured AI interview flow
- **Response Analysis**: AI-powered candidate evaluation
- **Bias Detection**: Automated bias identification

### **3. Comprehensive Analytics**
- **Performance Tracking**: Detailed competency scoring
- **Interview Insights**: AI-generated summaries
- **Bias Reports**: Detailed bias analysis
- **Predictive Analytics**: Job success prediction

## 📊 **Sample Data Structure**

### **Python Developer Framework**
```json
{
  "name": "Python Developer - Mid Level",
  "technology": "Python",
  "level": "mid",
  "competencies": [
    {
      "title": "Problem Solving",
      "weightage": 20.0,
      "evaluation_criteria": [
        "Demonstrates structured thinking",
        "Breaks down problems into sub-tasks",
        "Can debug complex issues independently",
        "Shows analytical approach to problem-solving"
      ],
      "sample_question": "Tell me about a time when you faced a complex technical problem. How did you approach it?"
    },
    {
      "title": "Communication",
      "weightage": 15.0,
      "evaluation_criteria": [
        "Explains technical concepts clearly",
        "Adapts communication style to audience",
        "Provides context and background",
        "Uses appropriate technical depth"
      ],
      "sample_question": "Describe a time you had to explain a technical concept to a non-technical stakeholder."
    }
  ]
}
```

## 🚀 **AI Implementation Roadmap**

### **Phase 1: LLM Integration (Weeks 1-2)**
- **OpenAI/Claude Integration**: Connect to advanced LLMs
- **Prompt Engineering**: Design prompts for competency-based questions
- **Response Analysis**: AI-powered candidate response evaluation
- **Context Management**: Maintain interview context and flow

### **Phase 2: AI Interview Engine (Weeks 3-4)**
- **Dynamic Question Generation**: Generate questions based on competency frameworks
- **Real-time Response Analysis**: Evaluate candidate answers using AI
- **Follow-up Questions**: Intelligent follow-up based on previous responses
- **Bias Detection**: AI-powered bias detection in responses

### **Phase 3: Interview Interface (Weeks 5-6)**
- **Video/Audio Integration**: Real-time interview capabilities
- **Chat Interface**: Text-based interview option
- **Recording & Analysis**: Interview recording with AI analysis
- **Candidate Experience**: Smooth, professional interview flow

### **Phase 4: Advanced Analytics (Weeks 7-8)**
- **Interview Insights**: AI-generated interview summaries
- **Competency Scoring**: Automated competency assessment
- **Bias Reports**: Detailed bias analysis and recommendations
- **Predictive Analytics**: Job success prediction models

## 🔮 **Future Enhancements**

### **Advanced AI Features**
- **Emotional Intelligence**: AI-powered EQ assessment
- **Cultural Fit Analysis**: Cultural compatibility assessment
- **Skills Gap Analysis**: Personalized development recommendations
- **Continuous Learning**: AI that improves with each interview

### **Enterprise Features**
- **Multi-tenant Architecture**: Support for multiple organizations
- **Advanced Security**: SOC 2 compliance and data encryption
- **Integration Ecosystem**: ATS, calendar, email integrations
- **Custom Branding**: White-label capabilities

## 📝 **Conclusion**

The Yogya Competency Framework is a **comprehensive, bias-resistant, AI-ready system** that transforms traditional hiring from resume-based to competency-based evaluation. With its structured STAR/CAR methodology, weighted evaluation system, and AI-ready architecture, it provides a solid foundation for building an intelligent, fair, and effective hiring platform.

**Key Strengths**:
- ✅ **Bias-Resistant Design**: Structured evaluation reduces unconscious bias
- ✅ **AI-Ready Architecture**: Perfect foundation for LLM integration
- ✅ **Comprehensive Analytics**: Detailed insights and performance tracking
- ✅ **Scalable Design**: Supports multiple frameworks and organizations
- ✅ **Professional UI**: Complete frontend implementation

**Ready for AI Integration**: The framework is perfectly designed for AI implementation with structured data, clear evaluation criteria, and comprehensive session management.

---

**Yogya - Beyond Resumes. Towards Real Potential.** 🚀

*Last Updated: August 4, 2025*
*Status: Complete Framework - Ready for AI Integration* 