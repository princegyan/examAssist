import { useState, useRef } from 'react'
import ImageEditor from '../components/ImageEditor'

export default function EditImage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [editedImage, setEditedImage] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageSrc(e.target.result)
        setIsEditing(true)
        setEditedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageSrc(e.target.result)
        setSelectedFile(file)
        setIsEditing(true)
        setEditedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleSave = (imageData) => {
    setEditedImage(imageData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleEditAgain = () => {
    if (editedImage) {
      setImageSrc(editedImage.dataUrl)
    }
    setIsEditing(true)
  }

  const handleNewImage = () => {
    setSelectedFile(null)
    setImageSrc(null)
    setEditedImage(null)
    setIsEditing(false)
  }

  const downloadEditedImage = () => {
    if (editedImage) {
      const link = document.createElement('a')
      link.download = `edited-${selectedFile?.name || 'image'}`
      link.href = editedImage.dataUrl
      link.click()
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8" style={{background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 25%, #7C3AED 50%, #8B5CF6 75%, #A78BFA 100%)'}}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-200 text-sm font-medium">Image Tools</span>
                <span className="bg-purple-400/20 border border-purple-400/30 text-purple-300 text-xs font-medium px-2 py-0.5 rounded-full">Editor</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Image Editor</h1>
              <p className="text-purple-200/80 max-w-xl">
                Crop, resize, rotate, flip, and apply filters to your images with our powerful editing tools.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl mb-1">✂️</div>
                <p className="text-white/80 text-sm">Crop</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl mb-1">📐</div>
                <p className="text-white/80 text-sm">Resize</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl mb-1">🎨</div>
                <p className="text-white/80 text-sm">Filters</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!imageSrc && !editedImage && (
        /* Upload Area */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-slate-300 hover:border-purple-400 transition-colors duration-300"
        >
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload an image to edit</h3>
            <p className="text-slate-500 mb-6">Drag and drop your image here, or click to browse</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300"
            >
              Choose Image
            </button>
            
            <p className="text-xs text-slate-400 mt-6">
              Supported formats: JPEG, PNG, GIF, WebP • Max size: 10MB
            </p>
          </div>
        </div>
      )}

      {isEditing && imageSrc && (
        /* Image Editor */
        <ImageEditor
          imageSrc={imageSrc}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {!isEditing && editedImage && (
        /* Edited Image Preview */
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-white">
                  <h3 className="font-semibold">Image Edited Successfully!</h3>
                  <p className="text-emerald-100 text-sm">
                    {editedImage.width} × {editedImage.height}px
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEditAgain}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors"
                >
                  Edit Again
                </button>
                <button
                  onClick={downloadEditedImage}
                  className="px-4 py-2 bg-white text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={handleNewImage}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors"
                >
                  New Image
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-slate-100">
            <div className="flex justify-center">
              <img
                src={editedImage.dataUrl}
                alt="Edited"
                className="max-w-full max-h-[600px] rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Features Info */}
      {!imageSrc && !editedImage && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon="✂️"
            title="Crop"
            description="Select and crop any area of your image with preset aspect ratios or freeform selection."
          />
          <FeatureCard
            icon="📐"
            title="Resize"
            description="Change image dimensions with optional aspect ratio lock for proportional scaling."
          />
          <FeatureCard
            icon="🔄"
            title="Transform"
            description="Rotate 90° left or right, flip horizontally or vertically."
          />
          <FeatureCard
            icon="🎨"
            title="Filters"
            description="Adjust brightness, contrast, saturation, and blur to enhance your image."
          />
        </div>
      )}
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-200 transition-all duration-300">
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-semibold text-slate-800 mb-2">{title}</h4>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  )
}
