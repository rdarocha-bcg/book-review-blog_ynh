# API Endpoints - Book Review Blog

Expected backend API contract for the frontend. The backend (e.g. Yunohost app) should expose these endpoints.

**Base URL:** Configured in `src/environments/environment.ts` (dev) and `environment.prod.ts` (prod), e.g. `https://your-domain.com/api`.

**Authentication:** JWT sent in header: `Authorization: Bearer <token>` (handled by the auth interceptor).

---

## Authentication

| Method | Endpoint | Description | Request body |
|--------|----------|-------------|--------------|
| POST | `/auth/login` | Login | `{ "email": string, "password": string }` |
| POST | `/auth/register` | Register | `{ "email", "password", "name", ... }` |
| POST | `/auth/forgot-password` | Request password reset | `{ "email": string }` |
| POST | `/auth/reset-password` | Reset with token | `{ "token": string, "password": string }` |
| POST | `/auth/refresh` | Refresh JWT | `{}` (with valid cookie/token) |

**Login/Register response:** `{ "token": string, "user": { "id", "email", "name", ... } }`

---

## Reviews

| Method | Endpoint | Description | Query / body |
|--------|----------|-------------|--------------|
| GET | `/reviews` | List reviews (paginated, filtered) | Query: `page`, `limit`, `genre`, `rating`, `search`, `sort` (`newest`, `oldest`, `rating-high`, `rating-low`) |
| GET | `/reviews/:id` | Get one review | - |
| POST | `/reviews` | Create review | Body: `Review` (title, author, bookTitle, bookAuthor, rating, genre, description, content, imageUrl?, isPublished) |
| PUT | `/reviews/:id` | Update review | Body: same as create |
| DELETE | `/reviews/:id` | Delete review | - |

**List response:** `{ "data": Review[], "total": number, "page": number, "limit": number, "totalPages": number }`

**Review shape (example):**

```json
{
  "id": "string",
  "title": "string",
  "author": "string",
  "bookTitle": "string",
  "bookAuthor": "string",
  "rating": 1,
  "genre": "string",
  "description": "string",
  "content": "string",
  "imageUrl": "string | null",
  "publishedAt": "ISO date",
  "updatedAt": "ISO date",
  "createdBy": "string",
  "isPublished": true
}
```

---

## Errors

- **401 Unauthorized:** Frontend redirects to login (error interceptor).
- **403 Forbidden:** Access denied (e.g. admin-only).
- **404:** Resource not found.
- **500:** Server error; frontend shows a generic error message.

---

## CORS

Backend must allow the frontend origin (e.g. `https://your-domain.com` or `http://localhost:4200` in dev) for the API base path and methods used (GET, POST, PUT, DELETE, PATCH).
