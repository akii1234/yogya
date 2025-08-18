# Contributing to Yogya

## 🚀 **Welcome Contributors!**

Thank you for your interest in contributing to **Yogya** - the AI-powered interview and recruitment platform. We welcome contributions from developers, designers, and domain experts.

## 🎯 **How to Contribute**

### **1. Report Bugs**
- Use the [GitHub Issues](https://github.com/your-org/yogya/issues) page
- Include detailed steps to reproduce
- Provide error messages and stack traces
- Mention your environment (OS, Python version, etc.)

### **2. Suggest Features**
- Create a feature request issue
- Describe the use case and benefits
- Include mockups if applicable
- Discuss implementation approach

### **3. Submit Code**
- Fork the repository
- Create a feature branch
- Make your changes
- Add tests
- Submit a pull request

## 🛠 **Development Setup**

### **Prerequisites**
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### **Local Development**
```bash
# Clone the repository
git clone https://github.com/your-org/yogya.git
cd yogya

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8001

# Frontend setup
cd ../frontend
npm install
npm run dev
```

### **Testing**
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test

# Run all tests
npm run test:all
```

## 📝 **Code Style Guidelines**

### **Python (Backend)**
- Follow PEP 8 style guide
- Use type hints where appropriate
- Write docstrings for functions and classes
- Keep functions small and focused

```python
def calculate_match_score(candidate_skills: List[str], job_skills: List[str]) -> float:
    """
    Calculate match score between candidate and job skills.
    
    Args:
        candidate_skills: List of candidate's skills
        job_skills: List of required job skills
        
    Returns:
        float: Match score between 0 and 100
    """
    # Implementation here
    pass
```

### **JavaScript/React (Frontend)**
- Use ESLint and Prettier
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling

```javascript
const JobCard = ({ job, onApply }) => {
  const [loading, setLoading] = useState(false);
  
  const handleApply = async () => {
    setLoading(true);
    try {
      await onApply(job.id);
    } catch (error) {
      console.error('Application failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      {/* Component JSX */}
    </Card>
  );
};
```

### **CSS/Styling**
- Use Material-UI components
- Follow HSBC branding guidelines
- Use Apple system font
- Implement responsive design

## 🧪 **Testing Guidelines**

### **Backend Testing**
- Write unit tests for all functions
- Test API endpoints
- Mock external dependencies
- Achieve >80% code coverage

```python
class TestMatchScoring(TestCase):
    def test_calculate_match_score(self):
        candidate_skills = ['Python', 'Django']
        job_skills = ['Python', 'React']
        
        score = calculate_match_score(candidate_skills, job_skills)
        
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 100)
```

### **Frontend Testing**
- Test component rendering
- Test user interactions
- Mock API calls
- Test error scenarios

```javascript
describe('JobCard', () => {
  it('renders job information correctly', () => {
    const job = {
      id: 1,
      title: 'Python Developer',
      company: 'Tech Corp'
    };
    
    render(<JobCard job={job} onApply={jest.fn()} />);
    
    expect(screen.getByText('Python Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });
});
```

## 🔄 **Pull Request Process**

### **1. Create Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

### **2. Make Changes**
- Write clean, documented code
- Add tests for new functionality
- Update documentation if needed
- Follow the existing code style

### **3. Commit Changes**
```bash
git add .
git commit -m "feat: add amazing feature

- Add new API endpoint for detailed analysis
- Implement frontend component for results display
- Add comprehensive test coverage
- Update documentation"
```

### **4. Push and Create PR**
```bash
git push origin feature/amazing-feature
```

### **5. Pull Request Guidelines**
- Provide clear description of changes
- Include screenshots for UI changes
- Link related issues
- Request reviews from maintainers

## 📚 **Documentation**

### **Code Documentation**
- Document all public APIs
- Include usage examples
- Update README files
- Add inline comments for complex logic

### **User Documentation**
- Update user guides for new features
- Add troubleshooting steps
- Include screenshots and videos
- Maintain API documentation

## 🎨 **Design Guidelines**

### **UI/UX Principles**
- Desktop-first design approach
- Use HSBC color scheme
- Implement Apple system font
- Focus on accessibility

### **Component Design**
- Reusable and composable components
- Consistent spacing and typography
- Responsive design patterns
- Loading and error states

## 🔒 **Security Guidelines**

### **Code Security**
- Validate all user inputs
- Sanitize file uploads
- Use parameterized queries
- Implement proper authentication

### **Data Privacy**
- Follow GDPR guidelines
- Encrypt sensitive data
- Implement data retention policies
- Secure API endpoints

## 🚀 **Areas for Contribution**

### **High Priority**
- [ ] Improve AI model integration
- [ ] Add more coding questions
- [ ] Enhance resume parsing accuracy
- [ ] Implement real-time notifications
- [ ] Add mobile app support

### **Medium Priority**
- [ ] Add more job matching algorithms
- [ ] Implement advanced analytics
- [ ] Create interview scheduling system
- [ ] Add multi-language support
- [ ] Improve performance optimization

### **Low Priority**
- [ ] Add dark mode theme
- [ ] Implement social features
- [ ] Create browser extension
- [ ] Add integration with job boards
- [ ] Implement video interview features

## 🤝 **Community Guidelines**

### **Code of Conduct**
- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow project guidelines

### **Communication**
- Use clear and concise language
- Ask questions when unsure
- Share knowledge and resources
- Be patient with newcomers

## 📞 **Getting Help**

### **Resources**
- [Documentation](docs/)
- [API Reference](backend/API_DOCUMENTATION.md)
- [User Guide](docs/USER_GUIDE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### **Contact**
- **Issues**: [GitHub Issues](https://github.com/your-org/yogya/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/yogya/discussions)
- **Email**: django.devakhil21@gmail.com

## 🏆 **Recognition**

### **Contributor Levels**
- **Newcomer**: First contribution
- **Regular**: 5+ contributions
- **Core**: 20+ contributions
- **Maintainer**: Significant contributions and leadership

### **Recognition Benefits**
- Contributor profile on website
- Special badges and recognition
- Early access to new features
- Invitation to contributor events

---

**Thank you for contributing to Yogya!** 🚀

*Together, we're building the future of AI-powered hiring.* 