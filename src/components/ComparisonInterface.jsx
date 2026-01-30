/**
 * ComparisonInterface Component
 * Core feature: Upload an image and get dual-matching comparison results
 */

import React, { useState, useRef } from 'react';
import { useCompareImage } from '../hooks/useApi';
import '../styles/ComparisonInterface.css';

const ComparisonInterface = () => {
  const { compare, result, topMatch, loading, error } = useCompareImage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [textThreshold, setTextThreshold] = useState(0.65);
  const [imageThreshold, setImageThreshold] = useState(0.65);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select an image to compare');
      return;
    }

    try {
      await compare(selectedFile, textThreshold, imageThreshold);
    } catch (err) {
      console.error('Comparison failed:', err);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#27ae60'; // GREEN
    if (confidence >= 0.6) return '#f39c12'; // ORANGE
    return '#e74c3c'; // RED
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return 'HIGH ✓';
    if (confidence >= 0.6) return 'MEDIUM ~';
    return 'LOW ✗';
  };

  return (
    <div className="comparison-interface">
      <h2>🔍 Image Comparison (Dual Matching)</h2>

      <form onSubmit={handleCompare} className="comparison-form">
        <div className="form-section">
          <label>Select Image to Compare</label>
          <div className="file-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={loading}
            />
            <label className="file-input-label">
              {selectedFile ? `✓ ${selectedFile.name}` : '📁 Choose image...'}
            </label>
          </div>
        </div>

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
          </div>
        )}

        <div className="thresholds-section">
          <div className="threshold-input">
            <label htmlFor="textThreshold">
              📝 Text Similarity Threshold: {textThreshold.toFixed(2)}
            </label>
            <input
              id="textThreshold"
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={textThreshold}
              onChange={(e) => setTextThreshold(parseFloat(e.target.value))}
              disabled={loading}
            />
            <span className="threshold-desc">
              Higher = stricter text matching requirement
            </span>
          </div>

          <div className="threshold-input">
            <label htmlFor="imageThreshold">
              🖼️ Image Similarity Threshold: {imageThreshold.toFixed(2)}
            </label>
            <input
              id="imageThreshold"
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={imageThreshold}
              onChange={(e) => setImageThreshold(parseFloat(e.target.value))}
              disabled={loading}
            />
            <span className="threshold-desc">
              Higher = stricter image matching requirement
            </span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            ❌ Comparison failed: {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || loading}
          className="btn btn-primary btn-large"
        >
          {loading ? '⏳ Comparing...' : '🔍 Compare Image'}
        </button>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing image with OCR and comparing against database...</p>
        </div>
      )}

      {result && (
        <div className="results-container">
          <h3>📊 Comparison Results</h3>

          {topMatch ? (
            <div className="top-match-card">
              <div className="confidence-badge" style={{ borderColor: getConfidenceColor(topMatch.confidence) }}>
                <span style={{ color: getConfidenceColor(topMatch.confidence) }}>
                  {getConfidenceLevel(topMatch.confidence)}
                </span>
                <span className="confidence-score">
                  {(topMatch.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <h4>Top Match</h4>

              <div className="match-details">
                <div className="detail-row">
                  <span className="label">📝 Text Similarity:</span>
                  <span className="value" style={{ color: getConfidenceColor(topMatch.textSimilarity) }}>
                    {(topMatch.textSimilarity * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">🖼️ Image Similarity:</span>
                  <span className="value" style={{ color: getConfidenceColor(topMatch.imageSimilarity) }}>
                    {(topMatch.imageSimilarity * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Extracted Text:</span>
                  <span className="value">{topMatch.extractedText}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Exam Code:</span>
                  <span className="value">{topMatch.examCode}</span>
                </div>
              </div>

              {topMatch.matchedImage && (
                <div className="matched-image">
                  <p>Matched Question Image:</p>
                  <img src={topMatch.matchedImage} alt="Matched" />
                </div>
              )}
            </div>
          ) : (
            <div className="no-match">
              <p>❌ No matching questions found in the database.</p>
              <p>Try uploading more questions or adjusting the thresholds.</p>
            </div>
          )}

          {result.report && result.report.length > 0 && (
            <div className="all-matches-section">
              <h4>📋 All Matches ({result.report.length})</h4>
              <div className="matches-list">
                {result.report.map((match, index) => (
                  <div key={index} className="match-item">
                    <span className="match-rank">#{index + 1}</span>
                    <span className="match-exam">{match.examCode}</span>
                    <div className="match-scores">
                      <span className="score text" title="Text Similarity">
                        📝 {(match.textSimilarity * 100).toFixed(0)}%
                      </span>
                      <span className="score image" title="Image Similarity">
                        🖼️ {(match.imageSimilarity * 100).toFixed(0)}%
                      </span>
                      <span className="score combined" title="Combined Confidence">
                        ⭐ {(match.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComparisonInterface;
