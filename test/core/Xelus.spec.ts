import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Xelus } from '../../src/core/Xelus.js';
import type { HttpClientAdapter, XelusRequestConfig, XelusResponse } from '../../src/types/index.js';

describe('Xelus Core Class', () => {
  let mockAdapter: HttpClientAdapter;
  let xelus: Xelus;

  beforeEach(() => {
    mockAdapter = {
      request: vi.fn().mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as XelusResponse<{ success: boolean }>),
    };

    xelus = new Xelus({ baseURL: 'https://api.example.com' }, mockAdapter);
  });

  it('should merge default configs with method configs', async () => {
    await xelus.get('/users', { headers: { 'Authorization': 'Bearer 123' } });

    expect(mockAdapter.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/users',
        baseURL: 'https://api.example.com',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Authorization': 'Bearer 123',
        },
      })
    );
  });

  it('should throw error if response is undefined after pipeline execution', async () => {
    xelus.use({
      name: 'Blackhole Middleware',
      handler: async () => {
      },
    });

    await expect(xelus.get('/broken')).rejects.toThrow(
      'Pipeline execution finished without generating a response.'
    );
  });

  it('should map convenience methods (post, put, delete) correctly', async () => {
    await xelus.post('/users', { name: 'John' });
    expect(mockAdapter.request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', url: '/users', body: { name: 'John' } })
    );

    await xelus.put('/users/1', { role: 'admin' });
    expect(mockAdapter.request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'PUT', url: '/users/1', body: { role: 'admin' } })
    );

    await xelus.delete('/users/1');
    expect(mockAdapter.request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', url: '/users/1' })
    );
  });

  it('should instantiate with default FetchAdapter if no adapter is provided', () => {
    const defaultXelus = new Xelus();
    expect(defaultXelus).toBeInstanceOf(Xelus);
    expect(defaultXelus.defaults.headers).toHaveProperty('Accept');
  });
});
