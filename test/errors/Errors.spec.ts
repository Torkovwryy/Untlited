import { describe, it, expect } from 'vitest';
import { XelusError } from '../../src/errors/XelusError.js';
import { HttpError } from '../../src/errors/HttpError.js';
import { NetworkError } from '../../src/errors/NetworkError.js';
import type { XelusRequestConfig, XelusResponse } from '../../src/types/index.js';

describe('Error Classes', () => {
  const mockConfig: XelusRequestConfig = { url: '/test' };
  const mockResponse: XelusResponse = {
    data: null,
    status: 500,
    statusText: 'Internal Server Error',
    headers: {},
    config: mockConfig,
  };

  it('XelusError should have correct properties and prototype chain', () => {
    const error = new XelusError('Base error');
    expect(error.message).toBe('Base error');
    expect(error.name).toBe('XelusError');
    expect(error.isXelusError).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  it('HttpError should store status and response', () => {
    const error = new HttpError('HTTP 500', 500, mockResponse, mockConfig);
    expect(error.status).toBe(500);
    expect(error.response).toBe(mockResponse);
    expect(error.config).toBe(mockConfig);
    expect(error.isXelusError).toBe(true);
  });

  it('NetworkError should store config and original error', () => {
    const original = new TypeError('Failed to fetch');
    const error = new NetworkError('Network failed', mockConfig, original);
    expect(error.config).toBe(mockConfig);
    expect(error.originalError).toBe(original);
    expect(error.isXelusError).toBe(true);
  });
});
