import { useState, useEffect } from 'react'
import { testApiEndpoints, getStats } from '../services/api'
import { Button } from '../components/Button'

export default function ApiTest() {
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    setLoading(true)
    const results = await testApiEndpoints()
    setTestResults(results)

    // Get stats
    const statsResult = await getStats()
    if (statsResult.success) {
      setStats(statsResult.data)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0056D2] to-[#003E9C] rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-lg p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>API Endpoint Tests</h2>
            <p className="text-blue-100">Test connectivity to backend services</p>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1F1F1F]">Run API Tests</h3>
            <p className="text-sm text-[#636363]">Check all endpoint connectivity</p>
          </div>
          <Button
            onClick={runTests}
            disabled={loading}
            variant={loading ? 'secondary' : 'primary'}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              </span>
            ) : (
              'Run Tests'
            )}
          </Button>
        </div>
      </div>

      {/* Test Results */}
      {testResults && testResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-[#1F1F1F]">Test Results</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {testResults.map((result, idx) => {
              const isSuccess = result.status && result.status.includes('✅')
              return (
                <div
                  key={idx}
                  className={`p-5 flex items-start gap-4 ${isSuccess ? 'bg-white' : 'bg-red-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSuccess ? 'bg-[#E6F4ED]' : 'bg-red-100'
                  }`}>
                    {isSuccess ? (
                      <svg className="w-5 h-5 text-[#00875A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1F1F1F]">{result.endpoint}</p>
                    <p className={`text-sm ${isSuccess ? 'text-[#00875A]' : 'text-red-600'}`}>
                      {result.status}
                    </p>
                    {result.data && (
                      <p className="text-sm text-[#636363] mt-1 truncate">{result.data}</p>
                    )}
                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Server Stats */}
      {stats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-[#E8F0FE]">
            <h3 className="font-bold text-[#0056D2] flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Server Statistics
            </h3>
          </div>
          <div className="p-6">
            <pre className="text-sm bg-[#F8FAFC] rounded-lg p-4 overflow-x-auto border border-gray-200 text-[#1F1F1F]">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
