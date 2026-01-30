import { useState } from 'react'
import axios from 'axios'
import { Button } from '../components/Button'
import API_CONFIG from '../config/apiConfig'

const API_BASE = API_CONFIG.baseURL

export default function CompareImage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [comparing, setComparing] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [textThreshold, setTextThreshold] = useState(0.65)
  const [imageThreshold, setImageThreshold] = useState(0.65)
  const [selectedMatchImage, setSelectedMatchImage] = useState(null)
  const [showRawResponse, setShowRawResponse] = useState(false)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
      setError(null)
      setResults(null)
    }
  }

  const handleCompare = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select an image')
      return
    }

    try {
      setComparing(true)
      setError(null)

      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('textThreshold', textThreshold)
      formData.append('imageThreshold', imageThreshold)

      const response = await axios.post(
        `${API_BASE}/api/exam/compare`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      // store response data; use optional chaining in render to avoid crashes
      console.log('Compare response', response.data)
      setResults(response.data)
    } catch (err) {
      console.error('Compare error', err)
      setError(err.response?.data?.error || 'Comparison failed: ' + err.message)
    } finally {
      setComparing(false)
    }
  }

  // Derive confidence level from similarity score
  const getConfidenceLevel = (similarity) => {
    if (similarity >= 0.9) return 'HIGH'
    if (similarity >= 0.7) return 'MEDIUM'
    return 'LOW'
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'HIGH': return 'text-emerald-600 bg-emerald-50 border border-emerald-100'
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border border-amber-100'
      default: return 'text-red-600 bg-red-50 border border-red-100'
    }
  }

  // Get matches array (handle both 'matches' and 'results' field names)
  const matchesArray = results?.matches || results?.results || []
  const totalMatches = results?.totalMatches ?? results?.report?.totalMatches ?? matchesArray.length
  const highConfidenceCount = matchesArray.filter(m => (m.similarity ?? m.textSimilarityScore ?? 0) >= 0.9).length
  const mediumConfidenceCount = matchesArray.filter(m => {
    const sim = m.similarity ?? m.textSimilarityScore ?? 0
    return sim >= 0.7 && sim < 0.9
  }).length

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Blockchain Blue Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8" style={{background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 25%, #2563EB 50%, #3B82F6 75%, #60A5FA 100%)'}}>
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-blue-200 text-sm font-medium">AI-Powered Analysis</span>
                <span className="bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 text-xs font-medium px-2 py-0.5 rounded-full">Smart Match</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Compare Images</h1>
              <p className="text-blue-200 max-w-md">Find matching questions across all exams using intelligent similarity detection</p>
            </div>
            {/* Compare Illustration */}
            <div className="hidden md:block">
              <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="20" width="50" height="70" rx="6" fill="white" opacity="0.9"/>
                <rect x="18" y="30" width="20" height="15" rx="2" fill="#3B82F6" opacity="0.3"/>
                <line x1="18" y1="52" x2="52" y2="52" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
                <line x1="18" y1="62" x2="45" y2="62" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round"/>
                <line x1="18" y1="72" x2="48" y2="72" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round"/>
                <rect x="100" y="20" width="50" height="70" rx="6" fill="white" opacity="0.9"/>
                <rect x="108" y="30" width="20" height="15" rx="2" fill="#3B82F6" opacity="0.3"/>
                <line x1="108" y1="52" x2="142" y2="52" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
                <line x1="108" y1="62" x2="135" y2="62" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round"/>
                <line x1="108" y1="72" x2="138" y2="72" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round"/>
                <path d="M65 45 L95 45" stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.6"/>
                <path d="M65 60 L95 60" stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.6"/>
                <circle cx="80" cy="52" r="15" fill="#10B981"/>
                <path d="M73 52L77 56L87 46" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="70" cy="95" r="4" fill="#60A5FA" opacity="0.8"/>
                <circle cx="140" cy="15" r="4" fill="#60A5FA" opacity="0.8"/>
              </svg>
            </div>
          </div>
        </div>
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-blue-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl translate-y-1/2"></div>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleCompare} className="space-y-6">
            {/* Dropzone */}
            <div className={`
              border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer
              ${preview 
                ? 'border-indigo-300 bg-indigo-50/50' 
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }
            `}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="compare-file-input"
              />
              <label htmlFor="compare-file-input" className="cursor-pointer block">
                {preview ? (
                  <div className="space-y-4">
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-sm" />
                    <p className="text-indigo-500 text-sm font-medium hover:underline">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Click to upload image for comparison</p>
                      <p className="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Threshold Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold" style={{color: '#1E3A5F'}}>Text Similarity</label>
                  <span className="font-bold text-sm px-2 py-0.5 rounded-md" style={{color: '#FFFFFF', backgroundColor: '#2563EB'}}>{Math.round(textThreshold * 100)}%</span>
                </div>
                <div className="relative h-3 w-full">
                  <div className="absolute inset-0 bg-blue-200 rounded-full"></div>
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${textThreshold * 100}%`,
                      background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 50%, #1E40AF 100%)'
                    }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={textThreshold}
                    onChange={(e) => setTextThreshold(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-blue-600 pointer-events-none transition-all duration-150"
                    style={{left: `calc(${textThreshold * 100}% - 10px)`}}
                  ></div>
                </div>
                <p className="text-xs mt-2" style={{color: '#64748B'}}>Minimum similarity for extracted text</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold" style={{color: '#1E3A5F'}}>Image Similarity</label>
                  <span className="font-bold text-sm px-2 py-0.5 rounded-md" style={{color: '#FFFFFF', backgroundColor: '#2563EB'}}>{Math.round(imageThreshold * 100)}%</span>
                </div>
                <div className="relative h-3 w-full">
                  <div className="absolute inset-0 bg-blue-200 rounded-full"></div>
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${imageThreshold * 100}%`,
                      background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 50%, #1E40AF 100%)'
                    }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={imageThreshold}
                    onChange={(e) => setImageThreshold(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-blue-600 pointer-events-none transition-all duration-150"
                    style={{left: `calc(${imageThreshold * 100}% - 10px)`}}
                  ></div>
                </div>
                <p className="text-xs mt-2" style={{color: '#64748B'}}>Minimum similarity for visual content</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!selectedFile || comparing}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {comparing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Analyzing & Comparing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Compare Image
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-semibold text-gray-900">{results?.status ?? 'Unknown'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-xl font-semibold text-gray-900">{totalMatches}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">High</p>
                  <p className="text-xl font-semibold text-emerald-600">{highConfidenceCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Medium</p>
                  <p className="text-xl font-semibold text-amber-600">{mediumConfidenceCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Debug Toggle */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowRawResponse(s => !s)}
              className="text-sm text-gray-500 hover:text-indigo-500 font-medium transition-colors"
            >
              {showRawResponse ? 'Hide raw response' : 'Show raw response'}
            </button>
          </div>
          {showRawResponse && (
            <pre className="text-xs bg-gray-50 p-4 rounded-xl overflow-x-auto max-h-64 overflow-y-auto border border-gray-100">
              {JSON.stringify(results, null, 2)}
            </pre>
          )}

          {/* Uploaded Text Preview */}
          {results.uploadedTextPreview && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-sm font-medium text-gray-500 mb-2">Uploaded Image Text</p>
              <div className="bg-gray-50 rounded-xl p-4 max-h-32 overflow-y-auto text-sm text-gray-700">
                {results?.uploadedTextPreview ? `${results.uploadedTextPreview}...` : 'No preview available.'}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Length: {results?.uploadedTextLength ?? 'N/A'} characters
              </p>
            </div>
          )}

          {/* Top Match */}
          {results?.topMatch && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Top Match Found
                </h4>
              </div>
              
              <div className="p-6">
                {/* Top Match Image */}
                {results.topMatch.imageUrl && (
                  <div className="mb-6">
                    <img
                      src={results.topMatch.imageUrl.startsWith('http') ? results.topMatch.imageUrl : `${API_BASE}${results.topMatch.imageUrl}`}
                      alt="Top match"
                      className="max-h-48 rounded-xl border border-gray-200"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Exam Code</p>
                    <p className="font-semibold text-gray-900 text-lg">{results.topMatch.examCode}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-2">Similarity</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${(results.topMatch?.similarity ?? results.topMatch?.textSimilarityScore ?? 0) * 100}%` }}
                        />
                      </div>
                      <span className="font-semibold text-emerald-600">{(((results.topMatch?.similarity ?? results.topMatch?.textSimilarityScore ?? 0) * 100)).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Confidence</p>
                    <span className={`inline-block px-3 py-1 rounded-full font-medium text-sm ${getConfidenceColor(getConfidenceLevel(results.topMatch?.similarity ?? 0))}`}>
                      {getConfidenceLevel(results.topMatch?.similarity ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Matches */}
          {matchesArray.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900">All Matches ({matchesArray.length})</h4>
              </div>
              <div className="p-6 space-y-3">
                {matchesArray.map((match, idx) => {
                  const similarity = match.similarity ?? match.textSimilarityScore ?? 0
                  const confidence = getConfidenceLevel(similarity)
                  return (
                    <div 
                      key={match._id || idx} 
                      onClick={() => setSelectedMatchImage(match)}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-indigo-50 hover:ring-1 hover:ring-indigo-200 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{match.examCode}</p>
                          <p className="text-xs text-gray-500">Match #{idx + 1}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getConfidenceColor(confidence)}`}>
                          {confidence}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-500">Similarity</span>
                          <span className="font-semibold text-indigo-600">{(similarity * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${similarity * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-indigo-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        View details
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* No Matches */}
          {results.status === 'NO_CONFIRMED_MATCH' && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 px-5 py-4 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium mb-2">{results.reason}</p>
                {results.debugInfo?.topTextMatches && (
                  <div className="text-sm">
                    <p className="mb-2 text-amber-700">Top partial matches:</p>
                    <ul className="space-y-1">
                      {results.debugInfo.topTextMatches.map((m, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-amber-700">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                          <span className="font-medium">{m.examCode}:</span> {(m.textSimilarity * 100).toFixed(1)}%
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Matched Image Modal */}
          {selectedMatchImage && (() => {
            const modalSimilarity = selectedMatchImage.similarity ?? selectedMatchImage.textSimilarityScore ?? 0
            const modalConfidence = getConfidenceLevel(modalSimilarity)
            const modalImageUrl = selectedMatchImage.imageUrl ?? selectedMatchImage.matchedImageUrl
            return (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-violet-500 flex justify-between items-center px-6 py-4 rounded-t-2xl">
                    <div className="text-white">
                      <h3 className="text-xl font-semibold">{selectedMatchImage?.examCode ?? 'Match'}</h3>
                      <p className="text-indigo-100 text-sm">Similarity: {(modalSimilarity * 100).toFixed(1)}%</p>
                    </div>
                    <button
                      onClick={() => setSelectedMatchImage(null)}
                      className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    {/* Matched Image */}
                    {modalImageUrl && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Matched Image</p>
                        <img 
                          src={modalImageUrl.startsWith('http') ? modalImageUrl : `${API_BASE}${modalImageUrl}`}
                          alt="Matched" 
                          className="w-full rounded-xl border border-gray-200"
                        />
                      </div>
                    )}

                    {/* Match Details */}
                    <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Exam Code</p>
                        <p className="font-semibold text-gray-900 text-lg">{selectedMatchImage.examCode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Similarity Score</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${modalSimilarity * 100}%` }}
                            />
                          </div>
                          <span className="font-semibold text-indigo-600">{(modalSimilarity * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Confidence Level</p>
                        <span className={`inline-block px-3 py-1 rounded-full font-medium text-sm ${getConfidenceColor(modalConfidence)}`}>
                            {modalConfidence}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedMatchImage(null)}
                      variant="secondary"
                      className="w-full"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
