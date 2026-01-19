# Backend Architecture & Security Overview

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│                   (localhost:5173)                           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS + Cookies
                         │ JWT Token (Authorization Header)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                         │
│                   (localhost:5001)                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │ Controllers  │  │  Middleware  │      │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤      │
│  │ /api/auth    │  │ authCtrl     │  │ verifyToken  │      │
│  │ /api/account │  │ accountCtrl  │  │ cors         │      │
│  │ /api/trans   │  │ transCtrl    │  │ passport     │      │
│  │ /api/cat     │  │ categoryCtrl │  │ session      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                 │              │
│         └──────────────────┼─────────────────┘              │
│                            ▼                                │
│                  ┌──────────────────┐                       │
│                  │  Models & Schema │                       │
│                  ├──────────────────┤                       │
│                  │ User (auth)      │                       │
│                  │ Account (userId) │                       │
│                  │ Transaction      │                       │
│                  │ Category         │                       │
│                  └──────────────────┘                       │
│                            │                                │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────────┐
                  │    MongoDB Atlas          │
                  │  (Cloud Database)         │
                  │                           │
                  │  - Users                  │
                  │  - Accounts (userId)      │
                  │  - Transactions (userId)  │
                  │  - Categories (userId)    │
                  └───────────────────────────┘
```

---

## 🔐 Security Layers

### Layer 1: Authentication
```javascript
// Frontend: Store token
localStorage.setItem("token", token)

// Backend: Verify token
router.use(verifyToken) // Check JWT before handler

// Token includes: { userId, email, expiresIn: "7d" }
```

### Layer 2: User Isolation
```javascript
// Every query filters by userId
const transactions = await Transaction.find({ userId, ...filters })
                       ↑
                    From JWT token
```

### Layer 3: CORS Protection
```javascript
// Only allowed origins can access
cors({ 
  origin: allowedOrigins, 
  credentials: true 
})
```

### Layer 4: Cookie Security
```javascript
res.cookie("token", token, {
  httpOnly: true,        // Prevent JavaScript access (XSS)
  secure: production,    // Only HTTPS in production
  sameSite: "lax",      // Prevent CSRF attacks
  maxAge: 7days         // Auto-expire
})
```

---

## 📊 Data Flow Examples

### Login Flow
```
1. User enters email + password
2. Frontend: POST /api/auth/login
3. Backend: 
   - Hash password matches? ✓
   - Generate JWT token
   - Set secure cookie
4. Return token + user data
5. Frontend: Store in localStorage + axios header
6. All future requests include token
```

### Create Transaction Flow
```
1. Frontend: POST /api/transaction/new + token
   {
     "amount": 100,
     "type": "expense",
     ...
   }

2. Backend: 
   ├─ Verify token → Extract userId ✓
   ├─ Check account belongs to userId ✓
   ├─ Check category belongs to userId ✓
   ├─ Deduct from account balance
   └─ Save transaction with userId
   
3. Response: Transaction created
   {
     "userId": "abc123",  ← Auto-added
     "amount": 100,
     ...
   }
```

### Transfer Flow (Multi-step)
```
1. Frontend: POST /api/transaction/transfer
   {
     "fromAccount": "id1",
     "toAccount": "id2",
     "amount": 100
   }

2. Backend (Atomic Transaction):
   ├─ Start MongoDB session
   ├─ Verify userId owns both accounts
   ├─ Check sufficient balance
   ├─ Deduct from Account 1
   ├─ Add to Account 2
   ├─ Create Transaction 1 (expense)
   ├─ Create Transaction 2 (income)
   ├─ Both transactions include userId
   ├─ Commit transaction
   └─ If error: Abort & rollback

3. Response: Success or error
```

---

## 🗄️ Database Schema

### Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  googleId: String,
  timestamps
}
```

### Accounts
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),  ← User isolation
  name: String,
  balance: Number,
  timestamps
}
```

### Transactions
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),  ← User isolation
  amount: Number,
  type: "income" | "expense",
  description: String,
  account: ObjectId (ref: Account),
  category: ObjectId (ref: Category),
  date: Date,
  timestamps
}
```

