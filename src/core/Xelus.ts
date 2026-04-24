import { Pipeline } from './Pipeline.js';
import { FetchAdapter } from '../adapters/FetchAdapter.js';
import type {
  XelusRequestConfig,
  XelusResponse,
  XelusContext,
  XelusMiddleware,
  HttpClientAdapter,
} from '../types/index.js';

export class Xelus {
  private pipeline: Pipeline;
  private adapter: HttpClientAdapter;
  private defaults: XelusRequestConfig;

  constructor(config: XelusRequestConfig = {}, adapter?: HttpClientAdapter) {
    this.defaults = {
      headers: {
        Accept: 'application/json, text/plain, */*',
      },
      ...config,
    };
    this.pipeline = new Pipeline();
    this.adapter = adapter ?? new FetchAdapter();
  }

  public use(middleware: XelusMiddleware): this {
    this.pipeline.use(middleware);
    return this; // Permit chain call (builder pattern)
  }

  public async request<T = unknown>(config: XelusRequestConfig): Promise<XelusResponse<T>> {
    // 1. Merge default config with specific request config
    const mergedConfig: XelusRequestConfig = {
      ...this.defaults,
      ...config,
      headers: {
        ...this.defaults.headers,
        ...config.headers,
      },
    };

    // 2. Initialize the Context
    const ctx: XelusContext<T> = {
      request: mergedConfig,
    };

    // 3. Define the final handler (the actual network call)
    const transportCall = async (): Promise<void> => {
      ctx.response = await this.adapter.request<T>(ctx.request);
    };

    // 4. Execute the Onion Pipeline
    try {
      await this.pipeline.execute(ctx, transportCall);

      if (!ctx.response) {
        throw new Error('Pipeline execution finished without generating a response.');
      }

      return ctx.response;
    } catch (error) {
      ctx.error = error as Error;

      throw ctx.error;
    }
  }

  // Convenience Methods
  public get<T = unknown>(
    url: string,
    config?: Omit<XelusRequestConfig, 'url' | 'method'>,
  ): Promise<XelusResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<XelusRequestConfig, 'url' | 'method' | 'body'>,
  ): Promise<XelusResponse> {
    return this.request<T>({ ...config, method: 'POST', url, body: data });
  }

  public put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<XelusRequestConfig, 'url' | 'method' | 'body'>,
  ): Promise<XelusResponse> {
    return this.request<T>({ ...config, method: 'PUT', url, body: data });
  }

  public delete<T = unknown>(
    url: string,
    config?: Omit<XelusRequestConfig, 'url' | 'method'>,
  ): Promise<XelusResponse> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}
