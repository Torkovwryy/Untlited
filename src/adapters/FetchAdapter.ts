import type { HttpClientAdapter, XelusResponse, XelusRequestConfig } from '../types/index.js';
import { HttpError } from '../errors/HttpError.js';
import { NetworkError } from '../errors/NetworkError.js';

export class FetchAdapter implements HttpClientAdapter {
  public async request<T>(config: XelusRequestConfig): Promise<XelusResponse<T>> {
    const {
      url = '',
      baseURL,
      method = 'GET',
      headers = {},
      params,
      body,
      timeout,
      signal,
    } = config;

    // 1. URL Construction
    let fullUrl = baseURL && !url.startsWith('http') ? `${baseURL}` : url;

    if (params) {
      const searchParams = new URLSearchParams(params as Record<string, string>);
      fullUrl += `?${searchParams.toString()}`;
    }

    // 2. Timeout and Abort Signal mapping
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (timeout) {
      timeoutId = setTimeout(() => controller.abort('Timeout exceeded'), timeout);
    }

    // Merge  consumer signal with internal timeout controller
    const fetchSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;

    const normalizedHeaders = new Headers(headers);

    // 3. Request Preparation
    const fetchOptions: RequestInit = {
      method,
      headers: normalizedHeaders,
      signal: fetchSignal,
    };

    // Auto-serialize JSON body
    if (body) {
      if (typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
        fetchOptions.body = JSON.stringify(body);
        if (!normalizedHeaders.has('Content-Type')) {
          normalizedHeaders.set('Content-Type', 'application/json');
        }
      } else {
        fetchOptions.body = body as BodyInit;
      }
    }

    // 4. Execution
    try {
      const response = await fetch(fullUrl, fetchOptions);
      clearTimeout(timeoutId);

      // Serialize response body based on Content-Type
      let data: T;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as unknown as T; // Fallback to string
      }

      // Convert Headers to standard Record
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const xelusResponse: XelusResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        config,
      };

      // 5. Error detection (HTTP Level)
      if (!response.ok) {
        throw new HttpError(
          `Request failed with status ${response.status}`,
          response.status,
          xelusResponse,
          config,
        );
      }

      return xelusResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      // If the error us already a mapped HttpError, propagate it
      if (error instanceof HttpError) {
        throw error;
      }

      // 6. Network Level Errors (DNS, Abort, Timeout)
      const normalizedError = error instanceof Error ? error : new Error('Unknown Network Error');

      throw new NetworkError(`Network Error: ${normalizedError.message}`, config, normalizedError);
    }
  }
}
