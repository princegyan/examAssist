import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '../components/Button'
import API_CONFIG from '../config/apiConfig'

const API_BASE = API_CONFIG.baseURL

export default function ExamList({ onSelectExam, onNavigate }) {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newExamCode, setNewExamCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const itemsPerPage = 15

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/api/exam/list`)
      // Sort exams by creation date (newest first)
      const sortedExams = response.data.exams.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)
        return dateB - dateA
      })
      setExams(sortedExams)
      setCurrentPage(1) // Reset to first page when exams are fetched
    } catch (err) {
      setError('Failed to fetch exams: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExam = async (e) => {
    e.preventDefault()
    if (!newExamCode.trim()) return

    try {
      setCreating(true)
      setError(null)
      
      // Check if exam with this code already exists
      const existingExam = exams.find(exam => exam.examCode.toLowerCase() === newExamCode.trim().toLowerCase())
      
      if (existingExam) {
        // If exam exists, navigate to upload section for it
        setNewExamCode('')
        setCreating(false)
        onSelectExam(existingExam.examCode)
        if (onNavigate) {
          onNavigate('upload')
        }
        return
      }
      
      // Otherwise, create new exam
      await axios.post(`${API_BASE}/api/exam/create`, { examCode: newExamCode })
      setNewExamCode('')
      await fetchExams()
    } catch (err) {
      setError('Failed to create exam: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  // Filter exams based on search query
  const filteredExams = exams.filter(exam =>
    exam.examCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedExams = filteredExams.slice(startIndex, endIndex)

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Blockchain-Style Blue Gradient Header */}
      <div className="relative mb-8 rounded-3xl overflow-hidden" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 25%, #2563eb 50%, #3b82f6 75%, #60a5fa 100%)'}}>
        <div className="relative z-10 p-8 md:p-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-blue-200 text-sm font-medium">Live Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>T24 Dumps Dashboard</h1>
              <p className="text-blue-200 text-lg">Manage your dumps and track progress</p>
            </div>
            {/* 3D Cube Illustration */}
            <div className="hidden lg:block">
              <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Glowing orbs */}
                <circle cx="30" cy="40" r="20" fill="url(#blueGlow1)" opacity="0.6"/>
                <circle cx="150" cy="30" r="15" fill="url(#blueGlow2)" opacity="0.5"/>
                <circle cx="160" cy="130" r="25" fill="url(#blueGlow1)" opacity="0.4"/>
                {/* 3D Cube */}
                <path d="M90 30 L140 55 L140 105 L90 130 L40 105 L40 55 Z" fill="url(#cubeGradient)" opacity="0.9"/>
                <path d="M90 30 L140 55 L90 80 L40 55 Z" fill="white" opacity="0.3"/>
                <path d="M90 80 L140 55 L140 105 L90 130 Z" fill="white" opacity="0.15"/>
                <path d="M90 80 L40 55 L40 105 L90 130 Z" fill="white" opacity="0.05"/>
                {/* Document Icon on cube */}
                <rect x="70" y="60" width="40" height="50" rx="4" fill="white" opacity="0.9"/>
                <line x1="78" y1="75" x2="102" y2="75" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                <line x1="78" y1="85" x2="98" y2="85" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"/>
                <line x1="78" y1="95" x2="95" y2="95" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"/>
                {/* Floating particles */}
                <circle cx="60" cy="25" r="3" fill="#60a5fa"/>
                <circle cx="130" cy="140" r="2" fill="#93c5fd"/>
                <circle cx="25" cy="100" r="2" fill="#60a5fa"/>
                <defs>
                  <radialGradient id="blueGlow1">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="blueGlow2">
                    <stop offset="0%" stopColor="#60a5fa"/>
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
                  </radialGradient>
                  <linearGradient id="cubeGradient" x1="40" y1="30" x2="140" y2="130">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#1d4ed8"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'}}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
              <p className="text-sm text-gray-500">Total Exams</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'}}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{exams.reduce((sum, e) => sum + (e.questionCount || 0), 0)}</p>
              <p className="text-sm text-gray-500">Questions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)'}}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{exams.filter(e => e.questionCount > 0).length}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)'}}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {exams.length > 0 ? Math.round((exams.filter(e => e.questionCount > 0).length / exams.length) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500">Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Exam Section - Blockchain Blue */}
      <div className="relative rounded-2xl p-6 mb-8 text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2563EB 100%)'}}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Create New Dump</h2>
            <p className="text-blue-200 text-sm">Add a new dump name to start uploading questions</p>
          </div>
          <form onSubmit={handleCreateExam} className="flex gap-3 flex-1 max-w-lg">
            <input
              type="text"
              value={newExamCode}
              onChange={(e) => setNewExamCode(e.target.value)}
              placeholder="Enter dump name [ examCode - Score - Name]..."
              className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 focus:outline-none focus:bg-white/20 focus:border-cyan-400/50 transition-all backdrop-blur-sm"
            />
            <Button
              type="submit"
              disabled={creating || !newExamCode.trim()}
              variant="secondary"
              className="bg-cyan-400 text-slate-900 hover:bg-cyan-300 border-0 shadow-lg shadow-cyan-400/25 font-semibold"
            >
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </form>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Exam List Section */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="px-6 py-6 border-b border-blue-50" style={{background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)'}}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h.01a1 1 0 000-2H9z"/>
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a1 1 0 001 1h12a1 1 0 001-1V6a2 2 0 00-2-2H4zm12 12H4a2 2 0 00-2 2v2a1 1 0 001 1h14a1 1 0 001-1v-2a2 2 0 00-2-2z" clipRule="evenodd"/>
                  </svg>
                  Your T24 Dumps
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-semibold text-gray-700">{exams.length}</span> exam{exams.length !== 1 ? 's' : ''} total
                  {searchQuery && <span className="ml-2 text-blue-600 font-medium">• {filteredExams.length} found</span>}
                </p>
              </div>
              <button
                onClick={fetchExams}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium text-sm flex items-center gap-2 rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 right-12 pr-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-blue-500 transition-colors group-focus-within:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search exams by code or name..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-all placeholder-gray-500 text-gray-900 font-medium shadow-sm hover:border-blue-300"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setCurrentPage(1)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading exams...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-16">
              {/* Empty State Illustration - Blockchain Blue */}
              <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
                <path d="M30 45 L30 115 Q30 120 35 120 L145 120 Q150 120 150 115 L150 55 Q150 50 145 50 L90 50 L80 40 L35 40 Q30 40 30 45Z" fill="#DBEAFE"/>
                <path d="M30 55 L150 55 L150 115 Q150 120 145 120 L35 120 Q30 120 30 115 Z" fill="#EFF6FF"/>
                <circle cx="90" cy="85" r="20" fill="#2563EB" opacity="0.15"/>
                <line x1="90" y1="75" x2="90" y2="95" stroke="#2563EB" strokeWidth="3" strokeLinecap="round"/>
                <line x1="80" y1="85" x2="100" y2="85" stroke="#2563EB" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="45" cy="30" r="6" fill="#3B82F6" opacity="0.6"/>
                <circle cx="140" cy="25" r="4" fill="#60A5FA" opacity="0.8"/>
                <rect x="155" y="60" width="10" height="10" rx="2" fill="#2563EB" opacity="0.4" transform="rotate(15 155 60)"/>
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No exams yet</h3>
              <p className="text-gray-500 text-sm">Create your first exam to get started</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-16">
              <svg width="140" height="120" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
                <circle cx="70" cy="55" r="45" fill="#E0E7FF" opacity="0.5"/>
                <path d="M95 75 L110 90" stroke="#6366F1" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="70" cy="55" r="28" fill="none" stroke="#6366F1" strokeWidth="2"/>
                <circle cx="65" cy="50" r="4" fill="#6366F1" opacity="0.6"/>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No exams found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedExams.map((exam, index) => {
                  // Banking & Finance images from Unsplash
                  const bankingImages = [
                    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop', // Financial charts
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', // Business analytics
                    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop', // Stock market
                    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=300&fit=crop', // Crypto/blockchain
                    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop', // Credit cards
                    'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=400&h=300&fit=crop', // Money/currency
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', // Data dashboard
                    'https://images.unsplash.com/photo-1565514020179-026b92b2d369?w=400&h=300&fit=crop', // Bank vault
                    'https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&h=300&fit=crop', // Finance meeting
                    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=300&fit=crop', // Calculator/accounting
                  ]
                  const imageUrl = bankingImages[(startIndex + index) % bankingImages.length]
                  
                  return (
                    <div
                      key={exam._id}
                      onClick={() => onSelectExam(exam.examCode)}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
                    >
                      {/* Card Image from Unsplash */}
                      <div className="h-40 relative overflow-hidden">
                        <img 
                          src={imageUrl}
                          alt="Banking and Finance"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        {/* Question count badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
                            exam.questionCount > 0 
                              ? 'bg-emerald-500/90 text-white' 
                              : 'bg-white/90 text-gray-700'
                          }`}>
                            {exam.questionCount || 0} Questions
                          </span>
                        </div>
                        {/* Status indicator */}
                        <div className="absolute top-3 right-3">
                          <div className={`w-3 h-3 rounded-full ${
                            exam.questionCount > 0 ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        {/* Exam code on image */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-bold text-lg truncate" style={{color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)'}}>{exam.examCode}</h3>
                        </div>
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-5" style={{background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)'}}>
                        <p className="text-sm mb-4" style={{color: '#374151'}}>
                          {exam.questionCount === 0 
                            ? 'Ready to add questions' 
                            : `${exam.questionCount} question${exam.questionCount !== 1 ? 's' : ''} uploaded`}
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                          Created: {new Date(exam.createdAt).toLocaleDateString()}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold group-hover:gap-3 transition-all">
                            <span>Open Exam</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, exams.length)}</span> of <span className="font-semibold">{exams.length}</span> exams
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
