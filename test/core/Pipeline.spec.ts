import { describe, it, expect } from 'vitest';
import { Pipeline } from '../../src/core/Pipeline.js';
import type { XelusContext } from '../../src/index.js';

describe('Pipeline (Onion Architecture)', () => {
  it('should execute middlewares in the correct order (downstream and upstream)', async () => {
    const pipeline = new Pipeline();
    const executionOrder: string[] = [];

    const ctx = { request: {} } as XelusContext;

    pipeline.use({
      name: 'Middleware 1',
      handler: async (_, next) => {
        executionOrder.push('1:before');
        await next();
        executionOrder.push('1:after');
      },
    });

    pipeline.use({
      name: 'Middleware 2',
      handler: async (_, next) => {
        executionOrder.push('2:before');
        await next();
        executionOrder.push('2:after');
      },
    });

    const finalHandler = async () => {
      executionOrder.push('network:call');
    };

    await pipeline.execute(ctx, finalHandler);

    expect(executionOrder).toEqual(['1:before', '2:before', 'network:call', '2:after', '1:after']);
  });

  it('should reject if next() is called multiple times', async () => {
    const pipeline = new Pipeline();
    const ctx = { request: {} } as XelusContext;

    pipeline.use({
      name: 'Bad Middleware',
      handler: async (_, next) => {
        await next();
        await next();
      },
    });

    await expect(pipeline.execute(ctx, async () => {})).rejects.toThrow(
      'next() called multiple times in middleware: Bad Middleware',
    );
  });

  it('should throw an error if an invalid middleware is provided', () => {
    const pipeline = new Pipeline();

    expect(() => {
      // @ts-expect-error Testing invalid input explicitly
      pipeline.use({ name: 'No Handler' });
    }).toThrow('Invalid Xelus middleware provided.');

    expect(() => {
      // @ts-expect-error Testing invalid input explicitly
      pipeline.use({ handler: async () => {} });
    }).toThrow('Invalid Xelus middleware provided.');
  });
});
