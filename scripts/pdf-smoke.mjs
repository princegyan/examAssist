// Simple PDF export smoke test
// Usage: EXAM_CODE=T3TAAL IMAGE_URLS="url1,url2" npm run smoke:pdf
const examCode = process.env.EXAM_CODE
const imageUrlsEnv = process.env.IMAGE_URLS || ''
const API_BASE = process.env.VITE_API_BASE_URL || 'https://inlaks-t24-backend.vercel.app'

if (!examCode) {
  console.error('Missing EXAM_CODE env var')
  process.exit(1)
}

const imageUrls = imageUrlsEnv
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const COMMON_HEADERS = {
  Accept: 'application/pdf'
}

if (imageUrls.length === 0) {
  console.error('Missing IMAGE_URLS env var (comma-separated URLs)')
  process.exit(1)
}

async function fetchPdf(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('pdf')) {
    throw new Error(`Unexpected content-type: ${contentType}`)
  }
  const buf = await res.arrayBuffer()
  if (buf.byteLength === 0) {
    throw new Error('Empty PDF response')
  }
  return buf.byteLength
}

async function run() {
  console.log(`Running PDF smoke for exam: ${examCode}`)

  // Full exam export
  const fullUrl = `${API_BASE}/api/exam/${encodeURIComponent(examCode)}/export-pdf`
  const fullSize = await fetchPdf(fullUrl, { method: 'POST', headers: COMMON_HEADERS })
  console.log(`Full export OK (${fullSize} bytes) → ${fullUrl}`)

  // Selected images export
  const selUrl = `${API_BASE}/api/exam/${encodeURIComponent(examCode)}/images-to-pdf`
  const selSize = await fetchPdf(selUrl, {
    method: 'POST',
    headers: {
      ...COMMON_HEADERS,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageUrls, title: `${examCode} - Smoke Test` })
  })
  console.log(`Selective export OK (${selSize} bytes) → ${selUrl}`)

  console.log('PDF smoke test completed')
}

run().catch(err => {
  console.error('Smoke test failed:', err.message)
  process.exit(1)
})
