/**
 * API Service
 * Handles all backend API calls for the OCR Exam Comparison system
 */

import API_CONFIG from '../config/apiConfig';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...API_CONFIG.headers,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request with JSON body
   */
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * POST request with FormData (for file uploads)
   */
  postFormData(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type with boundary
    });
  }

  /**
   * DELETE request
   */
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ============================================
  // EXAM CODE ENDPOINTS
  // ============================================

  /**
   * Create a new exam code
   * POST /api/exam/create
   */
  createExamCode(examCode) {
    return this.post('/api/exam/create', { examCode });
  }

  /**
   * Get all exam codes
   * GET /api/exam/list
   */
  listExamCodes() {
    return this.get('/api/exam/list');
  }

  // ============================================
  // QUESTION ENDPOINTS
  // ============================================

  /**
   * Upload a question to an exam
   * POST /api/exam/:examCode/upload
   */
  uploadQuestion(examCode, file) {
    const formData = new FormData();
    formData.append('image', file);
    return this.postFormData(`/api/exam/${examCode}/upload`, formData);
  }

  /**
   * Get all questions for an exam code
   * GET /api/exam/:examCode/questions
   */
  getQuestionsForExam(examCode) {
    return this.get(`/api/exam/${examCode}/questions`);
  }

  /**
   * Delete a question
   * DELETE /api/exam/question/:questionId
   */
  deleteQuestion(questionId) {
    return this.delete(`/api/exam/question/${questionId}`);
  }

  // ============================================
  // COMPARISON ENDPOINT (CORE FEATURE)
  // ============================================

  /**
   * Compare an image against all stored questions
   * Performs dual matching (text + image similarity)
   * POST /api/exam/compare
   */
  compareImage(file, textThreshold = 0.65, imageThreshold = 0.65) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('textThreshold', textThreshold);
    formData.append('imageThreshold', imageThreshold);
    return this.postFormData('/api/exam/compare', formData);
  }

  // ============================================
  // STATISTICS ENDPOINT
  // ============================================

  /**
   * Get system statistics
   * GET /api/exam/stats
   */
  getStatistics() {
    return this.get('/api/exam/stats');
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  /**
   * Check if backend is running
   * GET /health
   */
  healthCheck() {
    return this.get('/health');
  }
}

// Export singleton instance
export default new ApiService();
