# Inlaks T24 Frontend - React + Tailwind

## Project Structure

```
InlaksT24Frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx          - Application header with title
│   │   └── Navigation.jsx      - Tab-based navigation
│   ├── pages/
│   │   ├── ExamList.jsx        - Create and list exams
│   │   ├── UploadQuestion.jsx  - Upload images with OCR
│   │   ├── CompareImage.jsx    - Compare images and view results
│   │   └── ViewQuestions.jsx   - View extracted texts
│   ├── App.jsx                 - Main app component
│   ├── main.jsx                - Entry point
│   └── index.css               - Tailwind CSS
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

## Available Pages

### 1. Exam Codes (📋)
- **Create new exam codes**
- View all exams with question counts
- Select exam to upload questions

### 2. Upload Questions (📤)
- Select images to upload
- Automatic OCR extraction using Tesseract.js
- View extracted text from uploaded images
- Character count and quality metrics

### 3. Compare Images (🔍)
- Upload an image to compare
- Adjustable text similarity threshold (0.0 - 1.0)
- See matches with similarity scores
- Confidence levels (HIGH, MEDIUM, LOW)
- View extracted text of matches

### 4. View Questions (coming soon)
- Browse all questions in an exam
- Expand to view full extracted text
- See metadata (upload date, character count)

## Features

✅ **Clean UI** - Modern Tailwind CSS design
✅ **Responsive** - Works on desktop and mobile
✅ **Real-time Preview** - Image preview before upload
✅ **Progress Indicators** - Visual feedback during operations
✅ **Error Handling** - Clear error messages
✅ **Color Coded Results** - Easy to understand matches
✅ **Interactive Charts** - Similarity score visualization

## API Integration

Frontend communicates with backend at: `https://inlaks-t24-backend.vercel.app`

Endpoints:
- `GET /exam/list` - List all exams
- `POST /exam/create` - Create new exam
- `POST /exam/:examCode/upload` - Upload question
- `GET /exam/:examCode/questions` - View questions
- `POST /exam/compare` - Compare image

## Styling

- **Framework**: Tailwind CSS
- **Colors**:
  - Primary: Blue (#3B82F6)
  - Secondary: Gray (#1F2937)
  - Success: Green (#10B981)
  - Error: Red (#EF4444)

## Running Locally

```bash
# Development
npm run dev        # http://localhost:5173

# Production build
npm run build      # Creates dist/

# Preview build
npm run preview
```

## Building for Production

```bash
npm run build
```

This creates an optimized `dist/` folder ready for deployment.

## Environment Setup

Backend must be running on `https://inlaks-t24-backend.vercel.app` for the frontend to work properly.

### Backend Requirements:
- Node.js + Express
- MongoDB
- Tesseract.js (for OCR)

### Frontend Requirements:
- Node.js 14+
- npm or yarn

## Dependencies

- **react**: UI framework
- **axios**: HTTP client
- **tailwindcss**: CSS framework
- **vite**: Build tool

## Development Tips

1. **Hot Module Replacement**: Changes auto-refresh
2. **Console Errors**: Check browser DevTools
3. **CORS Issues**: Ensure backend allows frontend origin
4. **Image Upload**: Supports JPG, PNG, GIF
5. **Threshold Tuning**: Lower = more matches, Higher = stricter

## Next Steps

- Add authentication (login/logout)
- Implement exam history
- Add batch upload
- Export results as PDF
- Performance optimizations
