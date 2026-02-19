import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * ImageEditor Component
 * Provides image editing capabilities including cropping, resizing, rotation, and filters
 */
export default function ImageEditor({ 
  imageSrc, 
  onSave, 
  onCancel,
  maxWidth = 1920,
  maxHeight = 1080 
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [image, setImage] = useState(null)
  const [originalImage, setOriginalImage] = useState(null)
  
  // Editor state
  const [mode, setMode] = useState('view') // 'view', 'crop', 'resize'
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  
  // Crop state
  const [cropStart, setCropStart] = useState(null)
  const [cropEnd, setCropEnd] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [cropRect, setCropRect] = useState(null)
  const [dragHandle, setDragHandle] = useState(null) // For resizing crop area
  const [canvasScale, setCanvasScale] = useState(1) // Track CSS scaling
  
  // Resize state
  const [resizeWidth, setResizeWidth] = useState(0)
  const [resizeHeight, setResizeHeight] = useState(0)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1)
  
  // Filter state
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [blur, setBlur] = useState(0)
  
  // History for undo/redo
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Load image
  useEffect(() => {
    if (imageSrc) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setImage(img)
        setOriginalImage(img)
        setResizeWidth(img.width)
        setResizeHeight(img.height)
        setOriginalAspectRatio(img.width / img.height)
        saveToHistory(img)
      }
      img.src = imageSrc
    }
  }, [imageSrc])

  // Draw image on canvas
  useEffect(() => {
    if (!canvasRef.current || !image) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Calculate dimensions with rotation
    const isRotated90 = rotation === 90 || rotation === 270
    let drawWidth = isRotated90 ? image.height : image.width
    let drawHeight = isRotated90 ? image.width : image.height
    
    // Apply zoom
    drawWidth *= zoom
    drawHeight *= zoom
    
    canvas.width = drawWidth
    canvas.height = drawHeight
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Save context state
    ctx.save()
    
    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`
    
    // Move to center for transformations
    ctx.translate(canvas.width / 2, canvas.height / 2)
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180)
    
    // Apply flip
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    
    // Draw image centered
    ctx.drawImage(
      image,
      (-image.width * zoom) / 2,
      (-image.height * zoom) / 2,
      image.width * zoom,
      image.height * zoom
    )
    
    // Restore context
    ctx.restore()
    
    // Draw crop overlay if in crop mode
    if (mode === 'crop') {
      drawCropOverlay(ctx, canvas.width, canvas.height)
    }
    
    // Update canvas scale for mouse coordinate calculations
    requestAnimationFrame(() => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const scale = canvas.width / rect.width
        setCanvasScale(scale)
      }
    })
  }, [image, zoom, rotation, flipH, flipV, brightness, contrast, saturation, blur, mode, cropRect])

  const drawCropOverlay = (ctx, canvasWidth, canvasHeight) => {
    // If no crop rect, show a subtle border to indicate crop mode is active
    if (!cropRect) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)'
      ctx.lineWidth = 3
      ctx.setLineDash([10, 5])
      ctx.strokeRect(2, 2, canvasWidth - 4, canvasHeight - 4)
      return
    }
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    
    // Top
    ctx.fillRect(0, 0, canvasWidth, cropRect.y)
    // Bottom
    ctx.fillRect(0, cropRect.y + cropRect.height, canvasWidth, canvasHeight - cropRect.y - cropRect.height)
    // Left
    ctx.fillRect(0, cropRect.y, cropRect.x, cropRect.height)
    // Right
    ctx.fillRect(cropRect.x + cropRect.width, cropRect.y, canvasWidth - cropRect.x - cropRect.width, cropRect.height)
    
    // Crop border - solid white
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height)
    
    // Corner handles - larger and more visible
    const handleSize = 16
    const handleThickness = 4
    ctx.fillStyle = '#FFFFFF'
    ctx.setLineDash([])
    
    // Top-left corner (L-shaped)
    ctx.fillRect(cropRect.x - 2, cropRect.y - 2, handleSize, handleThickness)
    ctx.fillRect(cropRect.x - 2, cropRect.y - 2, handleThickness, handleSize)
    
    // Top-right corner
    ctx.fillRect(cropRect.x + cropRect.width - handleSize + 2, cropRect.y - 2, handleSize, handleThickness)
    ctx.fillRect(cropRect.x + cropRect.width - 2, cropRect.y - 2, handleThickness, handleSize)
    
    // Bottom-left corner
    ctx.fillRect(cropRect.x - 2, cropRect.y + cropRect.height - 2, handleSize, handleThickness)
    ctx.fillRect(cropRect.x - 2, cropRect.y + cropRect.height - handleSize + 2, handleThickness, handleSize)
    
    // Bottom-right corner
    ctx.fillRect(cropRect.x + cropRect.width - handleSize + 2, cropRect.y + cropRect.height - 2, handleSize, handleThickness)
    ctx.fillRect(cropRect.x + cropRect.width - 2, cropRect.y + cropRect.height - handleSize + 2, handleThickness, handleSize)
    
    // Edge handles (center of each edge)
    const edgeHandleLength = 20
    ctx.fillStyle = '#FFFFFF'
    
    // Top edge
    ctx.fillRect(cropRect.x + cropRect.width/2 - edgeHandleLength/2, cropRect.y - 2, edgeHandleLength, handleThickness)
    // Bottom edge
    ctx.fillRect(cropRect.x + cropRect.width/2 - edgeHandleLength/2, cropRect.y + cropRect.height - 2, edgeHandleLength, handleThickness)
    // Left edge
    ctx.fillRect(cropRect.x - 2, cropRect.y + cropRect.height/2 - edgeHandleLength/2, handleThickness, edgeHandleLength)
    // Right edge
    ctx.fillRect(cropRect.x + cropRect.width - 2, cropRect.y + cropRect.height/2 - edgeHandleLength/2, handleThickness, edgeHandleLength)
    
    // Rule of thirds grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 1
    ctx.setLineDash([])
    
    const thirdW = cropRect.width / 3
    const thirdH = cropRect.height / 3
    
    for (let i = 1; i < 3; i++) {
      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(cropRect.x + thirdW * i, cropRect.y)
      ctx.lineTo(cropRect.x + thirdW * i, cropRect.y + cropRect.height)
      ctx.stroke()
      
      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(cropRect.x, cropRect.y + thirdH * i)
      ctx.lineTo(cropRect.x + cropRect.width, cropRect.y + thirdH * i)
      ctx.stroke()
    }
  }

  const saveToHistory = (img) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({
      image: img,
      zoom,
      rotation,
      flipH,
      flipV,
      brightness,
      contrast,
      saturation,
      blur
    })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      applyHistoryState(prevState)
      setHistoryIndex(historyIndex - 1)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      applyHistoryState(nextState)
      setHistoryIndex(historyIndex + 1)
    }
  }

  const applyHistoryState = (state) => {
    setImage(state.image)
    setZoom(state.zoom || 1)
    setRotation(state.rotation || 0)
    setFlipH(state.flipH || false)
    setFlipV(state.flipV || false)
    setBrightness(state.brightness || 100)
    setContrast(state.contrast || 100)
    setSaturation(state.saturation || 100)
    setBlur(state.blur || 0)
  }

  // Helper to get canvas coordinates from mouse event
  const getCanvasCoords = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  // Check which handle is being clicked
  const getHandle = (x, y) => {
    if (!cropRect) return null
    const tolerance = 20
    
    const nearLeft = Math.abs(x - cropRect.x) < tolerance
    const nearRight = Math.abs(x - (cropRect.x + cropRect.width)) < tolerance
    const nearTop = Math.abs(y - cropRect.y) < tolerance
    const nearBottom = Math.abs(y - (cropRect.y + cropRect.height)) < tolerance
    const nearHCenter = Math.abs(x - (cropRect.x + cropRect.width / 2)) < tolerance
    const nearVCenter = Math.abs(y - (cropRect.y + cropRect.height / 2)) < tolerance
    
    // Corners
    if (nearTop && nearLeft) return 'nw'
    if (nearTop && nearRight) return 'ne'
    if (nearBottom && nearLeft) return 'sw'
    if (nearBottom && nearRight) return 'se'
    
    // Edges
    if (nearTop && nearHCenter) return 'n'
    if (nearBottom && nearHCenter) return 's'
    if (nearLeft && nearVCenter) return 'w'
    if (nearRight && nearVCenter) return 'e'
    
    // Inside crop area - for moving
    if (x > cropRect.x && x < cropRect.x + cropRect.width &&
        y > cropRect.y && y < cropRect.y + cropRect.height) {
      return 'move'
    }
    
    return null
  }

  // Crop handlers
  const handleMouseDown = (e) => {
    if (mode !== 'crop') return
    
    const { x, y } = getCanvasCoords(e)
    const handle = getHandle(x, y)
    
    if (handle && cropRect) {
      // Start resizing or moving existing crop
      setDragHandle(handle)
      setCropStart({ x, y })
      setIsDragging(true)
    } else {
      // Start new crop selection
      setDragHandle(null)
      setCropStart({ x, y })
      setCropEnd({ x, y })
      setCropRect(null)
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e) => {
    if (mode !== 'crop') return
    
    const { x, y } = getCanvasCoords(e)
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Update cursor based on handle position
    if (!isDragging && cropRect) {
      const handle = getHandle(x, y)
      const cursorMap = {
        'nw': 'nw-resize', 'ne': 'ne-resize', 'sw': 'sw-resize', 'se': 'se-resize',
        'n': 'n-resize', 's': 's-resize', 'w': 'w-resize', 'e': 'e-resize',
        'move': 'move'
      }
      canvas.style.cursor = cursorMap[handle] || 'crosshair'
    }
    
    if (!isDragging) return
    
    // Clamp to canvas bounds
    const clampedX = Math.max(0, Math.min(x, canvas.width))
    const clampedY = Math.max(0, Math.min(y, canvas.height))
    
    if (dragHandle && cropRect) {
      // Resize or move existing crop
      const dx = clampedX - cropStart.x
      const dy = clampedY - cropStart.y
      
      let newRect = { ...cropRect }
      
      switch (dragHandle) {
        case 'move':
          newRect.x = Math.max(0, Math.min(cropRect.x + dx, canvas.width - cropRect.width))
          newRect.y = Math.max(0, Math.min(cropRect.y + dy, canvas.height - cropRect.height))
          break
        case 'nw':
          newRect.x = Math.min(clampedX, cropRect.x + cropRect.width - 20)
          newRect.y = Math.min(clampedY, cropRect.y + cropRect.height - 20)
          newRect.width = cropRect.x + cropRect.width - newRect.x
          newRect.height = cropRect.y + cropRect.height - newRect.y
          break
        case 'ne':
          newRect.y = Math.min(clampedY, cropRect.y + cropRect.height - 20)
          newRect.width = Math.max(20, clampedX - cropRect.x)
          newRect.height = cropRect.y + cropRect.height - newRect.y
          break
        case 'sw':
          newRect.x = Math.min(clampedX, cropRect.x + cropRect.width - 20)
          newRect.width = cropRect.x + cropRect.width - newRect.x
          newRect.height = Math.max(20, clampedY - cropRect.y)
          break
        case 'se':
          newRect.width = Math.max(20, clampedX - cropRect.x)
          newRect.height = Math.max(20, clampedY - cropRect.y)
          break
        case 'n':
          newRect.y = Math.min(clampedY, cropRect.y + cropRect.height - 20)
          newRect.height = cropRect.y + cropRect.height - newRect.y
          break
        case 's':
          newRect.height = Math.max(20, clampedY - cropRect.y)
          break
        case 'w':
          newRect.x = Math.min(clampedX, cropRect.x + cropRect.width - 20)
          newRect.width = cropRect.x + cropRect.width - newRect.x
          break
        case 'e':
          newRect.width = Math.max(20, clampedX - cropRect.x)
          break
      }
      
      setCropRect(newRect)
      setCropStart({ x: clampedX, y: clampedY })
    } else {
      // New crop selection
      setCropEnd({ x: clampedX, y: clampedY })
      
      if (cropStart) {
        const minX = Math.min(cropStart.x, clampedX)
        const minY = Math.min(cropStart.y, clampedY)
        const maxX = Math.max(cropStart.x, clampedX)
        const maxY = Math.max(cropStart.y, clampedY)
        
        setCropRect({
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragHandle(null)
  }

  const applyCrop = () => {
    if (!cropRect || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Create a temporary canvas for the cropped image
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = cropRect.width
    tempCanvas.height = cropRect.height
    const tempCtx = tempCanvas.getContext('2d')
    
    // Copy the cropped area
    tempCtx.drawImage(
      canvas,
      cropRect.x, cropRect.y,
      cropRect.width, cropRect.height,
      0, 0,
      cropRect.width, cropRect.height
    )
    
    // Create new image from cropped canvas
    const croppedImg = new Image()
    croppedImg.onload = () => {
      setImage(croppedImg)
      setResizeWidth(croppedImg.width)
      setResizeHeight(croppedImg.height)
      setOriginalAspectRatio(croppedImg.width / croppedImg.height)
      setCropRect(null)
      setMode('view')
      saveToHistory(croppedImg)
    }
    croppedImg.src = tempCanvas.toDataURL('image/png')
  }

  const cancelCrop = () => {
    setCropRect(null)
    setCropStart(null)
    setCropEnd(null)
    setMode('view')
  }

  // Resize handlers
  const handleWidthChange = (newWidth) => {
    const width = parseInt(newWidth) || 0
    setResizeWidth(width)
    if (maintainAspectRatio && width > 0) {
      setResizeHeight(Math.round(width / originalAspectRatio))
    }
  }

  const handleHeightChange = (newHeight) => {
    const height = parseInt(newHeight) || 0
    setResizeHeight(height)
    if (maintainAspectRatio && height > 0) {
      setResizeWidth(Math.round(height * originalAspectRatio))
    }
  }

  const applyResize = () => {
    if (!image || resizeWidth <= 0 || resizeHeight <= 0) return
    
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = resizeWidth
    tempCanvas.height = resizeHeight
    const tempCtx = tempCanvas.getContext('2d')
    
    // Use high-quality image smoothing
    tempCtx.imageSmoothingEnabled = true
    tempCtx.imageSmoothingQuality = 'high'
    
    tempCtx.drawImage(image, 0, 0, resizeWidth, resizeHeight)
    
    const resizedImg = new Image()
    resizedImg.onload = () => {
      setImage(resizedImg)
      setOriginalAspectRatio(resizedImg.width / resizedImg.height)
      setMode('view')
      saveToHistory(resizedImg)
    }
    resizedImg.src = tempCanvas.toDataURL('image/png')
  }

  // Rotation handlers
  const rotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360)
  }

  const rotateRight = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const applyRotation = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext('2d')
    
    tempCtx.drawImage(canvas, 0, 0)
    
    const rotatedImg = new Image()
    rotatedImg.onload = () => {
      setImage(rotatedImg)
      setRotation(0)
      setFlipH(false)
      setFlipV(false)
      setResizeWidth(rotatedImg.width)
      setResizeHeight(rotatedImg.height)
      setOriginalAspectRatio(rotatedImg.width / rotatedImg.height)
      saveToHistory(rotatedImg)
    }
    rotatedImg.src = tempCanvas.toDataURL('image/png')
  }

  // Reset to original
  const resetImage = () => {
    if (originalImage) {
      setImage(originalImage)
      setZoom(1)
      setRotation(0)
      setFlipH(false)
      setFlipV(false)
      setBrightness(100)
      setContrast(100)
      setSaturation(100)
      setBlur(0)
      setResizeWidth(originalImage.width)
      setResizeHeight(originalImage.height)
      setOriginalAspectRatio(originalImage.width / originalImage.height)
      setCropRect(null)
      setMode('view')
    }
  }

  // Apply all filters and get final image
  const applyFilters = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext('2d')
    
    tempCtx.drawImage(canvas, 0, 0)
    
    const filteredImg = new Image()
    filteredImg.onload = () => {
      setImage(filteredImg)
      setBrightness(100)
      setContrast(100)
      setSaturation(100)
      setBlur(0)
      saveToHistory(filteredImg)
    }
    filteredImg.src = tempCanvas.toDataURL('image/png')
  }

  // Save final image
  const handleSave = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    
    // Convert to blob for better handling
    canvas.toBlob((blob) => {
      if (onSave) {
        onSave({
          dataUrl,
          blob,
          width: canvas.width,
          height: canvas.height
        })
      }
    }, 'image/png')
  }

  // Download image
  const downloadImage = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `edited-image-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // Preset crop ratios
  const presetCropRatios = [
    { label: 'Free', value: null },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4/3 },
    { label: '16:9', value: 16/9 },
    { label: '3:2', value: 3/2 },
    { label: '2:3', value: 2/3 },
  ]

  const applyPresetRatio = (ratio) => {
    if (!canvasRef.current || !ratio) return
    
    const canvas = canvasRef.current
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    let cropWidth, cropHeight
    
    if (ratio >= 1) {
      cropWidth = Math.min(canvas.width * 0.8, canvas.height * 0.8 * ratio)
      cropHeight = cropWidth / ratio
    } else {
      cropHeight = Math.min(canvas.height * 0.8, canvas.width * 0.8 / ratio)
      cropWidth = cropHeight * ratio
    }
    
    setCropRect({
      x: centerX - cropWidth / 2,
      y: centerY - cropHeight / 2,
      width: cropWidth,
      height: cropHeight
    })
  }

  if (!imageSrc) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
        <p className="text-gray-500">No image to edit</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode buttons */}
          <div className="flex items-center gap-1 bg-slate-600/50 rounded-lg p-1">
            <ToolButton 
              active={mode === 'view'} 
              onClick={() => setMode('view')}
              title="View"
            >
              <EyeIcon />
            </ToolButton>
            <ToolButton 
              active={mode === 'crop'} 
              onClick={() => setMode('crop')}
              title="Crop"
            >
              <CropIcon />
            </ToolButton>
            <ToolButton 
              active={mode === 'resize'} 
              onClick={() => setMode('resize')}
              title="Resize"
            >
              <ResizeIcon />
            </ToolButton>
            <ToolButton 
              active={mode === 'filters'} 
              onClick={() => setMode('filters')}
              title="Filters"
            >
              <FilterIcon />
            </ToolButton>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-500"></div>

          {/* Transform buttons */}
          <div className="flex items-center gap-1 bg-slate-600/50 rounded-lg p-1">
            <ToolButton onClick={rotateLeft} title="Rotate Left">
              <RotateLeftIcon />
            </ToolButton>
            <ToolButton onClick={rotateRight} title="Rotate Right">
              <RotateRightIcon />
            </ToolButton>
            <ToolButton 
              active={flipH} 
              onClick={() => setFlipH(!flipH)} 
              title="Flip Horizontal"
            >
              <FlipHIcon />
            </ToolButton>
            <ToolButton 
              active={flipV} 
              onClick={() => setFlipV(!flipV)} 
              title="Flip Vertical"
            >
              <FlipVIcon />
            </ToolButton>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-500"></div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2 bg-slate-600/50 rounded-lg px-3 py-1">
            <button 
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              className="text-white hover:text-blue-300 transition-colors"
            >
              <MinusIcon />
            </button>
            <span className="text-white text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="text-white hover:text-blue-300 transition-colors"
            >
              <PlusIcon />
            </button>
            <button 
              onClick={() => setZoom(1)}
              className="text-xs text-slate-400 hover:text-white transition-colors ml-1"
            >
              Reset
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-500"></div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 bg-slate-600/50 rounded-lg p-1">
            <ToolButton 
              onClick={undo} 
              disabled={historyIndex <= 0}
              title="Undo"
            >
              <UndoIcon />
            </ToolButton>
            <ToolButton 
              onClick={redo} 
              disabled={historyIndex >= history.length - 1}
              title="Redo"
            >
              <RedoIcon />
            </ToolButton>
          </div>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* Action buttons */}
          <button
            onClick={resetImage}
            className="px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors"
          >
            Reset
          </button>
          <button
            onClick={downloadImage}
            className="px-4 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <DownloadIcon />
            Download
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <CheckIcon />
            Save
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Mode-specific controls */}
      {mode === 'crop' && (
        <div className="bg-slate-100 p-4 border-b">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Aspect Ratio:</span>
            <div className="flex flex-wrap gap-2">
              {presetCropRatios.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPresetRatio(preset.value)}
                  className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => {
                  if (canvasRef.current) {
                    setCropRect({
                      x: 0,
                      y: 0,
                      width: canvasRef.current.width,
                      height: canvasRef.current.height
                    })
                  }
                }}
                className="px-3 py-1 text-sm bg-slate-700 text-white border border-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Select All
              </button>
            </div>
            <div className="flex-grow"></div>
            {cropRect && cropRect.width > 5 && cropRect.height > 5 && (
              <>
                <span className="text-sm text-slate-500 font-mono">
                  {Math.round(cropRect.width)} × {Math.round(cropRect.height)}px
                </span>
                <button
                  onClick={applyCrop}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors font-medium"
                >
                  ✓ Apply Crop
                </button>
                <button
                  onClick={cancelCrop}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded-lg transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Tips:</strong> Click and drag anywhere on the image to create a crop selection. 
              Drag the <strong>corners</strong> or <strong>edges</strong> to resize. 
              Drag <strong>inside</strong> the selection to move it. Use zoom controls to work with large images.
            </p>
          </div>
        </div>
      )}

      {mode === 'resize' && (
        <div className="bg-slate-100 p-4 border-b">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Width:</label>
              <input
                type="number"
                value={resizeWidth}
                onChange={(e) => handleWidthChange(e.target.value)}
                className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max={maxWidth}
              />
              <span className="text-slate-500 text-sm">px</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Height:</label>
              <input
                type="number"
                value={resizeHeight}
                onChange={(e) => handleHeightChange(e.target.value)}
                className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max={maxHeight}
              />
              <span className="text-slate-500 text-sm">px</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={maintainAspectRatio}
                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Lock aspect ratio</span>
            </label>
            <div className="flex-grow"></div>
            <button
              onClick={applyResize}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
            >
              Apply Resize
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Original size: {image?.width} × {image?.height}px
          </p>
        </div>
      )}

      {mode === 'filters' && (
        <div className="bg-slate-100 p-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterSlider
              label="Brightness"
              value={brightness}
              onChange={setBrightness}
              min={0}
              max={200}
              unit="%"
            />
            <FilterSlider
              label="Contrast"
              value={contrast}
              onChange={setContrast}
              min={0}
              max={200}
              unit="%"
            />
            <FilterSlider
              label="Saturation"
              value={saturation}
              onChange={setSaturation}
              min={0}
              max={200}
              unit="%"
            />
            <FilterSlider
              label="Blur"
              value={blur}
              onChange={setBlur}
              min={0}
              max={10}
              step={0.5}
              unit="px"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setBrightness(100)
                setContrast(100)
                setSaturation(100)
                setBlur(0)
              }}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded-lg transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Canvas container */}
      <div 
        ref={containerRef}
        className="relative overflow-auto bg-slate-800 p-4"
        style={{ maxHeight: '70vh' }}
      >
        {/* Checkerboard background for transparency */}
        <div 
          className="flex items-center justify-center min-h-[400px]"
          style={{
            backgroundImage: 'linear-gradient(45deg, #374151 25%, transparent 25%), linear-gradient(-45deg, #374151 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #374151 75%), linear-gradient(-45deg, transparent 75%, #374151 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        >
          <canvas
            ref={canvasRef}
            className="shadow-2xl"
            style={{ 
              backgroundColor: 'white',
              cursor: mode === 'crop' ? 'crosshair' : 'default'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-slate-100 px-4 py-2 text-xs text-slate-600 flex items-center justify-between border-t">
        <span>
          {image && `${Math.round(image.width * zoom)} × ${Math.round(image.height * zoom)}px`}
          {rotation !== 0 && ` • Rotated ${rotation}°`}
          {(flipH || flipV) && ` • Flipped ${flipH ? 'H' : ''}${flipV ? 'V' : ''}`}
        </span>
        <span>
          {mode === 'crop' && (cropRect ? 'Drag handles to adjust, or click Apply' : 'Click and drag to select crop area')}
          {mode === 'resize' && 'Enter dimensions and apply'}
          {mode === 'filters' && 'Adjust filters and apply'}
          {mode === 'view' && 'Select a tool to edit'}
        </span>
      </div>
    </div>
  )
}

// Tool Button Component
function ToolButton({ children, active, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-slate-300 hover:text-white hover:bg-slate-500'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  )
}

// Filter Slider Component
function FilterSlider({ label, value, onChange, min, max, step = 1, unit }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm text-slate-500">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  )
}

// Icons
const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const CropIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h12a2 2 0 012 2v12" />
  </svg>
)

const ResizeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
)

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
)

const RotateLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4V6" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l4.929-4.929A10 10 0 0121 12c0 5.523-4.477 10-10 10S1 17.523 1 12" />
  </svg>
)

const RotateRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-4V6" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10l-4.929-4.929A10 10 0 003 12c0 5.523 4.477 10 10 10s10-4.477 10-10" />
  </svg>
)

const FlipHIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l-4 5 4 5M16 7l4 5-4 5M12 3v18" />
  </svg>
)

const FlipVIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8l5-4 5 4M7 16l5 4 5-4M3 12h18" />
  </svg>
)

const UndoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
)

const RedoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
  </svg>
)

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)
