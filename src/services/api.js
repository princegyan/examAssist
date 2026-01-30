import axios from 'axios'
import API_CONFIG from '../config/apiConfig'

const API_BASE = API_CONFIG.baseURL

// Create axios instance with timeout
const api = axios.create({
  baseURL: API_BASE,
  timeout: API_CONFIG.timeout,
})

// Test all endpoints
export const testApiEndpoints = async () => {
  const results = []

  try {
    const response = await api.get('/health')
    results.push({
      endpoint: 'GET /health',
      status: '✅ WORKING',
      data: 'Server is running',
    })
  } catch (err) {
    results.push({
      endpoint: 'GET /health',
      status: '❌ FAILED',
      error: err.message,
    })
  }

  // Test 2: GET /api/exam/list
  try {
    const response = await api.get('/api/exam/list')
    results.push({
      endpoint: 'GET /api/exam/list',
      status: '✅ WORKING',
      data: `Found ${response.data.exams?.length || 0} exams`,
    })
  } catch (err) {
    results.push({
      endpoint: 'GET /api/exam/list',
      status: '❌ FAILED',
      error: err.message,
    })
  }

  // Test 3: GET /api/exam/stats
  try {
    const response = await api.get('/api/exam/stats')
    results.push({
      endpoint: 'GET /api/exam/stats',
      status: '✅ WORKING',
      data: `Total exams: ${response.data.totalExams || 0}`,
    })
  } catch (err) {
    results.push({
      endpoint: 'GET /api/exam/stats',
      status: '❌ FAILED',
      error: err.message,
    })
  }

  return results
}

// Get all exams
export const getExams = async () => {
  try {
    const response = await api.get('/api/exam/list')
    return { success: true, data: response.data.exams }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Create exam
export const createExam = async (examCode) => {
  try {
    const response = await api.post('/api/exam/create', { examCode })
    return { success: true, data: response.data }
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message }
  }
}

// Upload question
export const uploadQuestion = async (examCode, imageFile) => {
  try {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await api.post(`/api/exam/${examCode}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return { success: true, data: response.data }
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message }
  }
}

// Get questions for exam
export const getQuestions = async (examCode) => {
  try {
    const response = await api.get(`/api/exam/${examCode}/questions`)
    return { success: true, data: response.data.questions }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Compare image
export const compareImage = async (imageFile, textThreshold = 0.55, imageThreshold = 0.55) => {
  try {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('textThreshold', textThreshold)
    formData.append('imageThreshold', imageThreshold)

    const response = await api.post('/api/exam/compare', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return { success: true, data: response.data }
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message }
  }
}

// Get statistics
export const getStats = async () => {
  try {
    const response = await api.get('/api/exam/stats')
    return { success: true, data: response.data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export default api
