/**
 * Custom React Hook for API calls
 * Provides loading, error, and data states for async API operations
 * Includes cache support for improved performance
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import apiService from '../services/apiService';

export const useApi = (asyncFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastFetchTime = useRef(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        lastFetchTime.current = Date.now();
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

  return { execute, data, loading, error, lastFetchTime: lastFetchTime.current };
};

/**
 * Hook for creating exam codes
 */
export const useCreateExam = () => {
  return useApi((examCode) => apiService.createExamCode(examCode));
};

/**
 * Hook for listing exam codes with cache support
 */
export const useListExams = () => {
  const [forceRefresh, setForceRefresh] = useState(false);
  const { execute, data, loading, error } = useApi((refresh = false) => 
    apiService.listExamCodes(refresh)
  );

  const fetchExams = useCallback((refresh = false) => {
    setForceRefresh(refresh);
    return execute(refresh);
  }, [execute]);

  const refresh = useCallback(() => fetchExams(true), [fetchExams]);

  return {
    fetchExams,
    refresh, // Force refresh bypassing cache
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
 * Hook for getting questions for an exam with cache support
 */
export const useGetQuestions = () => {
  const { execute, data, loading, error } = useApi((examCode, forceRefresh = false) =>
    apiService.getQuestionsForExam(examCode, forceRefresh)
  );

  const fetchQuestions = useCallback((examCode, forceRefresh = false) => {
    return execute(examCode, forceRefresh);
  }, [execute]);

  const refresh = useCallback((examCode) => fetchQuestions(examCode, true), [fetchQuestions]);

  return {
    fetchQuestions,
    refresh, // Force refresh bypassing cache
    questions: data?.questions || [],
    totalQuestions: data?.totalQuestions || 0,
    loading,
    error,
  };
};

/**
 * Hook for comparing images (core feature)
 * Note: Comparison results are not cached as each comparison is unique
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
 * Hook for getting statistics with cache support
 */
export const useStatistics = () => {
  const { execute, data, loading, error } = useApi((forceRefresh = false) => 
    apiService.getStatistics(forceRefresh)
  );

  const fetchStats = useCallback((forceRefresh = false) => execute(forceRefresh), [execute]);
  const refresh = useCallback(() => fetchStats(true), [fetchStats]);

  return {
    fetchStats,
    refresh,
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

/**
 * Hook for managing cache
 */
export const useCache = () => {
  const clearAll = useCallback(() => {
    apiService.clearCache();
  }, []);

  const getStats = useCallback(() => {
    return apiService.getCacheStats();
  }, []);

  const invalidate = useCallback((pattern) => {
    apiService.invalidateCache(pattern);
  }, []);

  return {
    clearAll,
    getStats,
    invalidate
  };
};
