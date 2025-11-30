import { toast } from 'react-toastify';

/**
 * Toast notification utility for consistent messaging across the app
 * All toasts appear in the bottom-right corner
 */

export const toastService = {
  /**
   * Show success toast
   */
  success: (message: string, options?: any) => {
    return toast.success(message, {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, options?: any) => {
    return toast.error(message, {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  /**
   * Show warning toast
   */
  warning: (message: string, options?: any) => {
    return toast.warning(message, {
      position: 'bottom-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, options?: any) => {
    return toast.info(message, {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  /**
   * Show server down error toast
   */
  serverDown: () => {
    return toast.error('Please try again later.', {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  /**
   * Show network error toast
   */
  networkError: () => {
    return toast.error('Please try again later.', {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  /**
   * Show API error toast with custom message
   */
  apiError: (message: string = 'Please try again later.') => {
    return toast.error(message, {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
};

