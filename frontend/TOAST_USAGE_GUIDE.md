# Toast Notification System - Usage Guide

## Overview

We use **Sonner** for toast notifications with custom styling and typed methods. All toast types include custom colors and icons for better visual feedback.

## Setup

The toast system is already integrated into the app via `App.jsx`. The `<Toaster />` component is mounted globally.

## Import

```javascript
import { toast } from '../../hooks/useToast';
// OR
import { useToast } from '../../hooks/useToast';
```

## Toast Types

### 1. Success Toast (Green)
Used for successful operations like login, save, create, etc.

```javascript
// Simple success
toast.success('Profile saved successfully!');

// With description
toast.success('Account created!', {
  description: 'Welcome to the platform!'
});

// With custom duration
toast.success('Changes saved', {
  duration: 3000  // 3 seconds
});
```

**Visual**: Green background, green border, CheckCircle2 icon

---

### 2. Error Toast (Red)
Used for errors, failed operations, validation errors, etc.

```javascript
// Simple error
toast.error('Something went wrong');

// With description
toast.error('Login failed', {
  description: 'Invalid email or password'
});

// With longer duration for critical errors
toast.error('Critical error', {
  description: 'Please contact support',
  duration: 10000  // 10 seconds
});
```

**Visual**: Red background, red border, XCircle icon

---

### 3. Warning Toast (Yellow)
Used for warnings, potential issues, confirmations needed, etc.

```javascript
// Simple warning
toast.warning('Unsaved changes detected');

// With description
toast.warning('Storage almost full', {
  description: 'You have used 90% of your storage'
});
```

**Visual**: Yellow background, yellow border, AlertTriangle icon

---

### 4. Info Toast (Blue)
Used for informational messages, tips, neutral notifications, etc.

```javascript
// Simple info
toast.info('New update available');

// With description
toast.info('Code resent', {
  description: 'Check your email for a new verification code'
});
```

**Visual**: Blue background, blue border, Info icon

---

### 5. Loading Toast (Gray)
Used for long-running operations. Loading toasts don't auto-dismiss.

```javascript
// Show loading toast
const loadingToastId = toast.loading('Uploading file...');

// Later, dismiss when done
toast.dismiss(loadingToastId);

// Or show success after loading
setTimeout(() => {
  toast.dismiss(loadingToastId);
  toast.success('File uploaded successfully!');
}, 3000);
```

**Visual**: Gray background, gray border, spinning Loader2 icon

---

### 6. Promise Toast
Automatically handles loading, success, and error states for promises.

```javascript
// Basic promise toast
toast.promise(
  fetchData(),
  {
    loading: 'Loading data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data'
  }
);

// Advanced promise toast with dynamic messages
toast.promise(
  saveProfile(data),
  {
    loading: 'Saving profile...',
    success: (result) => `Profile saved! ID: ${result.id}`,
    error: (err) => `Error: ${err.message}`
  }
);
```

---

## Advanced Usage

### Using the Hook
For component-level usage with more control:

```javascript
import { useToast } from '../../hooks/useToast';

function MyComponent() {
  const { success, error, warning, info, loading, dismiss } = useToast();

  const handleSave = async () => {
    const toastId = loading('Saving...');

    try {
      await saveData();
      dismiss(toastId);
      success('Saved successfully!');
    } catch (err) {
      dismiss(toastId);
      error('Save failed', {
        description: err.message
      });
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### Dismissing Toasts

```javascript
// Dismiss specific toast
const toastId = toast.success('Hello');
toast.dismiss(toastId);

