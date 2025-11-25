import axios from 'axios';

// Use environment variable for API URL, fallback to relative path for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://cyberawareness.onrender.com/api' : 'http://localhost:5000/api');

// Export API base URL for use in components that need direct fetch calls
export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  // First, try to get the standard auth token
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // If no standard token, check for Firebase user ID
    // This is needed for Firebase auth users
    const firebaseUserId = localStorage.getItem('firebaseUserId');
    if (firebaseUserId) {
      // For Firebase auth, the backend expects the Firebase UID as the token
      config.headers.Authorization = `Bearer ${firebaseUserId}`;
    } else {
      // Fallback: try to get user ID from user object
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.id) {
            config.headers.Authorization = `Bearer ${user.id}`;
          }
        }
      } catch (e) {
        // Ignore errors parsing user data
      }
    }
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (connection refused, etc.)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('API Error: Backend server is not running or unreachable. Please start the server on port 5000.');
      // You could show a toast notification here if needed
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  }
};

// Add this new service to the file
export const timeMachineService = {
  getScenariosByEra: async (year: number) => {
    const response = await api.get(`/scenarios/era/${year}`);
    return response.data;
  },
};

// ADD THIS NEW FUNCTION to backendApi.ts

// Convenience function for the vulnerable analyzer
export const analyzeContentVulnerable = async (inputType: string, inputContent: string) => {
  const response = await api.post('/analyzer/analyze-vulnerable', { inputType, inputContent });
  return response.data;
};

// Report Services (Public - no auth required)
export const reportService = {
  submit: async (reportData: {
    scamType: string;
    description: string;
    websiteUrl?: string;
    phoneNumber?: string;
    emailAddress?: string;
    severity: string;
    // Enhanced complaint fields
    fullName?: string;
    mobile?: string;
    gender?: string;
    dob?: string;
    spouse?: string;
    relationWithVictim?: string;
    personalEmail?: string;
    houseNo?: string;
    streetName?: string;
    colony?: string;
    village?: string;
    tehsil?: string;
    district?: string;
    state?: string;
    country?: string;
    policeStation?: string;
    pincode?: string;
  }) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  downloadPDF: async (reportId: string) => {
    const response = await api.get(`/reports/pdf/${reportId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getMyReports: async () => {
    const response = await api.get('/reports/my-reports');
    return response.data;
  },

  getSessionReports: async (sessionId: string) => {
    const response = await api.get(`/reports/session/${sessionId}`);
    return response.data;
  },

  getRecentReports: async () => {
    const response = await api.get('/reports/recent');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/reports/stats');
    return response.data;
  }
};

// Analyzer Services (Public - no auth required)
export const analyzerService = {
  analyze: async (inputType: string, inputContent: string) => {
    const response = await api.post('/analyzer/analyze', { inputType, inputContent });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/analyzer/history');
    return response.data;
  },

  getSessionHistory: async (sessionId: string) => {
    const response = await api.get(`/analyzer/session/${sessionId}`);
    return response.data;
  }
};

// OCR Services
export const ocrService = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/ocr/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// User Services
export const userService = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/user/history');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  updatePoints: async (points: number, reason: string) => {
    const response = await api.post('/user/points', { points, reason });
    return response.data;
  }
};

// Community Services
export const communityService = {
  initializeTopics: async () => {
    const response = await api.post('/community/topics/init');
    return response.data;
  },

  getTopics: async () => {
    const response = await api.get('/community/topics');
    return response.data;
  },

  getPosts: async (params: {
    topicId?: string;
    page?: number;
    limit?: number;
    sort?: 'recent' | 'popular' | 'views';
  }) => {
    const response = await api.get('/community/posts', { params });
    return response.data;
  },

  getPostDetails: async (postId: string) => {
    const response = await api.get(`/community/posts/${postId}`);
    return response.data;
  },

  createPost: async (postData: {
    title: string;
    content: string;
    topicId: string;
    tags?: string[];
  }) => {
    const response = await api.post('/community/posts', postData);
    return response.data;
  },

  createComment: async (postId: string, content: string) => {
    const response = await api.post(`/community/posts/${postId}/comments`, { content });
    return response.data;
  }
};

// Config Services
export const configService = {
  getValidationRules: async () => {
    const response = await api.get('/config/validation-rules');
    return response.data;
  },

  updateValidationRules: async (rules: any) => {
    const response = await api.put('/config/validation-rules', rules);
    return response.data;
  }
};

// Session Service
export const sessionService = {
  getSessionId: async () => {
    const response = await api.get('/health');
    return response.data.sessionId;
  }
};

// Export convenience functions for ScamAnalyzer component
export const analyzeContent = async (inputType: string, inputContent: string) => {
  const response = await analyzerService.analyze(inputType, inputContent);
  // Store session ID if returned
  if (response.sessionId) {
    localStorage.setItem('sessionId', response.sessionId);
  }
  return response;
};

export const getSessionAnalysisHistory = async (sessionId: string) => {
  return analyzerService.getSessionHistory(sessionId);
};

// Export convenience functions for ReportScam component
export const submitScamReport = async (reportData: any) => {
  const response = await reportService.submit(reportData);
  // Store session ID if returned
  if (response.sessionId) {
    localStorage.setItem('sessionId', response.sessionId);
  }
  return response;
};

export const getSessionReports = async (sessionId: string) => {
  return reportService.getSessionReports(sessionId);
};

// Helper function to get current session ID
export const getSessionId = () => {
  return localStorage.getItem('sessionId');
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

// Keep-alive service to prevent Render server from sleeping
export const keepAliveService = {
  ping: async () => {
    try {
      const response = await fetch('https://wlarus.onrender.com/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Keep-alive ping sent: hy server dont sleep');
      return response;
    } catch (error) {
      console.warn('Keep-alive ping failed:', error);
      return null;
    }
  }
};

// Export the api instance for custom requests
export default api;
