import { useState, useRef, useEffect } from 'react'

/**
 * ImageCropper Component
 * A simple cropping tool for use during image upload
 */
export default function ImageCropper({ imageSrc, onCrop, onCancel }) {
  const canvasRef = useRef(null)
  const [image, setImage] = useState(null)
  const [cropRect, setCropRect] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragHandle, setDragHandle] = useState(null)

  // Load image
  useEffect(() => {
    if (imageSrc) {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        // Initialize crop to full image
        setCropRect({ x: 0, y: 0, width: img.width, height: img.height })
      }
      img.src = imageSrc
    }
  }, [imageSrc])

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !image) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    canvas.width = image.width
    canvas.height = image.height
    
    // Draw image
    ctx.drawImage(image, 0, 0)
    
    // Draw crop overlay
    if (cropRect) {
      // Darken outside crop area
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fillRect(0, 0, canvas.width, cropRect.y)
      ctx.fillRect(0, cropRect.y + cropRect.height, canvas.width, canvas.height - cropRect.y - cropRect.height)
      ctx.fillRect(0, cropRect.y, cropRect.x, cropRect.height)
      ctx.fillRect(cropRect.x + cropRect.width, cropRect.y, canvas.width - cropRect.x - cropRect.width, cropRect.height)
      
      // White border
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height)
      
      // Corner handles
      const handleSize = 12
      ctx.fillStyle = '#FFFFFF'
      
      // Top-left
      ctx.fillRect(cropRect.x - 2, cropRect.y - 2, handleSize, 3)
      ctx.fillRect(cropRect.x - 2, cropRect.y - 2, 3, handleSize)
      
      // Top-right
      ctx.fillRect(cropRect.x + cropRect.width - handleSize + 2, cropRect.y - 2, handleSize, 3)
      ctx.fillRect(cropRect.x + cropRect.width - 1, cropRect.y - 2, 3, handleSize)
      
      // Bottom-left
      ctx.fillRect(cropRect.x - 2, cropRect.y + cropRect.height - 1, handleSize, 3)
      ctx.fillRect(cropRect.x - 2, cropRect.y + cropRect.height - handleSize + 2, 3, handleSize)
      
      // Bottom-right
      ctx.fillRect(cropRect.x + cropRect.width - handleSize + 2, cropRect.y + cropRect.height - 1, handleSize, 3)
      ctx.fillRect(cropRect.x + cropRect.width - 1, cropRect.y + cropRect.height - handleSize + 2, 3, handleSize)
      
      // Grid lines (rule of thirds)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 1
      const thirdW = cropRect.width / 3
      const thirdH = cropRect.height / 3
      
      for (let i = 1; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(cropRect.x + thirdW * i, cropRect.y)
        ctx.lineTo(cropRect.x + thirdW * i, cropRect.y + cropRect.height)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.moveTo(cropRect.x, cropRect.y + thirdH * i)
        ctx.lineTo(cropRect.x + cropRect.width, cropRect.y + thirdH * i)
        ctx.stroke()
      }
    }
  }, [image, cropRect])

  // Get canvas coordinates from mouse event
  const getCoords = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  // Detect which handle is being clicked
  const getHandle = (x, y) => {
    if (!cropRect) return null
    const tolerance = 20
    
    const nearLeft = Math.abs(x - cropRect.x) < tolerance
    const nearRight = Math.abs(x - (cropRect.x + cropRect.width)) < tolerance
    const nearTop = Math.abs(y - cropRect.y) < tolerance
    const nearBottom = Math.abs(y - (cropRect.y + cropRect.height)) < tolerance
    
    if (nearTop && nearLeft) return 'nw'
    if (nearTop && nearRight) return 'ne'
    if (nearBottom && nearLeft) return 'sw'
    if (nearBottom && nearRight) return 'se'
    if (nearTop) return 'n'
    if (nearBottom) return 's'
    if (nearLeft) return 'w'
    if (nearRight) return 'e'
    
    // Inside = move
    if (x > cropRect.x && x < cropRect.x + cropRect.width &&
        y > cropRect.y && y < cropRect.y + cropRect.height) {
      return 'move'
    }
    
    return 'new'
  }

  const handleMouseDown = (e) => {
    const { x, y } = getCoords(e)
    const handle = getHandle(x, y)
    
    setDragHandle(handle)
    setDragStart({ x, y })
    setIsDragging(true)
    
    if (handle === 'new') {
      setCropRect({ x, y, width: 0, height: 0 })
    }
  }

  const handleMouseMove = (e) => {
    const { x, y } = getCoords(e)
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Update cursor
    if (!isDragging && cropRect) {
      const handle = getHandle(x, y)
      const cursors = {
        'nw': 'nw-resize', 'ne': 'ne-resize', 'sw': 'sw-resize', 'se': 'se-resize',
        'n': 'n-resize', 's': 's-resize', 'w': 'w-resize', 'e': 'e-resize',
        'move': 'move', 'new': 'crosshair'
      }
      canvas.style.cursor = cursors[handle] || 'crosshair'
    }
    
    if (!isDragging || !cropRect) return
    
    const clampedX = Math.max(0, Math.min(x, canvas.width))
    const clampedY = Math.max(0, Math.min(y, canvas.height))
    
    let newRect = { ...cropRect }
    
    switch (dragHandle) {
      case 'new':
      case 'se':
        newRect.width = Math.max(10, clampedX - newRect.x)
        newRect.height = Math.max(10, clampedY - newRect.y)
        break
      case 'move':
        const dx = clampedX - dragStart.x
        const dy = clampedY - dragStart.y
        newRect.x = Math.max(0, Math.min(cropRect.x + dx, canvas.width - cropRect.width))
        newRect.y = Math.max(0, Math.min(cropRect.y + dy, canvas.height - cropRect.height))
        setDragStart({ x: clampedX, y: clampedY })
        break
      case 'nw':
        newRect.width = cropRect.x + cropRect.width - clampedX
        newRect.height = cropRect.y + cropRect.height - clampedY
        if (newRect.width > 10) newRect.x = clampedX
        if (newRect.height > 10) newRect.y = clampedY
        break
      case 'ne':
        newRect.width = Math.max(10, clampedX - cropRect.x)
        newRect.height = cropRect.y + cropRect.height - clampedY
        if (newRect.height > 10) newRect.y = clampedY
        break
      case 'sw':
        newRect.width = cropRect.x + cropRect.width - clampedX
        if (newRect.width > 10) newRect.x = clampedX
        newRect.height = Math.max(10, clampedY - cropRect.y)
        break
      case 'n':
        newRect.height = cropRect.y + cropRect.height - clampedY
        if (newRect.height > 10) newRect.y = clampedY
        break
      case 's':
        newRect.height = Math.max(10, clampedY - cropRect.y)
        break
      case 'w':
        newRect.width = cropRect.x + cropRect.width - clampedX
        if (newRect.width > 10) newRect.x = clampedX
        break
      case 'e':
        newRect.width = Math.max(10, clampedX - cropRect.x)
        break
    }
    
    setCropRect(newRect)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragHandle(null)
  }

  const applyCrop = () => {
    if (!cropRect || !image) return
    
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = cropRect.width
    tempCanvas.height = cropRect.height
    const tempCtx = tempCanvas.getContext('2d')
    
    tempCtx.drawImage(
      image,
      cropRect.x, cropRect.y, cropRect.width, cropRect.height,
      0, 0, cropRect.width, cropRect.height
    )
    
    // Convert to blob and pass back
    tempCanvas.toBlob((blob) => {
      const croppedFile = new File([blob], 'cropped-image.png', { type: 'image/png' })
      const dataUrl = tempCanvas.toDataURL('image/png')
      onCrop({ file: croppedFile, dataUrl, width: cropRect.width, height: cropRect.height })
    }, 'image/png')
  }

  const skipCrop = () => {
    onCancel()
  }

  if (!image) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-100 rounded-xl">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <h3 className="font-semibold">Crop Image (Optional)</h3>
              <p className="text-blue-100 text-sm">Drag to select the area you want to keep</p>
            </div>
          </div>
          <div className="text-white text-sm bg-white/20 px-3 py-1 rounded-full">
            {Math.round(cropRect?.width || 0)} × {Math.round(cropRect?.height || 0)}px
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="overflow-auto bg-slate-800 p-4" style={{ maxHeight: '60vh' }}>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="shadow-lg max-w-full h-auto"
            style={{ cursor: 'crosshair' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Drag corners to resize • Drag inside to move • Or skip to upload full image
        </p>
        <div className="flex gap-3">
          <button
            onClick={skipCrop}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            Skip Cropping
          </button>
          <button
            onClick={applyCrop}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-500/25 transition-all"
          >
            Apply Crop & Continue
          </button>
        </div>
      </div>
    </div>
  )
}
