import { useState, useCallback } from 'react'

/**
 * Custom hook for image editing functionality
 * Provides programmatic access to image transformations
 */
export function useImageEditor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Crop an image to specified dimensions
   * @param {string} imageSrc - Base64 or URL of the image
   * @param {Object} cropRect - { x, y, width, height } in pixels
   * @returns {Promise<{dataUrl: string, blob: Blob, width: number, height: number}>}
   */
  const cropImage = useCallback(async (imageSrc, cropRect) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const img = await loadImage(imageSrc)
      const canvas = document.createElement('canvas')
      canvas.width = cropRect.width
      canvas.height = cropRect.height
      const ctx = canvas.getContext('2d')
      
      ctx.drawImage(
        img,
        cropRect.x, cropRect.y,
        cropRect.width, cropRect.height,
        0, 0,
        cropRect.width, cropRect.height
      )
      
      return await canvasToResult(canvas)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [])

  /**
   * Resize an image to specified dimensions
   * @param {string} imageSrc - Base64 or URL of the image
   * @param {number} width - Target width
   * @param {number} height - Target height
   * @param {boolean} maintainAspectRatio - If true, maintains aspect ratio using the smaller dimension
   * @returns {Promise<{dataUrl: string, blob: Blob, width: number, height: number}>}
   */
  const resizeImage = useCallback(async (imageSrc, width, height, maintainAspectRatio = false) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const img = await loadImage(imageSrc)
      
      let targetWidth = width
      let targetHeight = height
      
      if (maintainAspectRatio) {
        const aspectRatio = img.width / img.height
        if (width / height > aspectRatio) {
          targetWidth = height * aspectRatio
        } else {
          targetHeight = width / aspectRatio
        }
      }
      
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')
      
      // High-quality image smoothing
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
      
      return await canvasToResult(canvas)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [])

  /**
   * Rotate an image by specified degrees
   * @param {string} imageSrc - Base64 or URL of the image
   * @param {number} degrees - Rotation in degrees (90, 180, 270)
   * @returns {Promise<{dataUrl: string, blob: Blob, width: number, height: number}>}
   */
  const rotateImage = useCallback(async (imageSrc, degrees) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const img = await loadImage(imageSrc)
      const radians = (degrees * Math.PI) / 180
      
      const isRotated90 = degrees === 90 || degrees === 270
      const canvas = document.createElement('canvas')
      canvas.width = isRotated90 ? img.height : img.width
      canvas.height = isRotated90 ? img.width : img.height
      const ctx = canvas.getContext('2d')
      
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(radians)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      
      return await canvasToResult(canvas)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [])

  /**
   * Flip an image horizontally or vertically
   * @param {string} imageSrc - Base64 or URL of the image
   * @param {'horizontal' | 'vertical'} direction - Flip direction
   * @returns {Promise<{dataUrl: string, blob: Blob, width: number, height: number}>}
   */
  const flipImage = useCallback(async (imageSrc, direction) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const img = await loadImage(imageSrc)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      
      if (direction === 'horizontal') {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      } else {
        ctx.translate(0, canvas.height)
        ctx.scale(1, -1)
      }
      
      ctx.drawImage(img, 0, 0)
      
      return await canvasToResult(canvas)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [])

  /**
   * Apply filters to an image
   * @param {string} imageSrc - Base64 or URL of the image
   * @param {Object} filters - { brightness, contrast, saturation, blur }
   * @returns {Promise<{dataUrl: string, blob: Blob, width: number, height: number}>}
   */
  const applyFilters = useCallback(async (imageSrc, filters = {}) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const img = await loadImage(imageSrc)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      
      const {
        brightness = 100,
        contrast = 100,
        saturation = 100,
        blur = 0
      } = filters
      
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`
      ctx.drawImage(img, 0, 0)
      
      return await canvasToResult(canvas)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [])

  /**
   * Convert image to grayscale
   * @param {string} imageSrc - Base64 or URL of the image
   * @returns {Promise<{dataUrl: string, blob: Blob, width: number, height: number}>}
   */
  const grayscale = useCallback(async (imageSrc) => {
    return applyFilters(imageSrc, { saturation: 0 })
  }, [applyFilters])

  /**
   * Get image dimensions without loading it fully
   * @param {string} imageSrc - Base64 or URL of the image
   * @returns {Promise<{width: number, height: number}>}
   */
  const getImageDimensions = useCallback(async (imageSrc) => {
    const img = await loadImage(imageSrc)
    return { width: img.width, height: img.height }
  }, [])

  /**
   * Compress an image by reducing quality
   * @param {string} imageSrc - Base64 or URL of the image
   * @param {number} quality - Quality from 0 to 1
   * @param {string} format - 'image/jpeg' or 'image/webp'
   * @returns {Promise<{dataUrl: string, blob: Blob, width: number, height: number}>}
   */
  const compressImage = useCallback(async (imageSrc, quality = 0.8, format = 'image/jpeg') => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const img = await loadImage(imageSrc)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      
      ctx.drawImage(img, 0, 0)
      
      return await canvasToResult(canvas, format, quality)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    cropImage,
    resizeImage,
    rotateImage,
    flipImage,
    applyFilters,
    grayscale,
    getImageDimensions,
    compressImage,
    isProcessing,
    error
  }
}

// Helper function to load an image
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

// Helper function to convert canvas to result object
async function canvasToResult(canvas, format = 'image/png', quality = 1) {
  const dataUrl = canvas.toDataURL(format, quality)
  
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve({
          dataUrl,
          blob,
          width: canvas.width,
          height: canvas.height
        })
      },
      format,
      quality
    )
  })
}

export default useImageEditor
