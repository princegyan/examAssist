/**
 * QuestionUploadForm Component
 * Handles uploading question images for an exam code
 */

import React, { useState, useRef } from 'react';
import { useUploadQuestion } from '../hooks/useApi';
import '../styles/QuestionUploadForm.css';

const QuestionUploadForm = ({ examCode, onUploadSuccess }) => {
  const { execute: uploadQuestion, loading, error } = useUploadQuestion();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    if (!examCode) {
      alert('Please select an exam code first');
      return;
    }

    try {
      setUploadProgress(10);
      const response = await uploadQuestion(examCode, selectedFile);
      setUploadProgress(100);

      // Success
      alert(`Question uploaded successfully!\nHash: ${response.hash}`);
      setSelectedFile(null);
      setPreview(null);
      setUploadProgress(0);
      fileInputRef.current.value = '';

      // Call callback
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
      setUploadProgress(0);
    }
  };

  return (
    <div className="question-upload-form">
      <h3>📤 Upload Question Image</h3>

      {!examCode && (
        <div className="warning-message">
          ⚠️ Please select an exam code first
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div className="file-input-wrapper">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading}
            className="file-input"
          />
          <label className="file-input-label">
            {selectedFile ? '✓ File selected' : '📁 Choose image...'}
          </label>
        </div>

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            <p className="file-name">{selectedFile.name}</p>
            <p className="file-size">
              Size: {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || !examCode || loading}
          className="btn btn-success"
        >
          {loading ? '⏳ Uploading...' : '📤 Upload Question'}
        </button>
      </form>

      <div className="upload-info">
        <h4>Accepted Formats:</h4>
        <ul>
          <li>JPEG (.jpg, .jpeg)</li>
          <li>PNG (.png)</li>
          <li>GIF (.gif)</li>
          <li>WebP (.webp)</li>
        </ul>
        <p>Max file size: 10 MB</p>
      </div>
    </div>
  );
};

export default QuestionUploadForm;
