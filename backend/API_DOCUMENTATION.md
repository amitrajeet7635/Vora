# 📚 Vora API Documentation

Complete API reference for the Vora authentication platform.

---

## Base URL

\`\`\`
Development: http://localhost:5001/api
Production: https://api.vora.app/api
\`\`\`

---

## Authentication

All protected endpoints require a valid JWT token sent via httpOnly cookie (\`vora_token\`).

The token is automatically set after successful OAuth login.

---

## Response Format

### Success Response
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "statusCode": 400,
  "correlationId": "uuid-for-tracking"
}
\`\`\`

---

## Endpoints

### Authentication Endpoints

#### 1. Initiate Google Login
**GET** \`/auth/google\`

Redirects to Google OAuth consent screen.

**Query Parameters:**
- \`link\` (optional): Set to \`true\` for account linking
- \`userId\` (optional): User ID when linking accounts

**Response:** 302 Redirect to Google

**Example:**
\`\`\`bash
curl http://localhost:5001/api/auth/google
\`\`\`

---

#### 2. Initiate Facebook Login
**GET** \`/auth/facebook\`

Redirects to Facebook OAuth consent screen.

**Query Parameters:**
- \`link\` (optional): Set to \`true\` for account linking
- \`userId\` (optional): User ID when linking accounts

**Response:** 302 Redirect to Facebook

**Example:**
\`\`\`bash
curl http://localhost:5001/api/auth/facebook
\`\`\`

---

#### 3. OAuth Callback (Google)
**GET** \`/auth/callback/google\`

Handles Google OAuth callback. Called automatically by Google after user consent.

**Query Parameters:**
- \`code\`: Authorization code from Google
- \`state\`: CSRF protection state parameter

**Response:** 302 Redirect to frontend with JWT cookie set

**Success:** Redirects to \`/dashboard\`  
**Failure:** Redirects to \`/login?error=...\`

---

#### 4. OAuth Callback (Facebook)
**GET** \`/auth/callback/facebook\`

Handles Facebook OAuth callback.

**Query Parameters:**
- \`code\`: Authorization code from Facebook
- \`state\`: CSRF protection state parameter

**Response:** 302 Redirect to frontend with JWT cookie set

---

#### 5. Logout
**POST** \`/auth/logout\`

Logs out the current user and invalidates the session.

**Authentication:** Required

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

**Example:**
\`\`\`bash
curl -X POST http://localhost:5001/api/auth/logout \\
  --cookie "vora_token=YOUR_JWT_TOKEN"
\`\`\`

---

#### 6. Unlink Provider
**POST** \`/auth/unlink/:provider\`

Unlinks an OAuth provider from the user's account.

**Authentication:** Required

**URL Parameters:**
- \`provider\`: Provider to unlink (\`google\` or \`facebook\`)

**Response:**
\`\`\`json
{
  "success": true,
  "message": "google account unlinked successfully",
  "user": { ... }
}
\`\`\`

**Error (last provider):**
\`\`\`json
{
  "success": false,
  "error": "Cannot unlink the only authentication provider"
}
\`\`\`

**Example:**
\`\`\`bash
curl -X POST http://localhost:5001/api/auth/unlink/google \\
  --cookie "vora_token=YOUR_JWT_TOKEN"
\`\`\`

---

### User Endpoints

#### 1. Get Current User
**GET** \`/user/me\`

Returns the authenticated user's profile.

**Authentication:** Required

**Response:**
\`\`\`json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "roles": ["user"],
    "providers": [
      {
        "name": "google",
        "linkedAt": "2024-11-03T..."
      }
    ],
    "lastLoginAt": "2024-11-03T...",
    "createdAt": "2024-11-03T..."
  }
}
\`\`\`

**Example:**
\`\`\`bash
curl http://localhost:5001/api/user/me \\
  --cookie "vora_token=YOUR_JWT_TOKEN"
\`\`\`

---

#### 2. Update User Profile
**PATCH** \`/user/me\`

Updates the user's profile information.

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "name": "Updated Name",
  "avatar": "https://example.com/new-avatar.jpg"
}
\`\`\`

**Validation:**
- \`name\`: 2-100 characters
- \`avatar\`: Valid URL

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
\`\`\`

**Example:**
\`\`\`bash
curl -X PATCH http://localhost:5001/api/user/me \\
  --cookie "vora_token=YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "New Name"}'
\`\`\`

---

#### 3. Get User Sessions
**GET** \`/user/sessions\`

Returns all active sessions for the current user.

**Authentication:** Required

**Response:**
\`\`\`json
{
  "success": true,
  "sessions": [
    {
      "sessionId": "abc123...",
      "createdAt": "2024-11-03T...",
      "expiresAt": "2024-11-03T...",
      "userAgent": "Mozilla/5.0...",
      "ip": "192.168.1.1",
      "isCurrent": true
    }
  ]
}
\`\`\`

**Example:**
\`\`\`bash
curl http://localhost:5001/api/user/sessions \\
  --cookie "vora_token=YOUR_JWT_TOKEN"
\`\`\`

---

#### 4. Revoke Specific Session
**DELETE** \`/user/sessions/:sessionId\`

Revokes a specific session.

**Authentication:** Required

**URL Parameters:**
- \`sessionId\`: ID of the session to revoke

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Session revoked successfully"
}
\`\`\`

**Example:**
\`\`\`bash
curl -X DELETE http://localhost:5001/api/user/sessions/abc123 \\
  --cookie "vora_token=YOUR_JWT_TOKEN"
\`\`\`

---

#### 5. Revoke All Sessions
**POST** \`/user/sessions/revoke-all\`

Revokes all sessions except the current one.

**Authentication:** Required

**Response:**
\`\`\`json
{
  "success": true,
  "message": "All other sessions revoked successfully"
}
\`\`\`

**Example:**
\`\`\`bash
curl -X POST http://localhost:5001/api/user/sessions/revoke-all \\
  --cookie "vora_token=YOUR_JWT_TOKEN"
\`\`\`

---

#### 6. Delete Account
**DELETE** \`/user/me\`

Permanently deletes the user account and all associated data.

**Authentication:** Required

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Account deleted successfully"
}
\`\`\`

**Example:**
\`\`\`bash
curl -X DELETE http://localhost:5001/api/user/me \\
  --cookie "vora_token=YOUR_JWT_TOKEN"
\`\`\`

---

## Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Rate Limits

- **General API:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 5 attempts per 15 minutes per IP
- **Sensitive operations:** 3 attempts per hour per IP

Rate limit headers:
- \`RateLimit-Limit\`: Maximum requests allowed
- \`RateLimit-Remaining\`: Requests remaining
- \`RateLimit-Reset\`: Time when limit resets

---

## Security Headers

All responses include security headers:
- \`X-Correlation-ID\`: Request tracking ID
- \`Strict-Transport-Security\`: HTTPS enforcement (production)
- \`X-Content-Type-Options\`: nosniff
- \`X-Frame-Options\`: DENY

---

## OAuth Flow

### Login Flow (PKCE)

1. **Initiate Login**
   \`\`\`
   GET /api/auth/google
   \`\`\`
   - Generates PKCE code verifier and challenge
   - Stores state in server session
   - Redirects to Google

2. **User Consents**
   - User logs into Google
   - Approves permissions
   - Google redirects to callback URL

3. **Callback Processing**
   \`\`\`
   GET /api/auth/callback/google?code=...&state=...
   \`\`\`
   - Validates state parameter
   - Exchanges code for access token (with PKCE verifier)
   - Fetches user profile
   - Creates or updates user in database
   - Generates JWT token
   - Sets httpOnly cookie
   - Redirects to frontend

4. **Frontend Receives User**
   - JWT cookie is set automatically
   - Frontend can call \`/api/user/me\` to get user data

---

## Account Linking

To link additional providers to an existing account:

1. User must be logged in
2. Call \`/api/auth/google?link=true&userId=USER_ID\`
3. Complete OAuth flow
4. Provider is added to user's \`providers\` array

---

## Cookies

### Access Token Cookie
- **Name:** \`vora_token\`
- **HttpOnly:** true
- **Secure:** true (production)
- **SameSite:** Strict (production) / Lax (development)
- **Max-Age:** 15 minutes

### Refresh Token Cookie
- **Name:** \`vora_refresh_token\`
- **HttpOnly:** true
- **Secure:** true (production)
- **SameSite:** Strict (production) / Lax (development)
- **Max-Age:** 7 days

---

## Logging

All API requests are logged with:
- Timestamp
- Method and URL
- Status code
- Response time
- IP address
- User agent
- Correlation ID

Authentication events are specially logged:
- \`LOGIN_SUCCESS\`
- \`LOGIN_FAILURE\`
- \`LOGOUT\`
- \`LINK_ACCOUNT\`
- \`UNLINK_ACCOUNT\`

---

## Testing

### cURL Examples

**Health Check:**
\`\`\`bash
curl http://localhost:5001/health
\`\`\`

**Get Current User:**
\`\`\`bash
curl http://localhost:5001/api/user/me \\
  --cookie "vora_token=YOUR_TOKEN" \\
  -H "Content-Type: application/json"
\`\`\`

**Update Profile:**
\`\`\`bash
curl -X PATCH http://localhost:5001/api/user/me \\
  --cookie "vora_token=YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"New Name"}'
\`\`\`

---

## Postman Collection

Import \`Vora-API.postman_collection.json\` for a complete collection of API requests.

---

## Support

For issues or questions:
- Check logs in \`logs/combined.log\`
- Review correlation ID from error response
- Open an issue on GitHub
