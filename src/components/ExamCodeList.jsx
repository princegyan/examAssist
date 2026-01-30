/**
 * ExamCodeList Component
 * Displays all exam codes and allows creating new exams
 */

import React, { useState, useEffect } from 'react';
import { useListExams, useCreateExam } from '../hooks/useApi';
import '../styles/ExamCodeList.css'; // Ensure to create this file

const ExamCodeList = ({ onSelectExam }) => {
  const { fetchExams, exams, totalExams, loading: listLoading, error: listError } = useListExams();
  const { execute: createExam, loading: createLoading, error: createError } = useCreateExam();
  const [newExamCode, setNewExamCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch exams on component mount
  useEffect(() => {
    fetchExams().catch(console.error);
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!newExamCode.trim()) {
      alert('Please enter an exam code');
      return;
    }

    try {
      await createExam(newExamCode);
      alert(`Exam code "${newExamCode}" created successfully!`);
      setNewExamCode('');
      setShowCreateForm(false);
      // Refresh the exam list
      fetchExams().catch(console.error);
    } catch (err) {
      alert(`Failed to create exam: ${err.message}`);
    }
  };

  return (
    <div className="exam-code-list">
      <div className="exam-header">
        <h2>Exam Codes</h2>
        <span className="badge">{totalExams}</span>
      </div>

      {listError && (
        <div className="error-message">
          ❌ Failed to load exams: {listError}
        </div>
      )}

      {createError && (
        <div className="error-message">
          ❌ Failed to create exam: {createError}
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={() => setShowCreateForm(!showCreateForm)}
        disabled={createLoading}
      >
        {showCreateForm ? 'Cancel' : '+ New Exam Code'}
      </button>

      {showCreateForm && (
        <form onSubmit={handleCreateExam} className="create-exam-form">
          <input
            type="text"
            value={newExamCode}
            onChange={(e) => setNewExamCode(e.target.value)}
            placeholder="e.g., TEMENOS_T24_001"
            disabled={createLoading}
          />
          <button type="submit" disabled={createLoading} className="btn btn-success">
            {createLoading ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {listLoading ? (
        <div className="loading">Loading exam codes...</div>
      ) : exams.length === 0 ? (
        <div className="empty-state">No exam codes found. Create one to get started!</div>
      ) : (
        <div className="exam-list">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="exam-card"
              onClick={() => onSelectExam(exam.examCode)}
            >
              <h3>{exam.examCode}</h3>
              <p className="meta">Questions: {exam.questionCount}</p>
              <p className="meta">Created: {new Date(exam.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamCodeList;
