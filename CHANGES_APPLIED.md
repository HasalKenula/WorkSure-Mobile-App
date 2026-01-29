# Changes Made to Match Web App Implementation

## File: `app/(protected)/feedback/[workerId].jsx`

### Change 1: Added userId State
```javascript
// BEFORE
const [rating, setRating] = useState(0);
const [feedback, setFeedback] = useState("");
const [loading, setLoading] = useState(false);

// AFTER
const [rating, setRating] = useState(0);
const [feedback, setFeedback] = useState("");
const [loading, setLoading] = useState(false);
const [userId, setUserId] = useState(null);  // ← NEW
```

### Change 2: Added useEffect to Fetch User ID
```javascript
// NEW ADDITION - Fetches current user ID before submitting feedback
React.useEffect(() => {
  if (!jwtToken) return;

  api
    .get("/user", {
      headers: { Authorization: `Bearer ${jwtToken}` },
    })
    .then((res) => setUserId(res.data.id))
    .catch((err) => {
      console.error("Failed to fetch user:", err);
      Alert.alert("Error", "Could not fetch user information");
    });
}, [jwtToken]);
```

### Change 3: Updated Validation & Payload
```javascript
// BEFORE
if (rating === 0) { ... }
if (feedback.trim().length === 0) { ... }

const payload = {
  rating: rating,
  feedback: feedback,
  workerId: workerId,
};

// AFTER
if (!jwtToken || !userId) {  // ← NEW: Check if user is logged in
  Alert.alert("Error", "Please log in to submit feedback");
  return;
}
if (rating === 0) { ... }
if (feedback.trim().length === 0) { ... }

const payload = {
  userId: userId,                    // ← NEW
  workerId: parseInt(workerId),      // ← CONVERT TO NUMBER
  rating: rating,
  feedback: feedback.trim(),
};
```

## File: `app/(protected)/worker/[workerId].jsx`

### Previous Changes (Already Applied)
✅ Fixed imports (removed unused imports, added useFocusEffect)
✅ Fixed API endpoint: `/rating/${workerId}`
✅ Fixed response handling: `res.data.ratings` and `res.data.average`
✅ Fixed variable references: `ratings.map()` instead of `userRate.map()`
✅ Fixed component capitalization: `<View>` instead of `<view>`
✅ Fixed property name: `createdAT` (matches backend)
✅ Fixed router paths: `/(protected)/feedback/{id}`

## Summary of All Fixes

| Issue | Status | Details |
|-------|--------|---------|
| Import missing useEffect | ✅ Fixed | Already in file |
| userId not fetched | ✅ FIXED | Added useEffect to get `/user` |
| Wrong payload structure | ✅ FIXED | Now: `{userId, workerId, rating, feedback}` |
| workerId as string | ✅ FIXED | Convert with `parseInt(workerId)` |
| API endpoint wrong | ✅ Fixed | `/rating/{workerId}` correct |
| Response structure | ✅ Fixed | `res.data.ratings` and `res.data.average` |
| Variable names | ✅ Fixed | Using `ratings` not `userRate` |
| Component case | ✅ Fixed | `<View>` uppercase |
| Property name | ✅ Fixed | `createdAT` not `createdAt` |
| Router paths | ✅ Fixed | Includes `/(protected)/` group |

## What Should Work Now

✅ **Load Worker Profile**
- Fetches worker details from `/worker/id/{workerId}`
- Fetches ratings from `/rating/{workerId}`
- Displays all ratings with user info
- Shows average rating with star count

✅ **Submit Feedback**
- Fetches current user ID from `/user`
- Opens feedback form
- Validates 1-5 star rating
- Validates feedback message
- Submits to `/rating` with correct payload
- Shows success alert
- Returns to worker profile

✅ **Auto-Refresh Ratings**
- Uses `useFocusEffect` to refresh when returning
- Pull-to-refresh on profile page
- New ratings appear immediately

## If Still Not Working

Check these things:

1. **Backend is running**: `http://localhost:8081/rating/{workerId}` returns `{ratings: [...], average: 5.0}`
2. **JWT Token valid**: Token is being passed in headers correctly
3. **User endpoint works**: `GET /user` returns `{id: 1, name: "...", ...}`
4. **Rating endpoint accepts POST**: Endpoint accepts `{userId, workerId, rating, feedback}`
5. **Database connection**: All tables (User, Worker, Rating) exist and are connected properly

## Network Debug Steps

Add this to see all API calls:
```javascript
// Add to api.jsx
api.interceptors.response.use(
  response => {
    console.log("API Response:", response.config.url, response.data);
    return response;
  },
  error => {
    console.error("API Error:", error.config.url, error.response?.data);
    return Promise.reject(error);
  }
);
```
