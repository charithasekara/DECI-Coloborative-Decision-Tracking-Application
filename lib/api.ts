import axios, { AxiosResponse } from 'axios';
import { Decision, Goal, Project } from './types';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.data) {
    const transformDates = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(item => transformDates(item));
      }
      const newObj = { ...obj };
      for (const key in newObj) {
        if (newObj[key] instanceof Date) {
          newObj[key] = newObj[key].toISOString();
        } else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
          newObj[key] = transformDates(newObj[key]);
        }
      }
      return newObj;
    };
    config.data = transformDates(config.data);
    config.data = JSON.stringify(config.data);
    console.log('Request payload after transformation and stringification:', config.data);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const transformDates = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(item => transformDates(item));
      }
      const newObj = { ...obj };
      for (const key in newObj) {
        if (
          typeof newObj[key] === 'string' &&
          (key === 'deadline' || key === 'createdAt' || key === 'updatedAt') &&
          newObj[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/)
        ) {
          newObj[key] = new Date(newObj[key]);
        } else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
          newObj[key] = transformDates(newObj[key]);
        }
      }
      if (newObj.title && !newObj.id && response.config.url?.includes('/decisions')) {
        console.warn('Missing id in decision object, using a placeholder. Check server response:', newObj);
        newObj.id = `temp_${Date.now()}`;
      }
      if (newObj.affectedAreas && !Array.isArray(newObj.affectedAreas)) {
        newObj.affectedAreas = Object.values(newObj.affectedAreas)
          .filter((v: unknown): v is string => typeof v === 'string' && v.trim().length > 0)
          .map((v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, ''));
      } else if (Array.isArray(newObj.affectedAreas)) {
        newObj.affectedAreas = newObj.affectedAreas
          .filter((v: unknown): v is string => typeof v === 'string' && v.trim().length > 0)
          .map((v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, ''));
      } else {
        newObj.affectedAreas = [];
      }
      if (newObj.title && !newObj.hasOwnProperty('category')) {
        console.warn('Malformed Decision object detected, missing category:', newObj);
      }
      return newObj;
    };

    if (response.status === 204) {
      response.data = {};
    } else if (response.data?.data) {
      response.data = transformDates(response.data.data);
    } else if (response.data?.decisions) {
      response.data = { ...response.data, decisions: transformDates(response.data.decisions) };
    } else if (Array.isArray(response.data)) {
      response.data = { 
        decisions: transformDates(response.data), 
        total: response.data.length, 
        pages: 1, 
        currentPage: 1 
      };
    } else if (response.data?.decision) {
      response.data = { decision: transformDates(response.data.decision) };
    } else {
      response.data = transformDates(response.data);
    }
    console.log('API Response:', response.data);
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const status = error.response?.status;
    const errors = error.response?.data?.errors || [];
    console.error('API Error:', { message, status, errors });
    const err = new Error(message);
    (err as any).status = status;
    (err as any).errors = errors;
    return Promise.reject(err);
  }
);

const retry = async <T>(fn: () => Promise<AxiosResponse<T>>, retries: number = 3, delay: number = 1000): Promise<AxiosResponse<T>> => {
  try {
    const response = await fn();
    return response;
  } catch (error: any) {
    if (retries === 0) throw error;
    console.log(`Retrying after error: ${error.message}, retries left: ${retries}`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

export const decisionApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }) =>
    retry<{ decisions: Decision[]; total: number; pages: number; currentPage: number }>(() =>
      api.get('/decisions', { params })
    ).then((response) => response.data).catch((error) => {
      console.error('getAll failed:', error);
      throw error;
    }),

  getById: (id: string) =>
    retry<{ decision: Decision }>(() => api.get(`/decisions/${id}`)).then((response) => response.data).catch((error) => {
      console.error(`getById failed for id ${id}:`, error);
      throw error;
    }),

  create: (data: Partial<Decision>) => {
    const sanitizedData = {
      ...data,
      affectedAreas: Array.isArray(data.affectedAreas)
        ? data.affectedAreas.filter((area): area is string => typeof area === 'string')
        : [],
      stakeholders: data.stakeholders || {},
      outcomes: data.outcomes || {},
    };
    console.log('Sending create payload with affectedAreas:', sanitizedData.affectedAreas);
    return retry<{ decision: Decision } | { message: string; errors?: string[] }>(() =>
      api.post('/decisions', sanitizedData)
    ).then((response) => response.data).catch((error) => {
      console.error('create failed:', error);
      throw error;
    });
  },

  update: (id: string, data: Partial<Decision>) => {
    const sanitizedData = {
      ...data,
      affectedAreas: Array.isArray(data.affectedAreas)
        ? data.affectedAreas.filter((area): area is string => typeof area === 'string')
        : [],
      stakeholders: data.stakeholders || undefined,
      outcomes: data.outcomes || undefined,
    };
    console.log(`Sending update payload for id ${id} with affectedAreas:`, sanitizedData.affectedAreas);
    return retry<{ decision: Decision }>(() =>
      api.patch(`/decisions/${id}`, sanitizedData)
    ).then((response) => response.data).catch((error) => {
      console.error(`update failed for id ${id}:`, error);
      throw error;
    });
  },

  delete: (id: string) => {
    console.log(`Initiating delete request for id: ${id}`);
    return retry<void>(() => api.delete(`/decisions/${id}`))
      .then((response) => {
        if (response.status === 204) {
          console.log(`Delete successful for id: ${id}`);
          return;
        } else {
          throw new Error(`Unexpected response status ${response.status} for delete of id: ${id}`);
        }
      })
      .catch((error) => {
        console.error(`Delete failed for id ${id}:`, error);
        throw error;
      });
  },
};

export const goalApi = {
  getAll: () => retry<{ goals: Goal[] }>(() => api.get('/goals')).then((response) => response.data).catch((error) => {
    console.error('getAll goals failed:', error);
    throw error;
  }),
  create: (data: Partial<Goal>) => retry<{ goal: Goal }>(() => api.post('/goals', data)).then((response) => response.data).catch((error) => {
    console.error('create goal failed:', error);
    throw error;
  }),
};

export const projectApi = {
  getAll: () => retry<{ projects: Project[] }>(() => api.get('/projects')).then((response) => response.data).catch((error) => {
    console.error('getAll projects failed:', error);
    throw error;
  }),
  create: (data: Partial<Project>) => retry<{ project: Project }>(() => api.post('/projects', data)).then((response) => response.data).catch((error) => {
    console.error('create project failed:', error);
    throw error;
  }),
};

export default api;