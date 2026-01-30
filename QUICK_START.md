# Quick Start Guide - API Updates

## 🚀 5-Minute Setup

### Step 1: Understand What Changed
Your API specification had endpoints with `/api/` prefix. The frontend was calling endpoints WITHOUT the prefix. This has been fixed.

**Summary**:
- ✅ All endpoints now use `/api/` prefix (e.g., `/api/exam/list`)
- ✅ Compare endpoint now supports both `textThreshold` and `imageThreshold`
- ✅ Default threshold values changed from 0.55 to 0.65
- ✅ UI updated with dual threshold sliders

### Step 2: Start Both Servers

```bash
# Terminal 1 - Backend
cd c:\Users\agyan\Desktop\Dev\InlaksT24Backend
npm start
# Should see: "Server running on port 5000"

# Terminal 2 - Frontend  
cd c:\Users\agyan\Desktop\Dev\InlaksT24Frontend
npm run dev
# Should see: "Local: http://localhost:5173"
```

### Step 3: Open Frontend
Visit: **http://localhost:5173**

You should see 4 tabs:
- 📋 Exam Codes
- 📤 Upload Question
- 🔍 Compare Image
- 🧪 API Test

### Step 4: Test the Workflow

1. **Create Exam** (Exam Codes tab)
   - Enter: `TEMENOS_T24_001`
   - Click: Create button
   - Should see exam in list

2. **Upload Question** (Upload Question tab)
   - Select exam: `TEMENOS_T24_001`
   - Select image file
   - Click: Upload button
   - Should see extracted text

3. **Compare Image** (Compare Image tab) ⭐ NEW
   - Select image to compare
   - **NEW**: Adjust TEXT threshold slider (e.g., 0.65)
   - **NEW**: Adjust IMAGE threshold slider (e.g., 0.65)
   - Click: Compare button
   - Should see matching results with scores

4. **View Questions** (View Questions tab)
   - Select exam: `TEMENOS_T24_001`
   - Should see all uploaded images

5. **Test Endpoints** (API Test tab)
   - Click: Run Tests
   - Should see 3 green checkmarks for:
     - GET /health
     - GET /api/exam/list
     - GET /api/exam/stats

---

## 📊 What Changed (Technical)

### Files Modified: 5

| File | Changes | Impact |
|------|---------|--------|
| api.js | All endpoints → `/api/` prefix | High |
| ExamList.jsx | Routes → `/api/exam/` | Medium |
| UploadQuestion.jsx | Routes → `/api/exam/` | Medium |
| CompareImage.jsx | Added imageThreshold slider | High |
| ViewQuestions.jsx | Routes → `/api/exam/` | Medium |

### API Routes: Updated

```
Before                          After
GET  /exam/list          →      GET  /api/exam/list
POST /exam/create        →      POST /api/exam/create
POST /exam/{code}/upload →      POST /api/exam/{code}/upload
GET  /exam/{code}/q...   →      GET  /api/exam/{code}/questions
POST /exam/compare       →      POST /api/exam/compare
GET  /exam/stats         →      GET  /api/exam/stats
                                 GET  /health (NEW)
```

### Compare Endpoint: Now Supports Dual Thresholds

```javascript
// Before
{
  textThreshold: 0.55
}

// After ✅
{
  textThreshold: 0.65,
  imageThreshold: 0.65
}
```

---

## ⚠️ Important: Backend Requirements

For the frontend to work, **your backend MUST**:

1. **Use `/api/` prefix** in all routes:
   ```javascript
   // ✅ Correct
   app.post('/api/exam/create', ...)
   app.get('/api/exam/list', ...)
   
   // ❌ Wrong
   app.post('/exam/create', ...)
   app.get('/exam/list', ...)
   ```

2. **Support both thresholds** in compare endpoint:
   ```javascript
   // Backend must accept both:
   const textThreshold = req.body.textThreshold
   const imageThreshold = req.body.imageThreshold
   ```

