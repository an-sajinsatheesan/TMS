# Authentication API Quick Reference

Quick reference guide for testing and integrating with the authentication APIs.

---

## Base Configuration

```javascript
const API_BASE_URL = 'http://localhost:5000/api/v1';

const headers = {
  'Content-Type': 'application/json',
};

// For authenticated requests
const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,
};
```

---

## 1. Registration Flow

### Step 1: Register with Email
```javascript
// Request
POST /auth/register

{
  "email": "user@example.com"
}

// Response - New User
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "userExists": false,
    "message": "OTP sent to your email",
    "email": "user@example.com"
  }
}

// Response - Existing User
{
  "success": true,
  "message": "User already exists. Please login.",
  "data": {
    "userExists": true,
    "isEmailVerified": true,
    "onboardingComplete": true
  }
}
```

### Step 2: Verify OTP
```javascript
// Request
POST /auth/verify-otp

{
  "email": "user@example.com",
  "code": "123456"
}

// Response
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": null,
      "avatarUrl": null,
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}

// Store tokens
localStorage.setItem('accessToken', response.data.tokens.accessToken);
localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
```

---

## 2. Login Flow

```javascript
// Request
POST /auth/login

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatarUrl": "https://...",
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    },
    "onboardingStatus": {
      "isComplete": true,
      "currentStep": 5
    }
  }
}
```

---

## 3. Google Login Flow

```javascript
// Step 1: Get Google token from Google OAuth flow
// Use @react-oauth/google or similar library

// Step 2: Send to backend
POST /auth/google

{
  "googleToken": "google_id_token_here"
}

// Response
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

---

## 4. Forgot Password Flow

### Step 1: Request Reset
```javascript
// Request
POST /auth/forgot-password

{
  "email": "user@example.com"
}

// Response
{
  "success": true,
  "message": "If this email is registered, you will receive a password reset link",
  "data": {
    "message": "If this email is registered, you will receive a password reset link"
  }
}
```

### Step 2: Reset Password
```javascript
// Request (token comes from email link)
POST /auth/reset-password

{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}

// Response
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "message": "Password reset successful"
  }
}
```

---

## 5. Get Current User

```javascript
// Request
GET /auth/me
Authorization: Bearer {accessToken}

// Response
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatarUrl": "https://...",
      "isEmailVerified": true
    }
  }
}
```

---

## 6. Invitation Flow

### Send Invitation
```javascript
// Request
POST /invitations/send-tenant
Authorization: Bearer {accessToken}

{
  "tenantId": "tenant-uuid",
  "emails": ["user1@example.com", "user2@example.com"],
  "role": "MEMBER"
}

// Response
{
  "success": true,
  "message": "2 invitation(s) sent successfully",
  "data": {
    "invitations": [
      {
        "id": "uuid",
        "email": "user1@example.com",
        "token": "invite_token",
        "status": "PENDING",
        "expiresAt": "2025-11-12T10:30:00Z"
      }
    ]
  }
}
```

### Get Invitation Details
```javascript
// Request
GET /invitations/:token

// Response
{
  "success": true,
  "message": "Invitation details retrieved",
  "data": {
    "invitation": {
      "id": "uuid",
      "email": "user@example.com",
      "type": "TENANT",
      "role": "MEMBER",
      "status": "PENDING",
      "tenant": {
        "name": "Acme Corp"
      },
      "inviter": {
        "fullName": "Jane Admin"
      }
    }
  }
}
```

### Accept Invitation
```javascript
// Request
POST /invitations/accept/:token
Authorization: Bearer {accessToken} // Optional

// Response
{
  "success": true,
  "message": "Successfully joined workspace",
  "data": {
    "type": "TENANT",
    "tenant": {
      "id": "uuid",
      "name": "Acme Corp",
      "slug": "acme-corp"
    },
    "role": "MEMBER"
  }
}
```

---

## React/Next.js Examples

### Axios Setup
```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Auth Service
```typescript
// lib/api/auth.service.ts
import apiClient from './client';

export const authService = {
  register: (email: string) =>
    apiClient.post('/auth/register', { email }),

  verifyOtp: (email: string, code: string) =>
    apiClient.post('/auth/verify-otp', { email, code }),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  googleLogin: (googleToken: string) =>
    apiClient.post('/auth/google', { googleToken }),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword }),

  getMe: () =>
    apiClient.get('/auth/me'),
};
```

