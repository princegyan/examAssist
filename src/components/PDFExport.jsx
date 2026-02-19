import { useState } from 'react'
import axios from 'axios'
import API_CONFIG from '../config/apiConfig'

const API_BASE = API_CONFIG.baseURL

export default function PDFExport({ examCode, questions = [], mode = 'full' }) {
  const [exporting, setExporting] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [customTitle, setCustomTitle] = useState(`${examCode} - Questions`)
  const [error, setError] = useState(null)

  /**
   * Download entire exam as PDF
   */
  const exportFullExam = async () => {
    if (!examCode) {
      setError('Exam code is required')
      return
    }

    try {
      setExporting(true)
      setError(null)

      const response = await axios.get(
        `${API_BASE}/api/exam/${examCode}/export-pdf`,
        {
          responseType: 'blob',
          timeout: 120000 // 2 minutes
        }
      )

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${examCode}-questions-${new Date().getTime()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('✅ PDF exported successfully')
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to export PDF'
      setError(errorMsg)
      console.error('PDF export error:', err)
    } finally {
      setExporting(false)
    }
  }

  /**
   * Export selected images as PDF
   */
  const exportSelectedImages = async () => {
    if (selectedImages.length === 0) {
      setError('Select at least one image')
      return
    }

    try {
      setExporting(true)
      setError(null)

      const imageUrls = selectedImages
        .map(id => questions.find(q => q._id === id)?.imageUrl)
        .filter(url => url)

      if (imageUrls.length === 0) {
        setError('No valid images selected')
        return
      }

      const response = await axios.post(
        `${API_BASE}/api/exam/${examCode}/images-to-pdf`,
        {
          imageUrls,
          title: customTitle
        },
        {
          responseType: 'blob',
          timeout: 120000
        }
      )

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${examCode}-selected-${new Date().getTime()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setShowModal(false)
      setSelectedImages([])
      console.log('✅ PDF exported successfully')
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to export PDF'
      setError(errorMsg)
      console.error('PDF export error:', err)
    } finally {
      setExporting(false)
    }
  }

  /**
   * Toggle image selection
   */
  const toggleImageSelection = (questionId) => {
    setSelectedImages(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  return (
    <>
      {/* Main Export Button */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={exportFullExam}
          disabled={exporting || !questions.length}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-md"
        >
          {exporting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to PDF ({questions.length})
            </>
          )}
        </button>

        <button
          onClick={() => setShowModal(true)}
          disabled={exporting || !questions.length}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Select & Export
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)'}}>
              <div>
                <h2 className="text-lg font-bold text-white">Select Questions</h2>
                <p className="text-sm text-amber-100">Choose images to include in PDF</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Custom Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">PDF Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter PDF title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Selection Controls */}
              <div className="mb-6 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <button
                  onClick={() => setSelectedImages(questions.map(q => q._id))}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  Select All
                </button>
                <span className="text-gray-400">•</span>
                <button
                  onClick={() => setSelectedImages([])}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  Clear All
                </button>
                <span className="ml-auto text-sm font-medium text-gray-600">
                  {selectedImages.length} of {questions.length} selected
                </span>
              </div>

              {/* Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map((q, index) => (
                  <div
                    key={q._id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedImages.includes(q._id)
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => toggleImageSelection(q._id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(q._id)}
                        onChange={() => {}}
                        className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">Question {index + 1}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {q.extractedText?.substring(0, 50)}...
                        </p>
                        {q.imageUrl && (
                          <img
                            src={q.imageUrl.startsWith('http') ? q.imageUrl : `${API_BASE}${q.imageUrl}`}
                            alt={`Question ${index + 1}`}
                            className="mt-2 w-full h-24 object-cover rounded border border-gray-200"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={exportSelectedImages}
                disabled={exporting || selectedImages.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
              >
                {exporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
