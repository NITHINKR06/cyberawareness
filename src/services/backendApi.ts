import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// Export the api instance for custom requests
export default api;