### React Hook Example
```typescript
// hooks/useAuth.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/auth.service';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);
      const { user, tokens } = response.data.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(email);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, register, isLoading, error };
}
```

---

## Error Handling

### Standard Error Response
```javascript
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials/token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

### Error Handling Example
```typescript
try {
  const response = await authService.login(email, password);
  // Handle success
} catch (error: any) {
  if (error.response) {
    // Server responded with error
    const message = error.response.data.message;
    const errors = error.response.data.errors;

    if (error.response.status === 401) {
      // Invalid credentials
    } else if (error.response.status === 400) {
      // Validation errors
    }
  } else if (error.request) {
    // No response received
    console.error('Network error');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Send Invitation
```bash
curl -X POST http://localhost:5000/api/v1/invitations/send-tenant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "tenantId":"tenant-uuid",
    "emails":["user@example.com"],
    "role":"MEMBER"
  }'
```

---

## Testing with Postman

### Environment Variables
```
API_BASE_URL = http://localhost:5000/api/v1
ACCESS_TOKEN = (set after login)
```

### Collection Structure
```
Authentication
├── Register
├── Verify OTP
├── Login
├── Google Login
├── Forgot Password
├── Reset Password
├── Get Current User
└── Get Onboarding Status

Invitations
├── Send Tenant Invitation
├── Send Project Invitation
├── Get Invitation Details
├── Accept Invitation
└── Get Pending Invitations
```

---

## Frontend State Flow

```
1. User visits /register
   ↓
2. Enter email → POST /auth/register
   ↓
3. Redirect to /verify-otp?email=user@example.com
   ↓
4. Enter OTP → POST /auth/verify-otp
   ↓
5. Store tokens in localStorage
   ↓
6. Redirect to /onboarding
   ↓
7. Complete onboarding → set password
   ↓
8. Redirect to /dashboard

---

1. User visits /login
   ↓
2. Enter email/password → POST /auth/login
   ↓
3. Store tokens in localStorage
   ↓
4. Check onboardingStatus
   ↓
5. Redirect to /onboarding or /dashboard
```

---

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Store tokens securely (consider httpOnly cookies for refresh tokens)
- [ ] Implement CSRF protection
- [ ] Validate all inputs on client and server
- [ ] Implement rate limiting
- [ ] Use strong password requirements
- [ ] Implement token expiration and refresh
- [ ] Log security events
- [ ] Use secure headers (helmet.js)
- [ ] Implement Content Security Policy

---

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution**: Check if token is expired or invalid. Clear localStorage and login again.

### Issue: CORS Error
**Solution**: Ensure backend CORS is configured to accept requests from your frontend origin.

### Issue: Token not being sent
**Solution**: Check axios interceptor is properly configured and token exists in localStorage.

### Issue: OTP not received
**Solution**: Check email service configuration and spam folder.

### Issue: Password reset link expired
**Solution**: Reset links expire after 1 hour. Request a new link.

---

## Production Considerations

1. **Environment Variables**
   - Use different API URLs for dev/staging/production
   - Never commit sensitive keys to version control

2. **Token Storage**
   - Consider using httpOnly cookies for refresh tokens
   - Implement secure token rotation

3. **Error Logging**
   - Log errors to monitoring service (Sentry, LogRocket, etc.)
   - Don't expose sensitive info in error messages

4. **Performance**
   - Implement request caching where appropriate
   - Use loading skeletons for better UX

5. **Analytics**
   - Track authentication events
   - Monitor failed login attempts

---

## Support

For issues or questions:
- Check API documentation: AUTH_API_DOCUMENTATION.md
- Review UI prompts: FRONTEND_UI_PROMPTS.md
- Contact backend team for API issues
