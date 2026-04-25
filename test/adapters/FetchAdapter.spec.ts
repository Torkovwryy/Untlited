import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FetchAdapter } from '../../src/adapters/FetchAdapter.js';
import { HttpError } from '../../src/errors/HttpError.js';
import { NetworkError } from '../../src/errors/NetworkError.js';

describe('FetchAdapter', () => {
  let adapter: FetchAdapter;

  beforeEach(() => {
    adapter = new FetchAdapter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should perform a successful GET request', async () => {
    const mockResponse = { success: true };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    const response = await adapter.request({ url: 'https://api.test.com/data', method: 'GET' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.data).toEqual(mockResponse);
    expect(response.status).toBe(200);
  });

  it('should serialize JSON body on POST request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers(),
      text: async () => 'created',
    });
    vi.stubGlobal('fetch', fetchMock);

    await adapter.request({
      url: '/users',
      baseURL: 'https://api.test.com',
      method: 'POST',
      body: { name: 'Xelus' }
    });

    const calledRequest = fetchMock.mock.calls[0][1] as RequestInit;
    expect(calledRequest.body).toBe(JSON.stringify({ name: 'Xelus' }));
    expect((calledRequest.headers as Headers).get('Content-Type')).toBe('application/json');
  });

  it('should throw HttpError on non-ok status (e.g. 404)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      text: async () => 'Not Found Page',
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      adapter.request({ url: '/missing' })
    ).rejects.toThrowError(HttpError);
  });

  it('should throw NetworkError on fetch exception (e.g. DNS failure)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      adapter.request({ url: '/offline' })
    ).rejects.toThrow(NetworkError);
  });

  it('should append params to URL correctly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => 'ok',
    });
    vi.stubGlobal('fetch', fetchMock);

    await adapter.request({
      url: 'https://api.com/users',
      params: { page: 1, active: true }
    });

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.com/users?page=1&active=true');
  });

  it('should handle timeout configurations', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => 'ok',
    });
    vi.stubGlobal('fetch', fetchMock);

    await adapter.request({ url: '/timeout-test', timeout: 5000 });

    const calledRequest = fetchMock.mock.calls[0][1] as RequestInit;
    expect(calledRequest.signal).toBeInstanceOf(AbortSignal);
  });

  it('should handle non-Error exceptions gracefully in catch block', async () => {
    const fetchMock = vi.fn().mockRejectedValue('String Error Without Message');
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      adapter.request({ url: '/weird-error' })
    ).rejects.toThrow('Network Error: Unknown Network Error');
  });
});
