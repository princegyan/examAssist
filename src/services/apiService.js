/**
 * API Service
 * Handles all backend API calls for the OCR Exam Comparison system
 * Includes intelligent caching for improved performance
 */

import API_CONFIG from '../config/apiConfig';
import cacheService, { CACHE_TTL } from './cacheService';

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
   * GET request with optional caching
   */
  async get(endpoint, { useCache = false, ttl = CACHE_TTL.MEDIUM, forceRefresh = false } = {}) {
    if (useCache && !forceRefresh) {
      const cacheKey = cacheService.generateKey(endpoint);
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const data = await this.request(endpoint, { method: 'GET' });

    if (useCache) {
      const cacheKey = cacheService.generateKey(endpoint);
      cacheService.set(cacheKey, data, ttl);
    }

    return data;
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
   * DELETE request with cache invalidation
   */
  delete(endpoint, invalidatePatterns = []) {
    const result = this.request(endpoint, { method: 'DELETE' });
    // Invalidate related caches
    invalidatePatterns.forEach(pattern => cacheService.clearPattern(pattern));
    return result;
  }

  // ============================================
  // EXAM CODE ENDPOINTS
  // ============================================

  /**
   * Create a new exam code
   * POST /api/exam/create
   */
  createExamCode(examCode) {
    // Invalidate exam list cache when creating new exam
    cacheService.clearPattern('/api/exam/list');
    cacheService.clearPattern('/api/exam/stats');
    return this.post('/api/exam/create', { examCode });
  }

  /**
   * Get all exam codes (cached for 5 minutes)
   * GET /api/exam/list
   */
  listExamCodes(forceRefresh = false) {
    return this.get('/api/exam/list', { 
      useCache: true, 
      ttl: CACHE_TTL.MEDIUM,
      forceRefresh 
    });
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
    // Invalidate related caches
    cacheService.clearPattern(`/api/exam/${examCode}`);
    cacheService.clearPattern('/api/exam/stats');
    return this.postFormData(`/api/exam/${examCode}/upload`, formData);
  }

  /**
   * Get all questions for an exam code (cached for 2 minutes)
   * GET /api/exam/:examCode/questions
   */
  getQuestionsForExam(examCode, forceRefresh = false) {
    return this.get(`/api/exam/${examCode}/questions`, {
      useCache: true,
      ttl: CACHE_TTL.SHORT * 4, // 2 minutes
      forceRefresh
    });
  }

  /**
   * Delete a question
   * DELETE /api/exam/question/:questionId
   */
  deleteQuestion(questionId, examCode = null) {
    // Invalidate related caches
    if (examCode) {
      cacheService.clearPattern(`/api/exam/${examCode}`);
    }
    cacheService.clearPattern('/api/exam/stats');
    return this.delete(`/api/exam/question/${questionId}`);
  }

  // ============================================
  // COMPARISON ENDPOINT (CORE FEATURE)
  // ============================================

  /**
   * Compare an image against all stored questions
   * Performs dual matching (text + image similarity)
   * POST /api/exam/compare
   * Note: Not cached as each comparison is unique
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
   * Get system statistics (cached for 1 minute)
   * GET /api/exam/stats
   */
  getStatistics(forceRefresh = false) {
    return this.get('/api/exam/stats', {
      useCache: true,
      ttl: CACHE_TTL.SHORT * 2, // 1 minute
      forceRefresh
    });
  }

  // ============================================
  // PDF EXPORT ENDPOINTS
  // ============================================

  /**
   * Export entire exam to PDF
   * POST /api/exam/:examCode/export-pdf
   * Returns: Binary PDF blob
   */
  async exportExamToPDF(examCode) {
    if (!examCode) throw new Error('examCode is required');
    
    try {
      const response = await fetch(`${this.baseURL}/api/exam/${examCode}/export-pdf`, {
        method: 'POST',
        headers: API_CONFIG.headers,
        timeout: 120000
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error(`API Error [export-pdf]:`, error);
      throw error;
    }
  }

  /**
   * Convert selected images to PDF
   * POST /api/exam/:examCode/images-to-pdf
   * Body: { imageUrls: [...], title?: "..." }
   * Returns: Binary PDF blob
   */
  async imagesToPDF(examCode, imageUrls, title = null) {
    if (!examCode) throw new Error('examCode is required');
    if (!imageUrls || imageUrls.length === 0) throw new Error('imageUrls array is required');
    
    try {
      const response = await fetch(`${this.baseURL}/api/exam/${examCode}/images-to-pdf`, {
        method: 'POST',
        headers: {
          ...API_CONFIG.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrls,
          title: title || `${examCode} - Selected Questions`
        }),
        timeout: 120000
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error(`API Error [images-to-pdf]:`, error);
      throw error;
    }
  }

  /**
   * Download PDF blob as file
   * @param {Blob} blob - PDF blob
   * @param {string} filename - Download filename
   */
  downloadPDF(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  /**
   * Check if backend is running (cached for 30 seconds)
   * GET /health
   */
  healthCheck() {
    return this.get('/health', {
      useCache: true,
      ttl: CACHE_TTL.SHORT
    });
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  /**
   * Clear all cached data
   */
  clearCache() {
    cacheService.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheService.getStats();
  }

  /**
   * Invalidate specific cache pattern
   */
  invalidateCache(pattern) {
    cacheService.clearPattern(pattern);
  }
}

// Export singleton instance
export default new ApiService();
