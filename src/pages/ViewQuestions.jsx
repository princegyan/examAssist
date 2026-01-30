import { useState, useEffect } from 'react'
import axios from 'axios'
import API_CONFIG from '../config/apiConfig'

const API_BASE = API_CONFIG.baseURL

export default function ViewQuestions({ examCode }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchQuestions()
  }, [examCode])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/api/exam/${examCode}/questions`)
      setQuestions(response.data.questions)
    } catch (err) {
      setError('Failed to fetch questions: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Blockchain Blue Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8" style={{background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 25%, #2563EB 50%, #3B82F6 75%, #60A5FA 100%)'}}>
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-blue-200 text-sm font-medium">Question Bank</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Questions</h1>
              <p className="text-blue-200">Viewing {questions.length} questions for exam</p>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl mt-4 w-fit">
                <svg className="w-4 h-4" style={{color: '#22D3EE'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold" style={{color: '#FFFFFF'}}>{examCode}</span>
              </div>
            </div>
            {/* Questions Illustration */}
            <div className="hidden md:block">
              <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="35" width="70" height="55" rx="6" fill="white" opacity="0.2"/>
                <rect x="30" y="25" width="70" height="55" rx="6" fill="white" opacity="0.4"/>
                <rect x="40" y="15" width="70" height="55" rx="6" fill="white" opacity="0.9"/>
                <circle cx="55" cy="32" r="8" fill="#3B82F6"/>
                <text x="55" y="36" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">1</text>
                <line x1="70" y1="28" x2="100" y2="28" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
                <line x1="70" y1="36" x2="95" y2="36" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round"/>
                <line x1="50" y1="52" x2="100" y2="52" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="125" cy="30" r="8" fill="#60A5FA" opacity="0.8"/>
                <text x="125" y="34" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">?</text>
                <circle cx="15" cy="60" r="5" fill="white" opacity="0.3"/>
                <circle cx="130" cy="80" r="4" fill="white" opacity="0.2"/>
              </svg>
            </div>
          </div>
        </div>
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-xl mb-6 flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          {/* Empty State Illustration */}
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
            {/* Empty Document */}
            <rect x="45" y="15" width="70" height="90" rx="8" fill="#F1F5F9"/>
            <rect x="55" y="30" width="30" height="20" rx="4" fill="#E2E8F0"/>
            <line x1="55" y1="60" x2="105" y2="60" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
            <line x1="55" y1="72" x2="95" y2="72" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
            <line x1="55" y1="84" x2="85" y2="84" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
            {/* Question Mark */}
            <circle cx="115" cy="35" r="18" fill="#6366F1" opacity="0.15"/>
            <text x="115" y="42" fill="#6366F1" fontSize="20" fontWeight="bold" textAnchor="middle">?</text>
            {/* Decorative */}
            <circle cx="30" cy="45" r="6" fill="#FCD34D" opacity="0.7"/>
            <circle cx="135" cy="85" r="4" fill="#A78BFA" opacity="0.7"/>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No questions yet</h3>
          <p className="text-gray-500 text-sm">Upload some questions to get started</p>
        </div>
      ) : (
        /* Questions List */
        <div className="space-y-3">
          {questions.map((q, index) => (
            <div 
              key={q._id} 
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-indigo-200 transition-all"
            >
              <button
                onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
                className="w-full px-5 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <span className="font-semibold text-indigo-600 text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Question {index + 1}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {q.extractedTextLength || q.extractedText?.length || 0} chars • {new Date(q.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`transform transition-transform duration-200 ${expandedId === q._id ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {expandedId === q._id && (
                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs font-medium text-gray-500 mb-2">Extracted Text</p>
                  <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-64 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap">
                    {q.extractedText || 'No text extracted'}
                  </div>
                  
                  {q.imageUrl && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Original Image</p>
                      <img 
                        src={q.imageUrl.startsWith('http') ? q.imageUrl : `${API_BASE}${q.imageUrl}`}
                        alt={`Question ${index + 1}`}
                        className="max-h-48 rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg">ID: {q._id}</span>
                    {q.textLength && (
                      <span className="bg-gray-100 px-3 py-1.5 rounded-lg">Length: {q.textLength} chars</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
