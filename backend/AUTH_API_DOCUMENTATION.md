# Authentication API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [API Endpoints](#api-endpoints)
3. [Request/Response Examples](#requestresponse-examples)
4. [Error Handling](#error-handling)
5. [Authentication Headers](#authentication-headers)

---

## Authentication Flow

### Email Registration Flow
1. User submits email → `POST /auth/register`
2. System sends OTP to email
3. User enters OTP → `POST /auth/verify-otp`
4. User receives JWT tokens
5. User completes onboarding
6. User sets password during onboarding

### Login Flow
1. User enters email & password → `POST /auth/login`
2. System validates credentials
3. User receives JWT tokens

### Forgot Password Flow
1. User requests reset → `POST /auth/forgot-password`
2. System sends reset link to email
3. User clicks link and enters new password → `POST /auth/reset-password`

### Invitation Flow
1. Admin sends invitation → `POST /invitations/send-tenant`
2. User receives invitation email
3. User clicks invitation link → `GET /invitations/:token`
4. New user registers or existing user accepts → `POST /invitations/accept/:token`

---

## API Endpoints

### 1. Register (Send OTP)

**Endpoint:** `POST /auth/register`

**Access:** Public

**Description:** Register a new user by email. Sends a 6-digit OTP to the provided email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "userExists": false,
    "message": "OTP sent to your email",
    "email": "user@example.com"
  }
}
```

**Special Cases:**

**Case 1: Email verified, onboarding incomplete, no password**
```json
{
  "success": true,
  "message": "Welcome back! Continue setting up your account.",
  "data": {
    "userExists": true,
    "isEmailVerified": true,
    "onboardingComplete": false,
    "currentStep": 2,
    "canContinueOnboarding": true,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": null,
      "avatarUrl": null,
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here"
    }
  }
}
```

**Case 2: Email verified, onboarding incomplete, has password**
```json
{
  "success": true,
  "message": "This email is already registered. Please log in to continue your setup.",
  "data": {
    "userExists": true,
    "isEmailVerified": true,
    "onboardingComplete": false,
    "currentStep": 3
  }
}
```

**Case 3: User already exists and verified**
```json
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

**Validation Errors (400):**
```json
{
  "success": false,
  "message": "Please provide a valid email address",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

### 2. Verify OTP

**Endpoint:** `POST /auth/verify-otp`

**Access:** Public

**Description:** Verify the OTP code sent to user's email and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "fullName": null,
      "avatarUrl": null,
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses:**

Invalid OTP (400):
```json
{
  "success": false,
  "message": "Invalid or expired OTP code"
}
```

Validation Error (400):
```json
{
  "success": false,
  "message": "OTP code must be 6 digits",
  "errors": [
    {
      "field": "code",
      "message": "OTP code must be 6 digits"
    }
  ]
}
```

---

### 3. Login with Password

**Endpoint:** `POST /auth/login`

**Access:** Public

**Description:** Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatarUrl": "https://example.com/avatar.jpg",
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "onboardingStatus": {
      "isComplete": true,
      "currentStep": 5
    }
  }
}
```

**Error Responses:**

Invalid Credentials (401):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

Email Not Verified (401):
```json
{
  "success": false,
  "message": "Please verify your email first"
}
```

---

### 4. Google Login

**Endpoint:** `POST /auth/google`

**Access:** Public

**Description:** Login or register using Google OAuth.

**Request Body:**
```json
{
  "googleToken": "google_id_token_here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@gmail.com",
      "fullName": "John Doe",
      "avatarUrl": "https://lh3.googleusercontent.com/...",
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid Google token"
}
```

---

### 5. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Access:** Public

**Description:** Request a password reset link. The link will be sent to the user's email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If this email is registered, you will receive a password reset link",
  "data": {
    "message": "If this email is registered, you will receive a password reset link"
  }
}
```

Note: The same response is returned whether the email exists or not (security best practice).

---

### 6. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Access:** Public

**Description:** Reset password using the token received via email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "message": "Password reset successful"
  }
}
```

**Error Responses:**

Invalid/Expired Token (400):
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

Password Too Short (400):
```json
{
  "success": false,
  "message": "Password must be at least 6 characters",
  "errors": [
    {
      "field": "newPassword",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

---

### 7. Get Current User

**Endpoint:** `GET /auth/me`

**Access:** Private (Requires Authentication)

**Description:** Get the currently authenticated user's profile.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatarUrl": "https://example.com/avatar.jpg",
      "isEmailVerified": true
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Authentication token is required"
}
```

---

### 8. Get Onboarding Status

**Endpoint:** `GET /auth/onboarding-status`

**Access:** Private (Requires Authentication)

