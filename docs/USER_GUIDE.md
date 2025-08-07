# Yogya User Guide

## 🚀 **Welcome to Yogya**

**Yogya** is an AI-powered interview and recruitment platform that revolutionizes the hiring process through intelligent resume analysis, personalized competency assessment, and dynamic interview preparation.

## 👥 **User Roles**

### **🎯 Candidates**
- Job seekers looking for opportunities
- Upload resumes and get AI-powered analysis
- Browse jobs filtered by match scores
- Access personalized interview preparation
- Track application progress

### **🏢 HR Professionals**
- Create and manage job postings
- View candidate analytics and match scores
- Track application funnel and conversions
- Access detailed candidate insights

## 🎯 **Getting Started**

### **For Candidates**

#### **1. Registration & Profile Setup**
1. **Register**: Visit the candidate portal and create an account
2. **Complete Profile**: Fill in basic information (name, email, location)
3. **Upload Resume**: Upload your resume for AI analysis
4. **Review Extracted Data**: Verify and update extracted skills and experience
5. **Profile Completion**: Your profile is now ready for job matching

#### **2. Resume Upload & Analysis**
- **Supported Formats**: PDF, DOCX, DOC, TXT
- **AI Processing**: Automatic skill extraction and experience calculation
- **Data Verification**: Review and edit extracted information
- **Multiple Resumes**: Upload different versions for different roles

#### **3. Job Browsing**
- **Smart Filtering**: Jobs are automatically filtered by match score
- **Match Scores**: See how well you match each position
- **Detailed Views**: Click on jobs for comprehensive information
- **Apply Directly**: Submit applications with cover letters

#### **4. Interview Preparation**
- **Detailed Analysis**: Get comprehensive job-candidate compatibility breakdown
- **AI Insights**: Receive personalized career recommendations
- **Coding Questions**: Practice with personalized coding challenges
- **Interview Guide**: Access tailored interview questions and tips

### **For HR Professionals**

#### **1. Job Management**
1. **Create Jobs**: Add individual job postings with detailed descriptions
2. **Bulk Upload**: Upload multiple jobs using CSV template
3. **Job Analytics**: Track job performance and candidate interest
4. **Status Management**: Activate, deactivate, or edit job postings

#### **2. Candidate Management**
- **Application Tracking**: Monitor all applications and their status
- **Match Analysis**: View detailed candidate-job compatibility scores
- **Resume Review**: Access parsed resume data and extracted skills
- **Status Updates**: Update application status and add notes

#### **3. Analytics Dashboard**
- **Conversion Metrics**: Track application-to-hire funnel
- **Match Quality**: Analyze candidate-job compatibility
- **Performance Insights**: Identify hiring bottlenecks and opportunities

## 🔍 **Detailed Feature Guide**

### **🤖 AI-Powered Resume Analysis**

#### **How It Works**
1. **Upload**: Submit your resume in any supported format
2. **Processing**: AI extracts skills, experience, education, and location
3. **Verification**: Review and edit extracted information
4. **Integration**: Data is used for job matching and recommendations

#### **Extracted Information**
- **Skills**: Technical and soft skills with confidence scores
- **Experience**: Years of experience and seniority level
- **Education**: Degree level and field of study
- **Location**: Geographic information for remote/local matching
- **Contact Info**: Phone, email, and professional details

#### **Example Output**
```json
{
  "extracted_skills": ["Python", "Django", "React", "PostgreSQL"],
  "experience_years": 5,
  "education": "Bachelor's in Computer Science",
  "location": "New York, NY",
  "processing_status": "completed"
}
```

### **🎯 Smart Job Matching**

#### **Match Score Calculation**
- **Skills (40%)**: Technical skill overlap and relevance
- **Experience (30%)**: Years of experience and seniority matching
- **Education (20%)**: Degree level and field alignment
- **Location (10%)**: Geographic compatibility and remote work support

#### **Match Levels**
- **Excellent (85-100%)**: Perfect fit, high chance of success
- **Good (70-84%)**: Strong match, good potential
- **Fair (50-69%)**: Moderate match, some gaps to address
- **Poor (0-49%)**: Significant gaps, not recommended

#### **Remote Work Detection**
- Jobs marked as "Remote" automatically get 100% location match
- Hybrid positions are evaluated based on candidate location
- Local positions require geographic proximity

