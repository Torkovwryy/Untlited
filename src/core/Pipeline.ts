import type { XelusContext, XelusMiddleware } from '../types/index.js';

export class Pipeline {
  private middleware: XelusMiddleware[] = [];

  public use(middleware: XelusMiddleware): void {
    if (!middleware.name || typeof middleware.handler !== 'function') {
      throw new Error('Invalid Xelus middleware provided.');
    }

    this.middleware.push(middleware);
  }

  /**
   * Executes the middleware chain.
   * The finalHandler is typically the transport layer adapter call.
   */
  public execute(ctx: XelusContext, finalHandler: () => Promise<void>): Promise<void> {
    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error(
          `next() called multiple times in middleware: ${this.middleware[i - 1]?.name}`,
        );
      }
      index = i;

      let handlerFn = this.middleware[i]?.handler;

      if (i === this.middleware.length) {
        handlerFn = async (_ctx, next): Promise<void> => {
          await finalHandler();
          await next();
        };
      }

      if (!handlerFn) {
        return;
      }

      await handlerFn(ctx, dispatch.bind(null, i + 1));
    };

    return dispatch(0);
  }
}
