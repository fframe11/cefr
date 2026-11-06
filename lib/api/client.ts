import { supabase } from '../supabaseClient';
import { ApiError, ApiResponse, ApiErrorResponse } from './types';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
  skipAuth?: boolean;
}

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Standardized Frontend API Client
 * Wraps fetch with Supabase JWT session injection, timeout management,
 * unified ApiError handling, and in-memory TTL caching for fast repeated transitions.
 */
export class ApiClient {
  private baseUrl: string;
  private cache = new Map<string, { data: any; expiresAt: number }>();

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        return data.session.access_token;
      }
      if (typeof window !== 'undefined' && localStorage.getItem('cefr_demo_session') === 'true') {
        return 'token-demo-student-id-active';
      }
      return null;
    } catch {
      if (typeof window !== 'undefined' && localStorage.getItem('cefr_demo_session') === 'true') {
        return 'token-demo-student-id-active';
      }
      return null;
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, timeoutMs = DEFAULT_TIMEOUT_MS, skipAuth = false, headers: customHeaders, ...restInit } = options;

    const method = (restInit.method || 'GET').toUpperCase();
    const isCacheableGet = method === 'GET' && !body;
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (isCacheableGet) {
      const cached = this.cache.get(url);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.data as T;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers = new Headers(customHeaders);
    headers.set('Accept', 'application/json');

    if (typeof window !== 'undefined' && localStorage.getItem('cefr_demo_session') === 'true') {
      headers.set('X-Demo-Mode', 'true');
    }

    if (body !== undefined && !(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (!skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...restInit,
        method,
        headers,
        body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new ApiError(408, 'การเชื่อมต่อหมดเวลา', 'TIMEOUT');
      }
      throw new ApiError(0, err.message || 'ไม่สามารถเชื่อมต่อเครือข่ายได้', 'NETWORK_ERROR');
    } finally {
      clearTimeout(timeoutId);
    }

    let payload: ApiResponse<T> | null = null;
    try {
      const text = await response.text();
      if (text) {
        payload = JSON.parse(text);
      }
    } catch {
      payload = null;
    }

    if (!response.ok || !payload || payload.success === false) {
      const status = response.status;
      const errorObj = (payload && !payload.success) ? (payload as ApiErrorResponse).error : null;
      const message = errorObj?.message || response.statusText || 'ไม่สามารถส่งคำขอข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
      const code = errorObj?.code || `HTTP_${status}`;
      const details = errorObj?.details;

      throw new ApiError(status, message, code, details);
    }

    if (isCacheableGet) {
      // Cache in-memory for 3 minutes to make back-and-forth tab transitions 0ms instant
      this.cache.set(url, { data: payload.data, expiresAt: Date.now() + 180_000 });
    }

    return payload.data;
  }

  public get<T>(endpoint: string, options?: Omit<RequestOptions, 'body' | 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body' | 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body' | 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body' | 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public delete<T>(endpoint: string, options?: Omit<RequestOptions, 'body' | 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