### **📊 Detailed Analysis**

#### **Skill Analysis**
- **Matched Skills**: Skills that align with job requirements
- **Missing Skills**: Required skills not found in candidate profile
- **Recommendations**: Specific skills to learn for better matching
- **Score Breakdown**: Detailed scoring for each skill category

#### **Experience Analysis**
- **Years Comparison**: Required vs. candidate experience
- **Seniority Level**: Junior, Mid, Senior level matching
- **Bonus Points**: Additional experience beyond requirements
- **Gap Analysis**: Experience shortfalls and recommendations

#### **Education Analysis**
- **Degree Level**: Bachelor's, Master's, PhD matching
- **Field Relevance**: Technical vs. non-technical degree alignment
- **Certifications**: Professional certifications and their impact
- **Continuous Learning**: Ongoing education and training

#### **Location Analysis**
- **Geographic Match**: City, state, country compatibility
- **Remote Support**: Remote work capability assessment
- **Relocation**: Willingness and ability to relocate
- **Time Zone**: Working hours and time zone considerations

### **🧠 AI-Enhanced Insights**

#### **Career Recommendations**
- **Skill Development**: Prioritized learning recommendations
- **Industry Trends**: Current market insights and demands
- **Career Path**: Long-term career development suggestions
- **Salary Insights**: Market-based compensation information

#### **Interview Preparation**
- **Technical Questions**: Role-specific technical challenges
- **Behavioral Questions**: Situation-based behavioral scenarios
- **Questions to Ask**: Intelligent questions for the interviewer
- **Preparation Tips**: Personalized interview strategies

### **💻 Dynamic Coding Questions**

#### **Personalized Selection**
- **Technology Matching**: Questions based on resume skills
- **Experience Level**: Junior, Mid, Senior difficulty adaptation
- **Job Requirements**: Questions aligned with specific role needs
- **Skill Gaps**: Questions targeting areas for improvement

#### **Question Categories**
- **Java**: Core Java, Spring, Hibernate, JUnit
- **Python**: Django, Flask, Data Science, ML
- **JavaScript**: React, Node.js, ES6, TypeScript
- **DevOps**: Docker, Kubernetes, CI/CD, Infrastructure
- **Cloud**: AWS, Azure, GCP, Serverless

#### **Question Features**
- **Difficulty Levels**: Easy, Medium, Hard
- **Time Limits**: Estimated completion times
- **Sample I/O**: Input/output examples
- **Hints**: Progressive hints for guidance
- **Solutions**: Complete code solutions
- **Tags**: Technology and category tags

### **📈 Application Tracking**

#### **Application Status**
- **Applied**: Application submitted successfully
- **Reviewing**: Under initial review
- **Interviewing**: Selected for interview process
- **Offered**: Job offer extended
- **Hired**: Successfully hired
- **Rejected**: Application not selected

#### **Progress Tracking**
- **Timeline**: Application submission and update dates
- **Match Scores**: Current compatibility scores
- **Next Steps**: Recommended actions and timeline
- **Communication**: Status updates and notifications

## 🛠 **Advanced Features**

### **📊 Analytics Dashboard (HR)**

#### **Conversion Metrics**
- **Application Funnel**: Applications → Screening → Interviews → Offers → Hires
- **Conversion Rates**: Percentage success at each stage
- **Time to Hire**: Average days from application to hire
- **Quality Metrics**: Match scores and candidate quality

#### **Performance Insights**
- **Job Performance**: Most successful job postings
- **Source Analysis**: Best candidate sources
- **Skill Gaps**: Common missing skills across candidates
- **Hiring Trends**: Seasonal and market trends

### **🔍 Resume Analyzer**

#### **JD-Resume Matching**
- **Paste Job Description**: Input any job description text
- **Instant Analysis**: Get immediate compatibility score
- **Detailed Breakdown**: Skills, experience, education analysis
- **Improvement Plan**: Specific recommendations for better matching

#### **Use Cases**
- **Job Seekers**: Test resume against specific job descriptions
- **Career Changers**: Identify skill gaps for new roles
- **Students**: Prepare resumes for internship applications
- **Professionals**: Optimize resumes for target positions

### **🔔 Notifications System**