// Dismiss all toasts
toast.dismiss();
```

### Custom Options

All toast methods accept an options object:

```javascript
toast.success('Message', {
  description: 'Additional details',
  duration: 5000,          // Duration in ms
  position: 'top-right',   // Position on screen
  dismissible: true,       // Can be dismissed by user
  action: {                // Add action button
    label: 'Undo',
    onClick: () => console.log('Undo')
  }
});
```

---

## Real-World Examples

### Authentication Flow

```javascript
// Login.jsx
const handleLogin = async (data) => {
  try {
    await login(data.email, data.password);
    toast.success('Login successful!', {
      description: 'Welcome back!'
    });
    navigate('/dashboard');
  } catch (err) {
    toast.error('Login failed', {
      description: err.message
    });
  }
};
```

### Profile Completion

```javascript
// CompleteProfile.jsx
const handleProfileSave = async (data) => {
  try {
    await completeProfile(token, data);
    toast.success('Account created successfully! Welcome aboard!', {
      description: 'Redirecting to onboarding...'
    });
    setTimeout(() => navigate('/onboarding'), 1000);
  } catch (err) {
    toast.error('Profile creation failed', {
      description: err.message
    });
  }
};
```

### OTP Verification

```javascript
// VerifyOtp.jsx
const handleVerify = async (code) => {
  try {
    await verifyOtp(email, code);
    toast.success('Email verified successfully!', {
      description: 'Please complete your profile to continue'
    });
    navigate('/complete-profile');
  } catch (err) {
    toast.error('Verification failed', {
      description: 'Invalid or expired code'
    });
  }
};
```

### File Upload with Progress

```javascript
const handleUpload = async (file) => {
  const toastId = toast.loading('Uploading file...');

  try {
    const result = await uploadFile(file);
    toast.dismiss(toastId);
    toast.success('File uploaded!', {
      description: `${file.name} uploaded successfully`
    });
  } catch (err) {
    toast.dismiss(toastId);
    toast.error('Upload failed', {
      description: err.message
    });
  }
};
```

### Bulk Operations

```javascript
const handleBulkDelete = async (items) => {
  const toastId = toast.loading(`Deleting ${items.length} items...`);

  try {
    await Promise.all(items.map(item => deleteItem(item.id)));
    toast.dismiss(toastId);
    toast.success('Items deleted', {
      description: `Successfully deleted ${items.length} items`
    });
  } catch (err) {
    toast.dismiss(toastId);
    toast.error('Delete failed', {
      description: `Failed to delete some items: ${err.message}`
    });
  }
};
```

---

## Color Reference

| Type | Background | Border | Icon Color |
|------|-----------|--------|-----------|
| Success | `bg-green-50` | `border-green-200` | `text-green-600` |
| Error | `bg-red-50` | `border-red-200` | `text-red-600` |
| Warning | `bg-yellow-50` | `border-yellow-200` | `text-yellow-600` |
| Info | `bg-blue-50` | `border-blue-200` | `text-blue-600` |
| Loading | `bg-gray-50` | `border-gray-200` | `text-gray-600` |

---

## Best Practices

### ✅ DO:
- Use **success** for completed operations
- Use **error** for failed operations and validation errors
- Use **warning** for cautionary messages
- Use **info** for neutral notifications
- Use **loading** for long operations (>500ms)
- Provide clear, concise messages
- Include descriptions for additional context
- Dismiss loading toasts when operation completes

### ❌ DON'T:
- Don't show toasts for every minor action
- Don't use generic messages like "Error" without context
- Don't forget to dismiss loading toasts
- Don't use toast for critical confirmations (use Dialog instead)
- Don't show multiple toasts for the same error
- Avoid overly technical error messages for users

---

## Component Files

- **Toaster Component**: `frontend/src/components/ui/sonner.jsx`
- **Toast Hook**: `frontend/src/hooks/useToast.js`
- **Integration**: `frontend/src/App.jsx`

---

## Dependencies

```json
{
  "sonner": "^1.x.x",
  "lucide-react": "^0.x.x"
}
```

---

## Configuration

The Toaster is configured in `sonner.jsx`:

```javascript
<Sonner
  theme="light"
  position="top-right"
  // Custom styling for each type
/>
```

To change the global position or theme, edit the Toaster component directly.
