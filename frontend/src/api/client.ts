import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const rawAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Cache store
interface CacheRecord {
  data: any;
  timestamp: number;
}

const memoryCache = new Map<string, CacheRecord>();
const inFlightRequests = new Map<string, Promise<any>>();
const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds

export const clearApiCache = (pattern?: string) => {
  if (!pattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
};

export const getCachedData = <T = any>(url: string): T | null => {
  const item = memoryCache.get(url);
  if (!item) return null;
  if (Date.now() - item.timestamp > DEFAULT_TTL_MS) {
    memoryCache.delete(url);
    return null;
  }
  return item.data as T;
};

export const setCachedData = <T = any>(url: string, data: T) => {
  memoryCache.set(url, { data, timestamp: Date.now() });
};

// Request interceptor to attach Bearer token
rawAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('school_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error logging, 401 handling, & cache invalidation on mutations
rawAxiosInstance.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (method && ['post', 'put', 'delete', 'patch'].includes(method)) {
      const url = response.config.url || '';
      if (url.includes('/wallet') || url.includes('/topup') || url.includes('/pos')) {
        clearApiCache('/wallet');
        clearApiCache('/school/overview');
        clearApiCache('/school/siswa');
      } else if (url.includes('/kopsis')) {
        clearApiCache('/kopsis');
        clearApiCache('/school/kopsis');
        clearApiCache('/school/overview');
      } else if (url.includes('/library')) {
        clearApiCache('/library');
        clearApiCache('/school/library');
      } else if (url.includes('/attendance')) {
        clearApiCache('/attendance');
        clearApiCache('/school');
      } else {
        const segment = url.split('/').filter(Boolean)[0];
        if (segment) {
          clearApiCache(segment);
        }
      }
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('school_auth_token');
      localStorage.removeItem('school_auth_user');
      clearApiCache();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Save original get method
const originalGet = rawAxiosInstance.get.bind(rawAxiosInstance);

// Enhanced get method with transparent in-memory SWR caching and in-flight deduplication
rawAxiosInstance.get = function <T = any, R = AxiosResponse<T>, D = any>(
  url: string,
  config?: AxiosRequestConfig<D> & { skipCache?: boolean; ttlMs?: number }
): Promise<R> {
  const skipCache = config?.skipCache || config?.headers?.['x-skip-cache'];
  const cacheKey = url + (config?.params ? `?${JSON.stringify(config.params)}` : '');
  const ttl = config?.ttlMs ?? DEFAULT_TTL_MS;
  const now = Date.now();

  if (!skipCache) {
    const cached = memoryCache.get(cacheKey);
    if (cached && now - cached.timestamp < ttl) {
      // Revalidate in background if older than 15s
      if (now - cached.timestamp > 15 * 1000 && !inFlightRequests.has(cacheKey)) {
        originalGet<T>(url, {
          ...config,
          headers: { ...config?.headers, 'x-skip-cache': 'true' },
        } as any)
          .then((fresh) => {
            memoryCache.set(cacheKey, { data: fresh.data, timestamp: Date.now() });
          })
          .catch(() => {});
      }

      // Return cached response immediately (0ms latency)
      return Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK (Cached)',
        headers: {},
        config: (config || {}) as any,
      } as unknown as R);
    }

    // Deduplicate in-flight requests
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey) as Promise<R>;
    }
  }

  const promise = originalGet<T>(url, config as any)
    .then((res) => {
      if (!skipCache && res.status >= 200 && res.status < 300) {
        memoryCache.set(cacheKey, { data: res.data, timestamp: Date.now() });
      }
      return res as unknown as R;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  if (!skipCache) {
    inFlightRequests.set(cacheKey, promise);
  }

  return promise;
} as any;

export const apiClient = rawAxiosInstance;
