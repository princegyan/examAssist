import { useState } from 'react'
import axios from 'axios'
import { Button } from '../components/Button'
import API_CONFIG from '../config/apiConfig'

const API_BASE = API_CONFIG.baseURL

export default function UploadQuestion({ examCode, onNavigate }) {
  const [uploadMode, setUploadMode] = useState('single') // 'single' or 'bulk'
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([]) // For bulk upload
  const [preview, setPreview] = useState(null)
  const [previews, setPreviews] = useState([]) // For bulk upload
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploadedData, setUploadedData] = useState(null)
  const [bulkUploadResults, setBulkUploadResults] = useState(null) // For bulk upload results
  const [extractedText, setExtractedText] = useState(null)
  const [loadingText, setLoadingText] = useState(false)
  const [showRawResponse, setShowRawResponse] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0) // For bulk upload progress

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
    }
  }

  // Handle multiple file selection for bulk upload
  const handleBulkFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setSelectedFiles(files)
      setError(null)
      setBulkUploadResults(null)
      
      // Generate previews for all files
      const previewPromises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve({ name: file.name, url: e.target.result })
          reader.readAsDataURL(file)
        })
      })
      
      Promise.all(previewPromises).then(setPreviews)
    }
  }

  // Remove a file from bulk selection
  const removeFileFromBulk = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select an image')
      return
    }

    try {
      setUploading(true)
      setError(null)
      
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await axios.post(
        `${API_BASE}/api/exam/${examCode}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      setSuccess('Question uploaded successfully!')
      // store full response data; render guarded below to avoid crashes
      setUploadedData(response.data)
      setSelectedFile(null)
      setPreview(null)

      // Fetch the full question details to get extracted text
      const questionId = response.data?.question?._id
      if (questionId) {
        setLoadingText(true)
        try {
          const questionsRes = await axios.get(`${API_BASE}/api/exam/${examCode}/questions`)
          const questions = questionsRes.data?.questions || []
          const uploadedQuestion = questions.find(q => q._id === questionId)
          if (uploadedQuestion?.extractedText) {
            setExtractedText(uploadedQuestion.extractedText)
          }
        } catch (fetchErr) {
          console.error('Failed to fetch extracted text:', fetchErr)
        } finally {
          setLoadingText(false)
        }
      }

      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      console.error('Upload error', err)
      setError(err.response?.data?.error || 'Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // Handle bulk upload
  const handleBulkUpload = async (e) => {
    e.preventDefault()
    if (selectedFiles.length === 0) {
      setError('Please select images to upload')
      return
    }

    try {
      setUploading(true)
      setError(null)
      setUploadProgress(0)

      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append('images', file)
      })

      const response = await axios.post(
        `${API_BASE}/api/exam/${examCode}/upload-bulk`,
        formData,
        { 
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        }
      )

      console.log('Bulk upload response', response.data)
      setBulkUploadResults(response.data)
      setSuccess(`Successfully uploaded ${response.data?.totalUploaded || response.data?.successful?.length || 0} questions!`)
      setSelectedFiles([])
      setPreviews([])

      setTimeout(() => {
        setSuccess(null)
      }, 5000)
    } catch (err) {
      console.error('Bulk upload error', err)
      setError(err.response?.data?.error || 'Bulk upload failed: ' + err.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Blockchain Blue Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8" style={{background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 25%, #2563EB 50%, #3B82F6 75%, #60A5FA 100%)'}}>
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-blue-200 text-sm font-medium">Upload Module</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Upload Question</h1>
              <p className="text-blue-200">Add a new question image to your exam</p>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl mt-4 w-fit">
                <svg className="w-4 h-4" style={{color: '#22D3EE'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold" style={{color: '#FFFFFF'}}>{examCode}</span>
              </div>
            </div>
            {/* Upload Illustration */}
            <div className="hidden md:block">
              <svg width="140" height="120" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="70" cy="75" rx="50" ry="30" fill="white" opacity="0.1"/>
                <ellipse cx="45" cy="70" rx="25" ry="20" fill="white" opacity="0.15"/>
                <ellipse cx="95" cy="70" rx="25" ry="20" fill="white" opacity="0.15"/>
                <rect x="60" y="25" width="20" height="45" rx="4" fill="white" opacity="0.9"/>
                <path d="M70 10L55 30H65V55H75V30H85L70 10Z" fill="white"/>
                <rect x="85" y="50" width="35" height="45" rx="4" fill="white" opacity="0.8"/>
                <line x1="92" y1="62" x2="112" y2="62" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                <line x1="92" y1="72" x2="108" y2="72" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
                <line x1="92" y1="82" x2="105" y2="82" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="30" cy="30" r="4" fill="#60A5FA"/>
                <circle cx="120" cy="25" r="3" fill="#60A5FA"/>
              </svg>
            </div>
          </div>
        </div>
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          {/* Upload Mode Toggle */}
          <div className="flex items-center gap-2 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => { setUploadMode('single'); setError(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                uploadMode === 'single'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Single Upload
              </span>
            </button>
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-gray-400 cursor-not-allowed opacity-60"
              title="Bulk upload is currently disabled"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Bulk Upload
              </span>
            </button>
          </div>

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

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Single Upload Form */}
          {uploadMode === 'single' && (
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Dropzone */}
            <div className={`
              border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer
              ${preview 
                ? 'border-blue-300 bg-blue-50/50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }
            `}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                {preview ? (
                  <div className="space-y-4">
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-sm" />
                    <p className="text-gray-500 text-sm">{selectedFile?.name}</p>
                    <p className="text-blue-500 text-sm font-medium hover:underline">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
                      <p className="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            <Button
              type="submit"
              disabled={!selectedFile || uploading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Uploading & Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Question
                </span>
              )}
            </Button>
          </form>
          )}

          {/* Bulk Upload Form */}
          {uploadMode === 'bulk' && (
          <form onSubmit={handleBulkUpload} className="space-y-6">
            {/* Bulk Dropzone */}
            <div className={`
              border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer
              ${selectedFiles.length > 0 
                ? 'border-blue-300 bg-blue-50/50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }
            `}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleBulkFileSelect}
                className="hidden"
                id="bulk-file-input"
              />
              <label htmlFor="bulk-file-input" className="cursor-pointer block">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Click to select multiple images</p>
                    <p className="text-gray-400 text-sm mt-1">Select multiple PNG, JPG, GIF files at once</p>
                  </div>
                </div>
              </label>
            </div>

            {/* Selected Files Preview Grid */}
            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    <span style={{color: '#2563EB'}}>{selectedFiles.length}</span> files selected
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSelectedFiles([]); setPreviews([]); }}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={preview.url} 
                        alt={preview.name} 
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFileFromBulk(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <p className="text-xs text-gray-500 truncate mt-1">{preview.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress Bar */}
            {uploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploading...</span>
                  <span style={{color: '#2563EB'}} className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${uploadProgress}%`,
                      background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 50%, #1E40AF 100%)'
                    }}
                  ></div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={selectedFiles.length === 0 || uploading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Uploading {selectedFiles.length} images...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload {selectedFiles.length} Questions
                </span>
              )}
            </Button>
          </form>
          )}
        </div>
      </div>

      {/* Bulk Upload Results */}
      {bulkUploadResults && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fadeIn mb-6">
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-700">Bulk Upload Complete</h3>
              <p className="text-sm text-emerald-600">
                {bulkUploadResults?.totalUploaded || bulkUploadResults?.successful?.length || 0} questions uploaded successfully
              </p>
            </div>
          </div>

          <div className="p-6">
            {/* Results Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-xs text-emerald-600 mb-1">Uploaded</p>
                <p className="font-bold text-2xl text-emerald-700">
                  {bulkUploadResults?.totalUploaded || bulkUploadResults?.successful?.length || 0}
                </p>
              </div>
              {bulkUploadResults?.totalFailed > 0 && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <p className="text-xs text-red-600 mb-1">Failed</p>
                  <p className="font-bold text-2xl text-red-700">{bulkUploadResults.totalFailed}</p>
                </div>
              )}
            </div>

            {/* Show uploaded questions */}
            {bulkUploadResults?.successful && bulkUploadResults.successful.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">Uploaded Questions</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {bulkUploadResults.successful.map((q, idx) => (
                    <div key={q._id || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {q.imageUrl && (
                        <img src={q.imageUrl} alt={q.filename || `Question ${idx + 1}`} className="w-12 h-12 object-cover rounded-lg border" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{q.filename || `Question ${idx + 1}`}</p>
                        <p className="text-xs text-gray-500">{q.textLength} characters extracted</p>
                      </div>
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show failed uploads */}
            {bulkUploadResults?.failed && bulkUploadResults.failed.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-red-500 mb-3">Failed Uploads</p>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {bulkUploadResults.failed.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-700 truncate">{f.filename}</p>
                        <p className="text-xs text-red-500 truncate">{f.error}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={() => setShowRawResponse(s => !s)}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                {showRawResponse ? 'Hide raw response' : 'Show raw response'}
              </button>
              <button
                onClick={() => { setBulkUploadResults(null); setSuccess(null); }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Clear results
              </button>
            </div>

            {showRawResponse && (
              <pre className="mt-4 text-xs bg-gray-50 p-4 rounded-xl overflow-x-auto border border-gray-100">
                {JSON.stringify(bulkUploadResults, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Upload Result Display */}
      {uploadedData && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fadeIn">
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-700">{uploadedData?.message ?? 'Upload Successful'}</h3>
              <p className="text-sm text-emerald-600">Your question has been processed</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Uploaded Image Preview */}
            {uploadedData?.question?.imageUrl && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">Uploaded Image</p>
                <img
                  src={uploadedData.question.imageUrl}
                  alt="Uploaded question"
                  className="max-h-64 rounded-xl border border-gray-200"
                />
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Exam Code</p>
                <p className="font-semibold text-gray-900">{uploadedData?.question?.examCode ?? examCode}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Characters Extracted</p>
                <p className="font-semibold text-gray-900">{uploadedData?.question?.textLength ?? 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Question ID</p>
                <p className="font-mono text-xs text-gray-700 truncate">{uploadedData?.question?._id ?? 'N/A'}</p>
              </div>
            </div>

            {/* Extracted Text Section */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">Extracted Text</p>
              {loadingText ? (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                  <span className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></span>
                  <span className="text-gray-500 text-sm">Loading extracted text...</span>
                </div>
              ) : extractedText ? (
                <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{extractedText}</p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-amber-700 text-sm">Extracted text not available in the response.</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowRawResponse(s => !s)}
                className="text-sm text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
              >
                {showRawResponse ? 'Hide raw response' : 'Show raw response'}
              </button>
              <button
                onClick={() => { setUploadedData(null); setSuccess(null); setExtractedText(null) }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Clear & Upload Another
              </button>
            </div>
          </div>

          {showRawResponse && (
            <pre className="mx-6 mb-6 text-xs bg-gray-50 p-4 rounded-xl overflow-x-auto border border-gray-100">{JSON.stringify(uploadedData, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  )
}