#### **Real-time Updates**
- **Application Status**: Instant status change notifications
- **New Matches**: High-match job recommendations
- **Interview Invites**: Interview scheduling notifications
- **Profile Updates**: Resume processing completion alerts

#### **Notification Types**
- **Email Notifications**: Important updates via email
- **In-app Alerts**: Real-time dashboard notifications
- **SMS Alerts**: Critical updates via text message
- **Push Notifications**: Mobile app notifications (future)

## 📱 **User Interface Guide**

### **🎨 Design Philosophy**
- **Desktop-First**: Optimized for full-screen desktop experience
- **HSBC Branding**: Professional color scheme and typography
- **Apple System Font**: Clean, modern typography
- **Responsive Design**: Works on all screen sizes

### **🧭 Navigation**

#### **Candidate Portal**
- **Dashboard**: Overview of applications and matches
- **Browse Jobs**: Filtered job listings
- **My Applications**: Application tracking
- **My Profile**: Profile management
- **Resume Analyzer**: JD-resume matching tool
- **Notifications**: Real-time updates

#### **HR Portal**
- **Dashboard**: Analytics and overview
- **Job Management**: Create and manage jobs
- **Applications**: Track and manage applications
- **Candidates**: View candidate profiles
- **Analytics**: Detailed performance metrics
- **Settings**: Account and system settings

### **🎯 Key Interactions**

#### **Job Application Process**
1. **Browse**: View filtered job listings
2. **Select**: Click on interesting positions
3. **Analyze**: View detailed match analysis
4. **Apply**: Submit application with cover letter
5. **Track**: Monitor application progress

#### **Resume Upload Process**
1. **Upload**: Drag and drop or select file
2. **Process**: AI analyzes and extracts data
3. **Review**: Verify extracted information
4. **Edit**: Update skills, experience, or contact info
5. **Save**: Complete profile setup

#### **Detailed Analysis Access**
1. **Select Job**: Choose job from browse page
2. **View Analysis**: Access comprehensive breakdown
3. **Explore Tabs**: Detailed Analysis, AI Insights, Interview Prep, Coding Questions
4. **Take Action**: Follow recommendations and prepare

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Resume Upload Problems**
- **File Format**: Ensure file is PDF, DOCX, DOC, or TXT
- **File Size**: Maximum 10MB file size
- **Processing**: Wait for AI analysis to complete
- **Extraction**: Manually edit if AI misses information

#### **Job Matching Issues**
- **No Matches**: Update skills or broaden search criteria
- **Low Scores**: Focus on skill development recommendations
- **Location Issues**: Consider remote opportunities
- **Experience Gaps**: Highlight transferable skills

#### **Application Problems**
- **Submission Errors**: Check internet connection and try again
- **Status Updates**: Contact HR if status doesn't update
- **Cover Letter**: Ensure proper formatting and content
- **Resume Selection**: Choose the most relevant resume

### **Getting Help**

#### **Support Channels**
- **In-app Help**: Use the help icon in the interface
- **Documentation**: Refer to this user guide
- **Email Support**: Contact support@yogya.com
- **Community**: Join user forums and discussions

#### **Best Practices**
- **Keep Profile Updated**: Regularly update skills and experience
- **Use Multiple Resumes**: Create targeted resumes for different roles
- **Monitor Matches**: Check for new high-match opportunities
- **Follow Recommendations**: Implement AI-suggested improvements

## 🚀 **Pro Tips**

### **For Candidates**
- **Optimize Resume**: Use clear, keyword-rich descriptions
- **Update Regularly**: Keep skills and experience current
- **Use Resume Analyzer**: Test against specific job descriptions
- **Follow AI Insights**: Implement career development recommendations
- **Practice Coding**: Use personalized coding questions for preparation

### **For HR Professionals**
- **Detailed Job Descriptions**: Include specific skills and requirements
- **Regular Analytics Review**: Monitor conversion metrics weekly
- **Candidate Communication**: Provide timely status updates
- **Skill Gap Analysis**: Use insights to improve job descriptions
- **Performance Tracking**: Monitor time-to-hire and quality metrics

## 📚 **Additional Resources**

- [API Documentation](../backend/API_DOCUMENTATION.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Sample Data](../sample/)

---

**Yogya** - Empowering smarter hiring decisions through AI-powered competency assessment. 🚀

*Need help? Contact support@yogya.com or check our comprehensive documentation.* 