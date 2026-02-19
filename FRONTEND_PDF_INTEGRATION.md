# Frontend PDF Integration Guide

## Overview
The frontend now includes complete PDF export functionality for exam questions. Users can export all questions or select specific ones to create custom PDFs.

## Components Added

### 1. PDFExport Component
**File:** `src/components/PDFExport.jsx`

**Features:**
- Export all exam questions to PDF with one click
- Select specific questions and create custom PDFs
- Custom PDF title input
- Progress indicators and error handling
- Responsive modal UI for selection

**Props:**
```javascript
<PDFExport 
  examCode="CSCI101"           // Required: Exam identifier
  questions={questionsArray}   // Required: Array of question objects
  mode="full"                  // Optional: UI mode
/>
```

## Integration Points

### 1. ViewQuestions Page
**File:** `src/pages/ViewQuestions.jsx`

The `PDFExport` component is now integrated into the question viewing page, appearing above the questions list.

```javascript
import PDFExport from '../components/PDFExport'

// In component:
<PDFExport examCode={examCode} questions={questions} />
```

### 2. API Service
**File:** `src/services/apiService.js`

New methods added:
```javascript
// Export entire exam to PDF
exportExamToPDF(examCode) -> Promise<Blob>

// Convert selected images to PDF
imagesToPDF(examCode, imageUrls, title) -> Promise<Blob>

// Helper to download PDF blob
downloadPDF(blob, filename) -> void
```

## User Interface

### Export Buttons

**Button 1: Export Full Exam**
- Green gradient button
- Exports all questions at once
- Downloads as: `{examCode}-questions-{timestamp}.pdf`

**Button 2: Select & Export**
- Amber gradient button
- Opens modal for selective export
- Downloads as: `{examCode}-selected-{timestamp}.pdf`

### Selection Modal

Features:
- Grid view of all questions with thumbnails
- Checkbox selection for each question
- Select/Clear all buttons
- Custom PDF title input
- Real-time selection count
- Preview of extracted text

## API Endpoints Used

### 1. Export All Questions
```
POST /api/exam/:examCode/export-pdf
Response: Binary PDF file
Timeout: 120 seconds
```

### 2. Export Selected Questions
```
POST /api/exam/:examCode/images-to-pdf
Body: {
  imageUrls: ["url1", "url2", ...],
  title?: "Custom Title"
}
Response: Binary PDF file
Timeout: 120 seconds
```

## Error Handling

**Displayed Errors:**
- No exam code provided
- No questions available
- No valid images found
- PDF generation timeout
- Network failures
- API errors

**User Feedback:**
- Red error banner with icon
- Helpful error messages
- Automatic error clearing on new attempt

## Performance Considerations

**Limits:**
- Max 50 images per PDF (backend limit)
- Max 2 minute timeout per export
- Automatic image optimization

**UX Improvements:**
- Loading spinners during export
- Disabled buttons while processing
- Blob streaming (no large memory footprint)
- Modal prevents accidental page navigation

## Usage Flow

### Full Export
1. User views exam questions
2. Clicks "Export to PDF" button
3. System downloads all questions as PDF
4. Browser handles download automatically

### Selective Export
1. User views exam questions
2. Clicks "Select & Export" button
3. Modal opens showing all questions
4. User selects desired questions (or Select All)
5. (Optional) User updates PDF title
6. User clicks "Export PDF"
7. Selected questions downloaded as PDF

## Example Implementation in Other Components

To add PDF export to another page:

```javascript
import PDFExport from '../components/PDFExport'

export default function MyCustomPage() {
  const [questions, setQuestions] = useState([])
  const examCode = 'CUSTOM-001'

  return (
    <div>
      <PDFExport 
        examCode={examCode} 
        questions={questions}
      />
      {/* Rest of component */}
    </div>
  )
}
```

## Testing Checklist

- [ ] Full export downloads PDF with all questions
- [ ] PDF contains all images in correct order
- [ ] PDFs are readable and properly formatted
- [ ] Page numbers appear at bottom
- [ ] Generation timestamp is included
- [ ] Select & Export modal opens/closes properly
- [ ] Select All/Clear All work correctly
- [ ] Custom title updates in PDF
- [ ] Error messages display appropriately
- [ ] Large exports (50 images) complete within timeout
- [ ] Browser handles large PDF downloads smoothly

## Files Modified

1. `src/components/PDFExport.jsx` - New export component
2. `src/pages/ViewQuestions.jsx` - Integrated PDF export
3. `src/services/apiService.js` - Added PDF API methods

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (not supported)

Requires support for:
- Blob API
- Fetch API with blob responses
- URL.createObjectURL()
- Dynamic anchor element creation
