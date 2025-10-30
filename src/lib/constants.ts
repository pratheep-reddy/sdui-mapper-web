// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sdui-server.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
  // Template endpoints
  templates: {
    list: () => `${API_BASE_URL}/templates`,
    getById: (templateId: string) => `${API_BASE_URL}/templates/${templateId}`,
    create: () => `${API_BASE_URL}/templates`,
    update: (templateId: string) => `${API_BASE_URL}/templates/${templateId}`,
    delete: (templateId: string) => `${API_BASE_URL}/templates/${templateId}`,
    dynamicSettings: {
      list: (templateId: string) => `${API_BASE_URL}/templates/${templateId}/dynamic-settings`,
      create: (templateId: string) => `${API_BASE_URL}/templates/${templateId}/dynamic-settings`,
    }
  },
  // SDUI endpoints
  sdui: {
    component: (componentId: string) => `${API_BASE_URL}/sdui/component/${componentId}`,
  }
} as const;

