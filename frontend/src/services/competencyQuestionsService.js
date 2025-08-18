import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

class CompetencyQuestionsService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get competency questions screen data
  async getCompetencyQuestionsScreen(sessionId) {
    try {
      const response = await this.api.get(`/api/interview/sessions/${sessionId}/competency-questions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching competency questions screen:', error);
      throw error;
    }
  }

  // Mark question as answered
  async markQuestionAnswered(sessionId, questionId) {
    try {
      const response = await this.api.post(`/api/interview/sessions/${sessionId}/mark-answered/`, {
        question_id: questionId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking question answered:', error);
      throw error;
    }
  }

  // Score a competency
  async scoreCompetency(sessionId, competencyId, score) {
    try {
      const response = await this.api.post(`/api/interview/sessions/${sessionId}/score-competency/`, {
        competency_id: competencyId,
        score: score
      });
      return response.data;
    } catch (error) {
      console.error('Error scoring competency:', error);
      throw error;
    }
  }

  // Add follow-up question
  async addFollowUpQuestion(sessionId, questionId, followUpQuestion) {
    try {
      const response = await this.api.post(`/api/interview/sessions/${sessionId}/add-followup/`, {
        question_id: questionId,
        follow_up_question: followUpQuestion
      });
      return response.data;
    } catch (error) {
      console.error('Error adding follow-up question:', error);
      throw error;
    }
  }

  // Get interview progress
  async getInterviewProgress(sessionId) {
    try {
      const response = await this.api.get(`/api/interview/sessions/${sessionId}/progress/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interview progress:', error);
      throw error;
    }
  }

  // Start interview session
  async startInterview(sessionId) {
    try {
      const response = await this.api.post(`/api/interview/sessions/${sessionId}/start/`);
      return response.data;
    } catch (error) {
      console.error('Error starting interview:', error);
      throw error;
    }
  }

  // End interview session
  async endInterview(sessionId) {
    try {
      const response = await this.api.post(`/api/interview/sessions/${sessionId}/end/`);
      return response.data;
    } catch (error) {
      console.error('Error ending interview:', error);
      throw error;
    }
  }

  // Get interview session details
  async getInterviewSession(sessionId) {
    try {
      const response = await this.api.get(`/api/interview/sessions/${sessionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interview session:', error);
      throw error;
    }
  }
}

export default new CompetencyQuestionsService();