**Description:** Get the onboarding status for the current user.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Onboarding status retrieved",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatarUrl": null,
      "isEmailVerified": true
    },
    "onboardingStatus": {
      "isComplete": false,
      "currentStep": 3
    }
  }
}
```

---

## Invitation Endpoints

### 9. Send Tenant Invitation

**Endpoint:** `POST /invitations/send-tenant`

**Access:** Private (OWNER or ADMIN only)

**Description:** Invite users to join a tenant/workspace.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "tenantId": "tenant-uuid",
  "emails": ["user1@example.com", "user2@example.com"],
  "role": "MEMBER"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "2 invitation(s) sent successfully",
  "data": {
    "invitations": [
      {
        "id": "invitation-uuid-1",
        "email": "user1@example.com",
        "token": "invite_token_1",
        "status": "PENDING",
        "expiresAt": "2025-11-12T10:30:00Z"
      },
      {
        "id": "invitation-uuid-2",
        "email": "user2@example.com",
        "token": "invite_token_2",
        "status": "PENDING",
        "expiresAt": "2025-11-12T10:30:00Z"
      }
    ]
  }
}
```

**Error Responses:**

Forbidden (403):
```json
{
  "success": false,
  "message": "You do not have permission to invite members"
}
```

---

### 10. Get Invitation Details

**Endpoint:** `GET /invitations/:token`

**Access:** Public

**Description:** Get invitation details by token (for the invitation acceptance page).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invitation details retrieved",
  "data": {
    "invitation": {
      "id": "invitation-uuid",
      "email": "user@example.com",
      "type": "TENANT",
      "role": "MEMBER",
      "status": "PENDING",
      "expiresAt": "2025-11-12T10:30:00Z",
      "tenant": {
        "id": "tenant-uuid",
        "name": "Acme Corp",
        "slug": "acme-corp"
      },
      "inviter": {
        "fullName": "Jane Admin",
        "email": "jane@acme.com"
      }
    }
  }
}
```

**Error Responses:**

Not Found (404):
```json
{
  "success": false,
  "message": "Invitation not found or expired"
}
```

---

### 11. Accept Invitation

**Endpoint:** `POST /invitations/accept/:token`

**Access:** Public or Private

**Description:** Accept an invitation to join a tenant or project. If user is logged in, use their account. If not, they must register first.

**Headers (Optional):**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully joined workspace",
  "data": {
    "type": "TENANT",
    "tenant": {
      "id": "tenant-uuid",
      "name": "Acme Corp",
      "slug": "acme-corp"
    },
    "role": "MEMBER"
  }
}
```

**Error Responses:**

Expired (400):
```json
{
  "success": false,
  "message": "This invitation has expired"
}
```

Already Accepted (400):
```json
{
  "success": false,
  "message": "This invitation has already been accepted"
}
```

---

### 12. Get Pending Invitations

**Endpoint:** `GET /invitations/pending`

**Access:** Private

**Description:** Get all pending invitations for the current user's email.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pending invitations retrieved",
  "data": {
    "invitations": [
      {
        "id": "invitation-uuid",
        "type": "TENANT",
        "role": "MEMBER",
        "status": "PENDING",
        "expiresAt": "2025-11-12T10:30:00Z",
        "tenant": {
          "name": "Acme Corp"
        },
        "inviter": {
          "fullName": "Jane Admin"
        }
      }
    ]
  }
}
```

---

## Authentication Headers

For protected endpoints, include the JWT access token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors, invalid data)
- `401` - Unauthorized (invalid credentials, missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Token Management

### Access Token
- Expires in: 15 minutes (typical)
- Used for: API authentication
- Storage: Memory or secure HTTP-only cookie

### Refresh Token
- Expires in: 7 days (typical)
- Used for: Getting new access tokens
- Storage: Secure HTTP-only cookie

---

## Rate Limiting

The API implements rate limiting to prevent abuse. Default limits:
- Registration/Login: 5 requests per 15 minutes per IP
- OTP requests: 3 requests per 15 minutes per email
- Password reset: 3 requests per 15 minutes per IP

---

## Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Storage**: Store tokens securely (never in localStorage)
3. **CORS**: API only accepts requests from configured origins
4. **Input Validation**: All inputs are validated on the server
5. **Password Requirements**: Minimum 6 characters (consider enforcing stronger requirements)
6. **OTP Expiry**: OTP codes expire after 10 minutes
7. **Reset Token Expiry**: Password reset tokens expire after 1 hour

---

## Testing the APIs

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Environment Variables

Required environment variables for authentication:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret-here
REFRESH_TOKEN_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Client URL (for CORS and email links)
CLIENT_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

---

## Support

For issues or questions, please contact the development team or refer to the API documentation.
