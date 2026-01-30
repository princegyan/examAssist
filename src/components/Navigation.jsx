import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'https://inlaks-t24-backend.vercel.app'

export default function Navigation({ currentPage, onNavigate }) {
  const [showHelp, setShowHelp] = useState(false)
  const [sampleImage, setSampleImage] = useState(null)

  return (
    <>
    <header className="sticky top-0 z-50" style={{background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #1E40AF 100%)'}}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img 
              src="https://ghana.inlaks.com/wp-content/uploads/2019/08/Inlaks-Favicon.png" 
              alt="Inlaks Logo" 
              className="h-9 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl items-center justify-center shadow-lg shadow-blue-500/25 hidden">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight" style={{color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>Inlaks T24</h1>
              <p className="text-xs" style={{color: '#BFDBFE'}}>Exam Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            <NavButton 
              active={currentPage === 'exams'} 
              onClick={() => onNavigate('exams')}
              icon={<FolderIcon />}
            >
              Exams
            </NavButton>
            <NavButton 
              active={currentPage === 'upload'} 
              onClick={() => onNavigate('upload')}
              icon={<UploadIcon />}
            >
              Upload
            </NavButton>
            <NavButton 
              active={currentPage === 'compare'} 
              onClick={() => onNavigate('compare')}
              icon={<CompareIcon />}
            >
              Compare
            </NavButton>
            <NavButton 
              active={currentPage === 'test'} 
              onClick={() => onNavigate('test')}
              icon={<TestIcon />}
            >
              API
            </NavButton>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* How to Use Button */}
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium text-blue-200 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">How to Use</span>
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-emerald-300">Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* How to Use Modal */}
    {showHelp && (
      <HelpModal 
        onClose={() => setShowHelp(false)} 
        sampleImage={sampleImage}
        setSampleImage={setSampleImage}
      />
    )}
    </>
  )
}

function HelpModal({ onClose, sampleImage, setSampleImage }) {
  const [loadingImage, setLoadingImage] = useState(false)

  useEffect(() => {
    // Fetch a sample image from T3TAAL exam if not already loaded
    if (!sampleImage) {
      setLoadingImage(true)
      axios.get(`${API_BASE}/api/exam/T3TAAL%20-79-%20Alfred/questions`)
        .then(res => {
          const questions = res.data?.questions || []
          if (questions.length > 0 && questions[0].imageUrl) {
            setSampleImage(questions[0].imageUrl)
          }
        })
        .catch(err => console.error('Failed to load sample image:', err))
        .finally(() => setLoadingImage(false))
    }
  }, [sampleImage, setSampleImage])

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-100" style={{background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2563EB 100%)'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white" style={{color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>How to Use</h2>
                  <p className="text-sm text-blue-200">Quick guide to navigate the system</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
            <div className="space-y-6">
              
              {/* Exams Section */}
              <HelpSection 
                icon={<FolderIcon />}
                title="Exams"
                color="blue"
                steps={[
                  "View all available exams on the dashboard",
                  "Click 'Create New Exam' to add a new exam code",
                  "Click on any exam card to view its questions",
                  "Use 'Upload Questions' or 'View Questions' from the card actions"
                ]}
              />

              {/* Upload Section */}
              <HelpSection 
                icon={<UploadIcon />}
                title="Upload Questions"
                color="emerald"
                steps={[
                  "Select an exam from the Exams page first",
                  "Choose between 'Single Upload' or 'Bulk Upload' mode",
                  "For single upload: Select one image and click Upload",
                  "For bulk upload: Select multiple images (up to 20) at once",
                  "The system will extract text from images using OCR",
                  "Review the extracted text and upload results"
                ]}
              />

              {/* Compare Section */}
              <HelpSection 
                icon={<CompareIcon />}
                title="Compare Images"
                color="purple"
                steps={[
                  "Upload an image you want to compare",
                  "Adjust the similarity thresholds using the sliders:",
                  "• Text Similarity: How closely the extracted text should match",
                  "• Image Similarity: How closely the visual content should match",
                  "Click 'Compare' to find matching questions in the database",
                  "View the similarity scores and matching questions"
                ]}
              />

              {/* API Section */}
              <HelpSection 
                icon={<TestIcon />}
                title="API Testing"
                color="amber"
                steps={[
                  "Test the backend API endpoints directly",
                  "Check server connectivity and response times",
                  "Debug API issues and view raw responses",
                  "Useful for developers and troubleshooting"
                ]}
              />

              {/* Tips */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Pro Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Use clear, high-resolution images for better OCR results</li>
                      <li>• Lower similarity thresholds to find more potential matches</li>
                      <li>• Bulk upload saves time when adding many questions</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sample Image Format */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Sample Question Image</h4>
                    <p className="text-xs text-gray-500">From T3TAAL -79- Alfred exam</p>
                  </div>
                </div>
                
                {/* Actual Sample Image from T3TAAL */}
                <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
                  {loadingImage ? (
                    <div className="flex items-center justify-center p-8">
                      <span className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></span>
                      <span className="ml-3 text-sm text-gray-500">Loading sample image...</span>
                    </div>
                  ) : sampleImage ? (
                    <img 
                      src={sampleImage} 
                      alt="Sample T24 question from T3TAAL exam" 
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="p-4 text-sm text-center text-gray-500">
                      <p>Unable to load sample image</p>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500">
                  ✓ Clear question text with Q indicator &nbsp;•&nbsp; ✓ Options labeled A, B, C, D &nbsp;•&nbsp; ✓ Readable font size
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
  )
}

function HelpSection({ icon, title, color, steps }) {
  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', iconBg: 'bg-blue-100', iconText: 'text-blue-600', title: 'text-blue-800', step: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', title: 'text-emerald-800', step: 'text-emerald-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', iconBg: 'bg-purple-100', iconText: 'text-purple-600', title: 'text-purple-800', step: 'text-purple-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', iconBg: 'bg-amber-100', iconText: 'text-amber-600', title: 'text-amber-800', step: 'text-amber-700' },
  }
  const c = colors[color]
  
  return (
    <div className={`${c.bg} rounded-xl p-4 border ${c.border}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 ${c.iconBg} rounded-lg flex items-center justify-center ${c.iconText}`}>
          {icon}
        </div>
        <h3 className={`font-semibold ${c.title}`}>{title}</h3>
      </div>
      <ol className={`text-sm ${c.step} space-y-1.5 ml-11`}>
        {steps.map((step, i) => (
          <li key={i} className={step.startsWith('•') ? 'list-none ml-2' : 'list-decimal'}>
            {step.startsWith('•') ? step : step}
          </li>
        ))}
      </ol>
    </div>
  )
}

function NavButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${active 
          ? 'bg-white text-blue-600 shadow-lg' 
          : 'text-blue-200 hover:text-white hover:bg-white/10'
        }
      `}
    >
      {icon}
      {children}
    </button>
  )
}

function FolderIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

function TestIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}