### Categories
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),  ← User isolation
  name: String,
  type: "income" | "expense",
  parentCategory: String,
  budget: String,
  timestamps
}
```

---

## 🚨 Protection Against Common Attacks

### XSS (Cross-Site Scripting)
```
✅ HttpOnly cookies → JavaScript cannot access tokens
✅ Input validation → Sanitize user inputs
✅ Response headers → Content-Security-Policy
```

### CSRF (Cross-Site Request Forgery)
```
✅ SameSite=Lax → Cookies only sent to same site
✅ JWT tokens → Custom Authorization header
✅ CORS validation → Verify origin header
```

### SQL/NoSQL Injection
```
✅ Mongoose schema validation
✅ Input type checking
✅ Parameterized queries (Mongoose handles)
```

### Broken Authentication
```
✅ JWT validation on all protected routes
✅ Token expiration (7 days)
✅ Password hashing with bcryptjs
✅ Secure cookie flags
```

### Unauthorized Data Access
```
✅ Every query filters by userId
✅ No hardcoded IDs or admin bypasses
✅ Ownership verification before operations
```

---

## 🔧 Middleware Stack (Order Matters)

```javascript
1. Express JSON/URL parsers
   └─ Parse incoming requests

2. Cookie Parser
   └─ Extract cookies

3. Express Session
   └─ Manage sessions (for Passport)

4. Passport Init + Session
   └─ Initialize passport strategies

5. CORS Middleware
   └─ Validate origin & credentials

6. Route-specific verifyToken
   └─ JWT validation for protected routes

7. Route handlers
   └─ Business logic
```

---

## 📝 Environment Variables

### Required for Production
```
BACKEND_URL=https://api.domain.com
FRONTEND_URL=https://domain.com
MONGO_URI=mongodb+srv://user:pass@cluster
JWT_SECRET=very_long_random_string
SESSION_SECRET=another_long_random_string
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NODE_ENV=production
PORT=5001
```

### Optional
```
MAX_REQUEST_SIZE=10mb
CACHE_TTL=60000
LOG_LEVEL=info
```

---

## 🧪 Testing Checklist

- [ ] User A can't see User B's accounts
- [ ] Transfer creates 2 transactions with userId
- [ ] Expired token is rejected
- [ ] Invalid token is rejected
- [ ] CORS rejects unknown origins
- [ ] Password is hashed, not stored plaintext
- [ ] Logout clears token
- [ ] Login generates new token
- [ ] Google OAuth works and creates user
- [ ] Admin can't access other user's data

---

## 🚀 Deployment Checklist

- [ ] All env variables set
- [ ] Database backups configured
- [ ] HTTPS/SSL enabled
- [ ] Monitoring/logging setup
- [ ] Rate limiting implemented
- [ ] CORS production origins set
- [ ] Security headers configured
- [ ] Database indexes created
- [ ] Error handling tested
- [ ] Performance tested

---

## 📈 Performance Tips

### Database Optimization
```javascript
// Add indexes for frequently queried fields
db.accounts.createIndex({ userId: 1, name: 1 })
db.transactions.createIndex({ userId: 1, date: -1 })
db.categories.createIndex({ userId: 1, type: 1 })
```

### Caching Strategy
```javascript
// Current: In-memory cache with 60s TTL
// Improvement: Consider Redis for distributed caching

// Critical queries to cache:
- getAllAccounts
- getAllCategories
- getUserTransactions (with date range)
```

### API Response Optimization
```javascript
// Use pagination for large datasets
router.get("/transactions?page=1&limit=50")

// Implement field selection
router.get("/transactions?fields=amount,date")

// Compression
app.use(compression())
```

---

## 🔍 Monitoring & Logging

### Recommended Logs
```javascript
- Authentication events (login/logout/failures)
- Unauthorized access attempts
- Database errors
- API errors
- Performance metrics
- User actions (create/update/delete)
```

### Tools Recommended
- Winston (logging library)
- Sentry (error tracking)
- New Relic (monitoring)
- DataDog (full observability)

---

**Version:** 1.0  
**Last Updated:** January 19, 2026  
**Status:** Production Ready ✅