3. **Enable CORS** for frontend:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:5173'
   }))
   ```

---

## 🐛 Troubleshooting

### Q: I see "Failed to fetch"
**A**: Backend not running or CORS not enabled
- Check backend is running on port 5000
- Check CORS is enabled in backend

### Q: I see "404 not found"
**A**: Backend routes don't have `/api/` prefix
- Update backend routes to include `/api/`
- Example: `/exam/list` → `/api/exam/list`

### Q: Compare button doesn't work
**A**: Backend compare endpoint needs imageThreshold support
- Check backend accepts `imageThreshold` parameter
- Verify backend applies both thresholds to matching logic

### Q: Sliders not moving
**A**: Usually a UI issue
- Refresh browser (Ctrl+F5)
- Clear browser cache
- Check console for JavaScript errors

---

## 📋 Complete Endpoint Reference

### 1. GET /health
```bash
curl https://inlaks-t24-backend.vercel.app/health
```
**Response**: `{ "status": "ok" }`

### 2. POST /api/exam/create
```bash
curl -X POST https://inlaks-t24-backend.vercel.app/api/exam/create \
  -H "Content-Type: application/json" \
  -d '{"examCode":"TEMENOS_T24_001"}'
```

### 3. GET /api/exam/list
```bash
curl https://inlaks-t24-backend.vercel.app/api/exam/list
```

### 4. POST /api/exam/:code/upload
```bash
curl -X POST https://inlaks-t24-backend.vercel.app/api/exam/TEMENOS_T24_001/upload \
  -F "image=@path/to/image.jpg"
```

### 5. GET /api/exam/:code/questions
```bash
curl https://inlaks-t24-backend.vercel.app/api/exam/TEMENOS_T24_001/questions
```

### 6. POST /api/exam/compare ⭐
```bash
curl -X POST https://inlaks-t24-backend.vercel.app/api/exam/compare \
  -F "image=@path/to/image.jpg" \
  -F "textThreshold=0.65" \
  -F "imageThreshold=0.65"
```

### 7. GET /api/exam/stats
```bash
curl https://inlaks-t24-backend.vercel.app/api/exam/stats
```

---

## 📚 Documentation Files

All documentation is in your frontend folder:

- **VERIFICATION_CHECKLIST.md** - Full verification of all changes
- **FRONTEND_API_SYNC_COMPLETE.md** - Comprehensive guide
- **API_SPECIFICATION_ALIGNMENT.md** - Detailed endpoint mapping
- **API_CHANGES.md** - Quick reference
- **MIGRATION_SUMMARY.md** - Before/after comparison

---

## ✅ Checklist Before Deployment

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Backend has all `/api/` routes
- [ ] Backend supports both thresholds
- [ ] CORS enabled in backend
- [ ] Create exam works
- [ ] Upload question works
- [ ] Compare with thresholds works
- [ ] View questions works
- [ ] API test page passes all tests

---

## 🎯 Common Tasks

### Create an Exam
1. Go to "Exam Codes" tab
2. Type exam code (e.g., EXAM001)
3. Click "Create"

### Upload a Question
1. Go to "Upload Question" tab
2. Select exam from dropdown
3. Click to select image file
4. Click "Upload"

### Compare an Image (NEW DUAL THRESHOLD!)
1. Go to "Compare Image" tab
2. Select image to compare
3. Drag TEXT slider to desired value (0.65 default)
4. Drag IMAGE slider to desired value (0.65 default)
5. Click "Compare Image"
6. View matching results with confidence scores

### View All Questions
1. Go to "View Questions" tab
2. Select exam from dropdown
3. Click questions to expand details

### Test All Endpoints
1. Go to "API Test" tab
2. Click "Run Tests"
3. See results for health, list, and stats endpoints

---

## 🔄 If Anything Breaks

**Step 1**: Check the error message
- Look in browser console (F12)
- Check terminal output for backend errors

**Step 2**: Verify backend
```bash
# Test backend directly
curl https://inlaks-t24-backend.vercel.app/health
curl https://inlaks-t24-backend.vercel.app/api/exam/list
```

**Step 3**: Check routes
- Make sure backend has `/api/` prefix
- Make sure frontend is using correct ports

**Step 4**: Restart both servers
```bash
# Kill all terminals and restart
npm start  # Backend
npm run dev  # Frontend
```

---

## 🎉 You're All Set!

Your frontend is now **100% synchronized** with your API specification.

**Status**: ✅ Ready to use

Visit: **http://localhost:5173**

---

**Last Updated**: January 28, 2026  
**Version**: 1.0.0
