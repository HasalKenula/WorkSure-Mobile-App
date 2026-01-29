# Debugging Guide - Rating & Feedback System

## Issues Fixed

### 1. **Missing userId in Feedback Submission** ❌ → ✅
**Problem**: Web app fetches userId before submitting, but mobile app didn't.

**Solution**: Added useEffect to fetch `/user` endpoint first
```javascript
React.useEffect(() => {
  if (!jwtToken) return;
  api.get("/user", {
    headers: { Authorization: `Bearer ${jwtToken}` },
  })
  .then((res) => setUserId(res.data.id))
  .catch((err) => console.error("Failed to fetch user:", err));
}, [jwtToken]);
```

### 2. **Wrong Payload Structure** ❌ → ✅
**Problem**: Sent `{rating, feedback, workerId}` but backend expects `{userId, workerId, rating, feedback}`

**Solution**: Changed payload to match web app:
```javascript
const payload = {
  userId: userId,           // ← NOW INCLUDED
  workerId: parseInt(workerId),  // ← CONVERT TO NUMBER
  rating: rating,
  feedback: feedback.trim(),
};
```

### 3. **API Endpoint Issues** ❌ → ✅
**Worker Profile Page**:
- ✅ Fetches: `GET /rating/{workerId}`
- ✅ Accesses: `res.data.ratings` and `res.data.average`

**Feedback Page**:
- ✅ Submits to: `POST /rating`
- ✅ With payload: `{userId, workerId, rating, feedback}`

## Testing Checklist

- [ ] Navigate to worker profile
- [ ] Verify ratings load from database
- [ ] Click "Add Feedback" button
- [ ] See feedback form with 5-star rating
- [ ] Type feedback message
- [ ] Click "Submit Feedback"
- [ ] Should see success alert
- [ ] Get redirected back to worker profile
- [ ] New rating should appear in list

## Network Request Flow

```
FLOW 1: Loading Worker Profile
├── GET /worker/id/{workerId}  → Worker details
└── GET /rating/{workerId}     → All ratings + average

FLOW 2: Submitting Feedback
├── GET /user                  → Current user ID (new!)
└── POST /rating               → Submit {userId, workerId, rating, feedback}

FLOW 3: Refresh After Feedback
└── GET /rating/{workerId}     → Updated ratings
```

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "userId is undefined" | useEffect didn't run | Ensure jwtToken is available |
| "workerId is undefined" | Route params not passed | Check router.push path |
| "403 Forbidden" | Missing Authorization header | Token must be in headers |
| "No ratings showing" | Response structure wrong | Check `/rating/{id}` returns `{ratings: [], average: 0}` |
