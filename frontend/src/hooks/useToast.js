import { toast as sonnerToast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';

/**
 * Custom toast hook with predefined types and colors
 * Uses Sonner under the hood with consistent styling
 */
export const useToast = () => {
  /**
   * Show success toast (Green)
   * @param {string} message - The success message
   * @param {object} options - Additional toast options
   */
  const success = (message, options = {}) => {
    return sonnerToast.success(message, {
      icon: <CheckCircle2 className="h-5 w-5" />,
      duration: 4000,
      ...options,
    });
  };

  /**
   * Show error toast (Red)
   * @param {string} message - The error message
   * @param {object} options - Additional toast options
   */
  const error = (message, options = {}) => {
    return sonnerToast.error(message, {
      icon: <XCircle className="h-5 w-5" />,
      duration: 5000,
      ...options,
    });
  };

  /**
   * Show warning toast (Yellow)
   * @param {string} message - The warning message
   * @param {object} options - Additional toast options
   */
  const warning = (message, options = {}) => {
    return sonnerToast.warning(message, {
      icon: <AlertTriangle className="h-5 w-5" />,
      duration: 4500,
      ...options,
    });
  };

  /**
   * Show info toast (Blue)
   * @param {string} message - The info message
   * @param {object} options - Additional toast options
   */
  const info = (message, options = {}) => {
    return sonnerToast.info(message, {
      icon: <Info className="h-5 w-5" />,
      duration: 4000,
      ...options,
    });
  };

  /**
   * Show loading toast (Gray)
   * @param {string} message - The loading message
   * @param {object} options - Additional toast options
   */
  const loading = (message, options = {}) => {
    return sonnerToast.loading(message, {
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
      duration: Infinity, // Loading toasts don't auto-dismiss
      ...options,
    });
  };

  /**
   * Show promise toast (handles loading, success, error states)
   * @param {Promise} promise - The promise to track
   * @param {object} messages - Messages for each state
   */
  const promise = (promise, messages = {}) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Something went wrong',
    });
  };

  /**
   * Dismiss a specific toast or all toasts
   * @param {string|number} toastId - The ID of the toast to dismiss (optional)
   */
  const dismiss = (toastId) => {
    return sonnerToast.dismiss(toastId);
  };

  /**
   * Show a custom toast with full control
   * @param {string} message - The message
   * @param {object} options - Toast options
   */
  const custom = (message, options = {}) => {
    return sonnerToast(message, options);
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    custom,
  };
};

// Export individual toast functions for direct import
export const toast = {
  success: (message, options) => {
    return sonnerToast.success(message, {
      icon: <CheckCircle2 className="h-5 w-5" />,
      duration: 4000,
      ...options,
    });
  },
  error: (message, options) => {
    return sonnerToast.error(message, {
      icon: <XCircle className="h-5 w-5" />,
      duration: 5000,
      ...options,
    });
  },
  warning: (message, options) => {
    return sonnerToast.warning(message, {
      icon: <AlertTriangle className="h-5 w-5" />,
      duration: 4500,
      ...options,
    });
  },
  info: (message, options) => {
    return sonnerToast.info(message, {
      icon: <Info className="h-5 w-5" />,
      duration: 4000,
      ...options,
    });
  },
  loading: (message, options) => {
    return sonnerToast.loading(message, {
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
      duration: Infinity,
      ...options,
    });
  },
  promise: (promise, messages) => {
    return sonnerToast.promise(promise, messages);
  },
  dismiss: (toastId) => {
    return sonnerToast.dismiss(toastId);
  },
  custom: (message, options) => {
    return sonnerToast(message, options);
  },
};
