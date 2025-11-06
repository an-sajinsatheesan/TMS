# Frontend UI Development Prompts for Authentication Flow

This document provides detailed prompts for implementing the authentication UI using **shadcn/ui** components, **React**, and **TypeScript**.

---

## Table of Contents
1. [Project Setup](#project-setup)
2. [API Integration Setup](#api-integration-setup)
3. [Registration Flow](#registration-flow)
4. [Login Flow](#login-flow)
5. [Forgot Password Flow](#forgot-password-flow)
6. [Invitation Flow](#invitation-flow)
7. [Protected Routes](#protected-routes)
8. [State Management](#state-management)

---

## Project Setup

### Prerequisites
```bash
# Create React app with TypeScript
npx create-next-app@latest frontend --typescript --tailwind --eslint
cd frontend

# Install shadcn/ui
npx shadcn-ui@latest init

# Install required shadcn components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add badge

# Install additional dependencies
npm install axios react-hook-form zod @hookform/resolvers
npm install zustand # for state management
npm install react-router-dom # if using React Router
```

---

## API Integration Setup

### Prompt 1: Create API Client and Axios Interceptors

```
Create an API client utility for making HTTP requests to the backend authentication API.

Requirements:
1. Base URL: http://localhost:5000/api/v1
2. Axios instance with interceptors
3. Automatic token attachment to requests
4. Token refresh logic
5. Error handling
6. TypeScript types for all API requests/responses

File: src/lib/api/client.ts
```

**Expected Code Structure:**

```typescript
// src/lib/api/client.ts
import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 errors
    if (error.response?.status === 401 && originalRequest) {
      // Token refresh logic here
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### Prompt 2: Create TypeScript Types for Auth

```
Create TypeScript interfaces and types for all authentication-related data structures.

Requirements:
1. User type
2. Auth tokens
3. API response wrappers
4. Request/response types for each endpoint
5. Onboarding status types

File: src/types/auth.types.ts
```

**Expected Code Structure:**

```typescript
// src/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface OnboardingStatus {
  isComplete: boolean;
  currentStep: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Register Response Types
export interface RegisterResponse {
  userExists: boolean;
  isEmailVerified?: boolean;
  onboardingComplete?: boolean;
  currentStep?: number;
  canContinueOnboarding?: boolean;
  user?: User;
  tokens?: AuthTokens;
  message: string;
  email?: string;
}

// Login Response
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  onboardingStatus?: OnboardingStatus;
}

// Invitation Types
export interface Invitation {
  id: string;
  email: string;
  type: 'TENANT' | 'PROJECT';
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  expiresAt: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
  project?: {
    id: string;
    name: string;
  };
  inviter: {
    fullName: string;
    email: string;
  };
}
```

### Prompt 3: Create Auth Service

```
Create an authentication service that handles all API calls for authentication.

Requirements:
1. Register with email
2. Verify OTP
3. Login with password
4. Google login
5. Forgot password
6. Reset password
7. Get current user
8. Token management helpers

File: src/lib/api/auth.service.ts
```

**Expected Code Structure:**

```typescript
// src/lib/api/auth.service.ts
import apiClient from './client';
import type {
  ApiResponse,
  RegisterResponse,
  LoginResponse,
  User,
  AuthTokens,
  OnboardingStatus,
} from '@/types/auth.types';

export const authService = {
  // Register with email
  register: async (email: string): Promise<ApiResponse<RegisterResponse>> => {
    const response = await apiClient.post('/auth/register', { email });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (
    email: string,
    code: string
  ): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    const response = await apiClient.post('/auth/verify-otp', { email, code });
    return response.data;
  },

  // Login with password
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  // Google login
  googleLogin: async (
    googleToken: string
  ): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post('/auth/google', { googleToken });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (
    email: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Get onboarding status
  getOnboardingStatus: async (): Promise<
    ApiResponse<{ user: User; onboardingStatus: OnboardingStatus }>
  > => {
    const response = await apiClient.get('/auth/onboarding-status');
    return response.data;
  },

  // Token helpers
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },
};
```

---

## Registration Flow

### Prompt 4: Create Registration Page (Step 1 - Email Entry)

```
Create a registration page where users enter their email address to receive an OTP.

Requirements:
1. Use shadcn Card, Input, Button, Label components
2. Form validation using react-hook-form and zod
3. Handle all registration response cases (new user, existing user, etc.)
4. Loading states
5. Error handling with toast notifications
6. Redirect logic based on user status

File: src/app/(auth)/register/page.tsx
```

**Expected Implementation:**

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/api/auth.service';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(data.email);
      const result = response.data;

      // Case 1: New user - OTP sent
      if (!result.userExists) {
        toast({
          title: 'Success',
          description: 'OTP has been sent to your email',
        });
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      }
      // Case 2: Existing verified user with incomplete onboarding, no password
      else if (result.canContinueOnboarding && result.tokens) {
        authService.setTokens(
          result.tokens.accessToken,
          result.tokens.refreshToken
        );
        toast({
          title: 'Welcome back!',
          description: result.message,
        });
        router.push('/onboarding');
      }
      // Case 3: Existing user with password - redirect to login
      else if (result.isEmailVerified && !result.onboardingComplete) {
        toast({
          title: 'Account exists',
          description: result.message,
          variant: 'default',
        });
        router.push(`/login?email=${encodeURIComponent(data.email)}`);
      }
      // Case 4: Fully registered user
      else if (result.userExists && result.onboardingComplete) {
        setError(result.message);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to register. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your email to receive a verification code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue with Email
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                // Implement Google OAuth
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="underline underline-offset-4 hover:text-primary">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Prompt 5: Create OTP Verification Page

```
Create an OTP verification page where users enter the 6-digit code sent to their email.

Requirements:
1. 6 separate input fields for OTP digits
2. Auto-focus and auto-submit functionality
3. Resend OTP option with cooldown timer
4. Paste support (entire OTP at once)
5. Error handling
6. Loading states
7. Store tokens on successful verification

File: src/app/(auth)/verify-otp/page.tsx
```

**Expected Implementation:**

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/api/auth.service';
import { Loader2 } from 'lucide-react';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields filled
    if (index === 5 && value) {
      const otpCode = newOtp.join('');
      if (otpCode.length === 6) {
        handleVerify(otpCode);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.verifyOtp(email, otpCode);
      const { user, tokens } = response.data;

      // Store tokens
      authService.setTokens(tokens.accessToken, tokens.refreshToken);

      toast({
        title: 'Success',
        description: 'Email verified successfully',
      });

      // Redirect to onboarding
      router.push('/onboarding');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Invalid or expired OTP code';
      setError(errorMessage);
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await authService.register(email);
      toast({
        title: 'OTP Resent',
        description: 'A new OTP has been sent to your email',
      });
      setResendCooldown(60);
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to resend OTP',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="h-12 w-12 rounded-md border border-input bg-background text-center text-lg font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              ))}
            </div>

            <Button
              onClick={() => handleVerify()}
              className="w-full"
              disabled={isLoading || otp.join('').length !== 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Email
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-sm"
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Didn't receive code? Resend"}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              <a
                href="/register"
                className="underline underline-offset-4 hover:text-primary"
              >
                Change email address
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Login Flow

### Prompt 6: Create Login Page

```
Create a login page where users can sign in with email and password.

Requirements:
1. Email and password fields with validation
2. "Remember me" checkbox option
3. Google OAuth button
4. Link to forgot password
5. Link to registration
6. Form validation using react-hook-form and zod
7. Error handling
8. Loading states
9. Redirect to dashboard after successful login

File: src/app/(auth)/login/page.tsx
```

**Expected Implementation:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/api/auth.service';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const emailFromUrl = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromUrl,
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (emailFromUrl) {
      setValue('email', emailFromUrl);
    }
  }, [emailFromUrl, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(data.email, data.password);
      const { user, tokens, onboardingStatus } = response.data;

      // Store tokens
      authService.setTokens(tokens.accessToken, tokens.refreshToken);

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.email}`,
      });

      // Redirect based on onboarding status
      if (onboardingStatus && !onboardingStatus.isComplete) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Invalid email or password';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" {...register('rememberMe')} />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                // Implement Google OAuth
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                {/* Google Icon SVG */}
              </svg>
              Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a
                href="/register"
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign up
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Forgot Password Flow

### Prompt 7: Create Forgot Password Page

```
Create a forgot password page where users can request a password reset link.

Requirements:
1. Email input field
2. Form validation
3. Success message after submission
4. Link back to login
5. Loading states
6. Error handling

File: src/app/(auth)/forgot-password/page.tsx
```

### Prompt 8: Create Reset Password Page

```
Create a reset password page where users can set a new password using the token from their email.

Requirements:
1. Extract token from URL query parameters
2. New password and confirm password fields
3. Password strength indicator
4. Show/hide password toggle
5. Form validation (passwords must match)
6. Success redirect to login page
7. Error handling for invalid/expired tokens

File: src/app/(auth)/reset-password/page.tsx
```

---

## Invitation Flow

### Prompt 9: Create Invitation Accept Page

```
Create an invitation acceptance page that displays invitation details and allows users to accept.

Requirements:
1. Fetch invitation details using token from URL
2. Display tenant/project name and inviter information
3. Show invitation status (pending, expired)
4. Accept button
5. If user not logged in, show registration/login options
6. Handle expired invitations
7. Redirect after successful acceptance

File: src/app/(auth)/invitation/[token]/page.tsx
```

**Expected Implementation:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/api/auth.service';
import { invitationService } from '@/lib/api/invitation.service';
import { Loader2, Building2, User } from 'lucide-react';
import type { Invitation } from '@/types/auth.types';

export default function InvitationPage() {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const token = params.token as string;
  const isLoggedIn = !!authService.getAccessToken();

  useEffect(() => {
    fetchInvitationDetails();
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      const response = await invitationService.getInvitationDetails(token);
      setInvitation(response.data.invitation);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Invitation not found or expired';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isLoggedIn) {
      // Redirect to register/login with invitation token
      router.push(`/register?invitation=${token}`);
      return;
    }

    setIsAccepting(true);

    try {
      const response = await invitationService.acceptInvitation(token);
      toast({
        title: 'Success',
        description: response.message,
      });

      // Redirect to tenant/project
      if (response.data.type === 'TENANT') {
        router.push(`/workspace/${response.data.tenant.slug}`);
      } else {
        router.push(`/projects/${response.data.project.id}`);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to accept invitation';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push('/login')}
              className="mt-4 w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isPending = invitation.status === 'PENDING';

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              You're Invited!
            </CardTitle>
            <Badge
              variant={
                isExpired
                  ? 'destructive'
                  : isPending
                  ? 'default'
                  : 'secondary'
              }
            >
              {invitation.status}
            </Badge>
          </div>
          <CardDescription>
            {invitation.inviter.fullName || invitation.inviter.email} has invited
            you to join
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {invitation.type === 'TENANT'
                    ? 'Workspace'
                    : 'Project'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invitation.tenant?.name || invitation.project?.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Role</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {invitation.role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {isExpired ? (
            <Alert variant="destructive">
              <AlertDescription>
                This invitation has expired. Please contact the workspace owner
                for a new invitation.
              </AlertDescription>
            </Alert>
          ) : isPending ? (
            <>
              {isLoggedIn ? (
                <Button
                  onClick={handleAccept}
                  className="w-full"
                  disabled={isAccepting}
                >
                  {isAccepting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Accept Invitation
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-center text-muted-foreground">
                    Sign in or create an account to accept this invitation
                  </p>
                  <Button onClick={handleAccept} className="w-full">
                    Continue
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Alert>
              <AlertDescription>
                This invitation has already been accepted.
              </AlertDescription>
            </Alert>
          )}

          {isLoggedIn && (
            <p className="text-center text-sm text-muted-foreground">
              Signed in as {invitation.email}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Protected Routes

### Prompt 10: Create Auth Context and Protected Route Component

```
Create an authentication context and a protected route component for handling authentication state.

Requirements:
1. Auth context with user state
2. Login/logout functions
3. Token management
4. Protected route wrapper component
5. Automatic token refresh
6. Redirect to login if not authenticated

Files:
- src/contexts/auth.context.tsx
- src/components/auth/protected-route.tsx
```

---

## State Management

### Prompt 11: Create Zustand Auth Store

```
Create a Zustand store for managing authentication state globally.

Requirements:
1. User state
2. Loading states
3. Login/logout actions
4. Token management
5. Persist authentication across page refreshes
6. Get current user on app initialization

File: src/stores/auth.store.ts
```

**Expected Implementation:**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/lib/api/auth.service';
import type { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(email, password);
          const { user, tokens } = response.data;
          authService.setTokens(tokens.accessToken, tokens.refreshToken);
          set({ user, isAuthenticated: true });
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        authService.clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      fetchCurrentUser: async () => {
        const token = authService.getAccessToken();
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authService.getMe();
          set({ user: response.data.user, isAuthenticated: true });
        } catch (error) {
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

---

## Additional Components

### Prompt 12: Create Reusable Form Components

```
Create reusable form components for consistent styling across auth forms.

Components needed:
1. PasswordInput with show/hide toggle
2. EmailInput with validation styling
3. FormError component
4. FormSuccess component
5. LoadingButton component

Directory: src/components/auth/
```

### Prompt 13: Create Google OAuth Integration

```
Implement Google OAuth login functionality.

Requirements:
1. Google OAuth button component
2. Handle Google login callback
3. Send Google token to backend
4. Store tokens on successful authentication
5. Error handling

File: src/components/auth/google-oauth-button.tsx
```

---

## Testing Checklist

Use this checklist to verify all authentication flows:

- [ ] Registration with email sends OTP
- [ ] OTP verification works and redirects to onboarding
- [ ] Existing user receives appropriate message
- [ ] Login with email/password works
- [ ] Invalid credentials show error
- [ ] Forgot password sends reset email
- [ ] Reset password with valid token works
- [ ] Reset password with invalid token shows error
- [ ] Google OAuth login works
- [ ] Invitation link displays correct details
- [ ] Accepting invitation adds user to workspace
- [ ] Protected routes redirect to login when not authenticated
- [ ] Tokens are stored securely
- [ ] User stays logged in after page refresh
- [ ] Logout clears tokens and redirects to login

---

## Environment Variables

Add these to your frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## Best Practices

1. **Security**: Never store sensitive data in localStorage (use httpOnly cookies for refresh tokens in production)
2. **UX**: Show loading states during async operations
3. **Error Handling**: Display user-friendly error messages
4. **Validation**: Validate on both client and server
5. **Accessibility**: Use proper ARIA labels and keyboard navigation
6. **Responsive Design**: Test on mobile devices
7. **Token Management**: Implement automatic token refresh
8. **Rate Limiting**: Handle rate limit errors gracefully

---

## Next Steps

1. Implement onboarding flow after email verification
2. Add password strength requirements
3. Implement 2FA (Two-Factor Authentication)
4. Add social login providers (GitHub, Microsoft, etc.)
5. Implement session management
6. Add account settings page
7. Implement email verification resend
8. Add password change functionality for logged-in users
