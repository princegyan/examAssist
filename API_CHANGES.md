# API Endpoint Updates - Quick Reference

## What Changed?

All frontend API calls have been updated to match your official API specification exactly.

## 📍 Endpoint Changes

### Before (Incorrect)
```
GET    /exam/list
POST   /exam/create
POST   /exam/:examCode/upload
GET    /exam/:examCode/questions
POST   /exam/compare
GET    /exam/stats
```

### After (Correct) ✅
```
GET    /api/exam/list
POST   /api/exam/create
POST   /api/exam/:examCode/upload
GET    /api/exam/:examCode/questions
POST   /api/exam/compare
GET    /api/exam/stats
GET    /health
```

## 🎯 Key Parameter Updates

### Compare Image Endpoint
**Now supports BOTH thresholds** (was only textThreshold before):

```javascript
// Before
POST /exam/compare
{
  image: File,
  textThreshold: 0.55
}

// After ✅
POST /api/exam/compare
{
  image: File,
  textThreshold: 0.65,
  imageThreshold: 0.65
}
```

### Frontend Component Updates

1. **src/pages/CompareImage.jsx**
   - Added `imageThreshold` state variable
   - Added second slider UI for image threshold control
   - Both sliders default to 0.65 (per spec)
   - Dual threshold info displayed to user

2. **src/services/api.js**
   - Updated `compareImage()` function signature
   - Now accepts both `textThreshold` and `imageThreshold` parameters

## 🧪 Testing Checklist

- [ ] Frontend loads at http://localhost:5173
- [ ] All 4 main pages display correctly
  - [ ] Exam Codes (Create/List)
  - [ ] Upload Question
  - [ ] Compare Image (check for 2 sliders)
  - [ ] View Questions
- [ ] API Test page shows passing results for:
  - [ ] GET /health
  - [ ] GET /api/exam/list
  - [ ] GET /api/exam/stats
- [ ] Create Exam works (POST /api/exam/create)
- [ ] Upload Question works (POST /api/exam/:examCode/upload)
- [ ] Compare Image works with dual thresholds (POST /api/exam/compare)
- [ ] View Questions displays uploaded images (GET /api/exam/:examCode/questions)

## 📂 Files Modified

| File | Changes |
|------|---------|
| src/services/api.js | All 7 endpoints updated to use `/api/` prefix |
| src/pages/ExamList.jsx | Updated GET/POST calls to use `/api/exam/` prefix |
| src/pages/UploadQuestion.jsx | Updated POST to use `/api/exam/` prefix |
| src/pages/CompareImage.jsx | Updated POST to `/api/exam/compare` + added imageThreshold |
| src/pages/ViewQuestions.jsx | Updated GET to use `/api/exam/` prefix |

## 🔗 Related Documentation

- See [API_SPECIFICATION_ALIGNMENT.md](API_SPECIFICATION_ALIGNMENT.md) for detailed endpoint mapping
- See [API_TESTING.json](../API_TESTING.json) for postman collection

## ✅ Status: Complete

All frontend code is now synchronized with your official API specification.
Backend must have `/api/` routes implemented for frontend to work properly.

---
**Updated**: January 28, 2026
