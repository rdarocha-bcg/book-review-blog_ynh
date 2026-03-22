# Yunohost Integration Guide

## 🔗 Connecting to Yunohost Backend

### Step 1: Get Your Yunohost API URL

Your Yunohost instance provides REST API endpoints at:
```
https://your-yunohost-domain.com/api
```

### Step 2: Update Environment Configuration

#### Development (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // For local development with proxy
  // OR for direct Yunohost connection:
  // apiUrl: 'https://your-yunohost-domain.com/api',
};
```

#### Production (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-yunohost-domain.com/api',
};
```

---

## 🔐 API Authentication

### JWT Token Flow

1. **Login Request**
   ```typescript
   POST /api/auth/login
   Content-Type: application/json
   
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **Login Response**
   ```json
   {
     "token": "eyJhbGc...",
     "user": {
       "id": "123",
       "email": "user@example.com",
       "name": "User Name",
       "role": "user"
     }
   }
   ```

3. **Token Storage**
   - Stored in localStorage with key: `auth_token`
   - Automatically attached to all requests via AuthService

4. **Token Usage in Requests**
   ```
   Authorization: Bearer {token}
   ```

---

## 📚 Expected Yunohost API Endpoints

### Authentication Endpoints
```
POST   /api/auth/login        - User login
POST   /api/auth/register     - User registration
POST   /api/auth/refresh      - Refresh token
POST   /api/auth/logout       - User logout
```

### Review Endpoints
```
GET    /api/reviews           - List reviews (with pagination/filters)
GET    /api/reviews/:id       - Get single review
POST   /api/reviews           - Create review (auth required)
PUT    /api/reviews/:id       - Update review (auth required)
DELETE /api/reviews/:id       - Delete review (auth required)
```

### User Endpoints (Admin)
```
GET    /api/admin/users       - List users (admin only)
GET    /api/admin/users/:id   - Get user details
PUT    /api/admin/users/:id   - Update user
DELETE /api/admin/users/:id   - Delete user (admin only)
```

### Admin Endpoints
```
GET    /api/admin/reviews/pending     - Pending reviews for moderation
PATCH  /api/admin/reviews/:id/approve - Approve review (body: { isPublished })
DELETE /api/admin/reviews/:id         - Reject/delete review
GET    /api/admin/stats               - Dashboard stats (totalReviews, totalUsers, etc.)
```

---

## 📝 Request/Response Examples

### Login
**Request:**
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Get Reviews
**Request:**
```bash
curl -X GET "https://your-domain.com/api/reviews?genre=fiction&rating=4&page=1&limit=10" \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "data": [
    {
      "id": "review1",
      "title": "Amazing Book",
      "author": "Jane Doe",
      "bookTitle": "The Book",
      "bookAuthor": "Author Name",
      "rating": 4.5,
      "genre": "fiction",
      "description": "A great read...",
      "content": "Full review content...",
      "imageUrl": "https://...",
      "publishedAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-01-20T14:22:00Z",
      "createdBy": "user123",
      "isPublished": true
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### Create Review
**Request:**
```bash
curl -X POST https://your-domain.com/api/reviews \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Review",
    "bookTitle": "Book Title",
    "bookAuthor": "Author Name",
    "rating": 5,
    "genre": "fiction",
    "description": "Short description",
    "content": "Full review content...",
    "imageUrl": "https://...",
    "isPublished": true
  }'
```

---

## 🔒 CORS Configuration

### If CORS is Restricted

Yunohost might require CORS headers. The ErrorInterceptor handles CORS errors automatically.

**In your Yunohost backend, ensure CORS is enabled:**
```
Access-Control-Allow-Origin: https://your-app-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

### Development Proxy (Optional)

If you need to proxy API calls during development:

1. Create `proxy.conf.json` in project root
2. Add to `angular.json`:
```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

3. Create `proxy.conf.json`:
```json
{
  "/api": {
    "target": "https://your-yunohost-domain.com",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

---

## 🧪 Testing API Integration

### Using Postman or cURL

1. **Login and get token:**
```bash
TOKEN=$(curl -s -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')
```

2. **Use token in requests:**
```bash
curl -X GET https://your-domain.com/api/reviews \
  -H "Authorization: Bearer $TOKEN"
```

### In Angular Application

The API calls are already configured:

```typescript
// Already handled by ApiService + AuthService
constructor(private reviewService: ReviewService) {}

ngOnInit() {
  this.reviewService.getReviews()
    .subscribe(response => {
      console.log('Reviews:', response);
    });
}
```

---

## 🛠️ Deployment to Yunohost

### Build for Production
```bash
npm run build:prod
```

Output: `dist/book-review-blog/`

### Deploy Steps

1. **Build the application**
   ```bash
   npm run build:prod
   ```

2. **Upload to Yunohost**
   - Use Yunohost admin panel, or
   - Via SFTP to your app directory

3. **Configure Nginx**
   - Point to `dist/book-review-blog/index.html`
   - Set up SPA routing

4. **Test the deployment**
   - Visit your Yunohost app domain
   - Verify login/logout works
   - Test review operations

### Nginx Configuration Example
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 🐛 Troubleshooting

### 401 Unauthorized Error
- **Cause**: Token expired or missing
- **Solution**: Check login credentials, token refresh in AuthService

### 404 API Not Found
- **Cause**: Wrong API URL
- **Solution**: Verify `environment.ts` has correct Yunohost URL

### CORS Error
- **Cause**: Yunohost not configured for CORS
- **Solution**: Check CORS headers in Yunohost backend config

### Network Error
- **Cause**: Yunohost backend not running
- **Solution**: Verify Yunohost instance is accessible

### 500 Server Error
- **Cause**: Backend error
- **Solution**: Check Yunohost server logs

---

## 📊 API Response Handling

### Success Response
```typescript
// Automatically handled by services
this.reviewService.getReviews().subscribe(
  data => console.log('Success:', data),
  error => console.error('Error:', error)
);
```

### Error Response
```typescript
// ErrorInterceptor automatically handles:
// 401 → Redirect to login
// 403 → Show "Access Denied"
// 404 → Show "Not Found"
// 500 → Show "Server Error"
```

### Notification Handling
```typescript
// Services automatically show notifications
this.reviewService.createReview(data).subscribe(
  () => this.notificationService.success('Review created!'),
  error => this.notificationService.error('Failed to create review')
);
```

---

## 🔄 API Integration Checklist

- [ ] Update `environment.ts` with Yunohost API URL
- [ ] Test login endpoint
- [ ] Test reviews list endpoint
- [ ] Test create review endpoint
- [ ] Test update review endpoint
- [ ] Test delete review endpoint
- [ ] Verify JWT token handling
- [ ] Verify CORS configuration
- [ ] Test error scenarios (401, 404, 500)
- [ ] Deploy to staging environment
- [ ] Test on staging
- [ ] Deploy to production

---

## 📚 Additional Resources

### Yunohost Documentation
- [Yunohost Official Docs](https://yunohost.org)
- [REST API Documentation](https://yunohost.org/en/api)

### Angular HTTP Requests
- [Angular HttpClient](https://angular.io/guide/http)
- [RxJS Operators](https://rxjs.dev/api)

### Security
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 📞 Support

For Yunohost-specific questions:
- Check Yunohost logs: `/var/log/yunohost/`
- Review API response in browser DevTools

For application questions:
- Check `DEVELOPER_GUIDE.md`
- Review `ARCHITECTURE_DETAILS.md`

---

*Last Updated: January 30, 2026*
