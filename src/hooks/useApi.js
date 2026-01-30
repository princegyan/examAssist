/**
 * Custom React Hook for API calls
 * Provides loading, error, and data states for async API operations
 */

import { useState, useCallback } from 'react';
import apiService from '../services/apiService';

export const useApi = (asyncFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err.message || 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return { execute, data, loading, error };
};

/**
 * Hook for creating exam codes
 */
export const useCreateExam = () => {
  return useApi((examCode) => apiService.createExamCode(examCode));
};

/**
 * Hook for listing exam codes
 */
export const useListExams = () => {
  const { execute, data, loading, error } = useApi(() => apiService.listExamCodes());

  return {
    fetchExams: execute,
    exams: data?.exams || [],
    totalExams: data?.totalExams || 0,
    loading,
    error,
  };
};

/**
 * Hook for uploading questions
 */
export const useUploadQuestion = () => {
  return useApi((examCode, file) => apiService.uploadQuestion(examCode, file));
};

/**
 * Hook for getting questions for an exam
 */
export const useGetQuestions = () => {
  const { execute, data, loading, error } = useApi((examCode) =>
    apiService.getQuestionsForExam(examCode)
  );

  return {
    fetchQuestions: execute,
    questions: data?.questions || [],
    totalQuestions: data?.totalQuestions || 0,
    loading,
    error,
  };
};

/**
 * Hook for comparing images (core feature)
 */
export const useCompareImage = () => {
  const { execute, data, loading, error } = useApi((file, textThreshold, imageThreshold) =>
    apiService.compareImage(file, textThreshold, imageThreshold)
  );

  return {
    compare: execute,
    result: data || null,
    topMatch: data?.topMatch || null,
    matches: data?.report || null,
    loading,
    error,
  };
};

/**
 * Hook for getting statistics
 */
export const useStatistics = () => {
  const { execute, data, loading, error } = useApi(() => apiService.getStatistics());

  return {
    fetchStats: execute,
    stats: data?.statistics || null,
    loading,
    error,
  };
};

/**
 * Hook for health check
 */
export const useHealthCheck = () => {
  const { execute, data, loading, error } = useApi(() => apiService.healthCheck());

  return {
    checkHealth: execute,
    isHealthy: data?.status === 'OK',
    mongodbConfigured: data?.mongodb === 'configured',
    loading,
    error,
  };
};
