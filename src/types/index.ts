export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface XelusRequestConfig {
  url?: string;
  method?: HttpMethod;
  baseURL?: string;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: unknown;
  timeout?: number; // In milliseconds
  signal?: AbortSignal;
}

export interface XelusResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: XelusRequestConfig;
}

export interface XelusContext<T = unknown> {
  request: XelusRequestConfig;
  response?: XelusResponse<T>;
  error?: Error;
}

export type XelusNext = () => Promise<void>;

export interface XelusMiddleware {
  name: string;
  handler: (ctx: XelusContext, next: XelusNext) => Promise<void>;
}

export interface HttpClientAdapter {
  request<T>(config: XelusRequestConfig): Promise<XelusResponse<T>>;
}
