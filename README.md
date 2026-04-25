# Xelus

> A highly extensible, plugin-driven TypeScript SDK core for building resilient API clients.

[![CI](https://github.com/Torkovwryy/xelus/actions/workflows/CI.yml/badge.svg)](https://github.com/Torkovwryy/xelus/actions/workflows/CI.yml)
[![npm version](https://img.shields.io/npm/v/xelus)](https://img.shields.io/npm/v/xelus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Xelus** is not just another HTTP client. It is a strictly-typed, dependency-free core designed specifically for building robust, production-grade SDKs. It uses an Onion Architecture (Middleware Pipeline) that allows you to intercept, modify, and retry requests with absolute control.

## Why Xelus?

- **Zero Dependencies:** Built on top of the native `Fetch API`.
- **Plugin-Driven:** Everything is a middleware. Inject auth, retries, and telemetry easily.
- **Strictly Typed:** First-class TypeScript support with advanced generic inference.
- **Error Normalization:** Consistent `HttpError` and `NetworkError` classes for predictable `try/catch` blocks.
- **Edge Ready:** Runs perfectly in Node.js 20+, Cloudflare Workers, and modern browsers.

## Installation

```bash
yarn add @tarkov/xelus
# or
npm install @tarkov/xelus
# or
pnpm add @tarkov/xelus
```

## Quick Start
```ts
import { Xelus } from '@tarkov/xelus'

// 1. Initialize the Core
const api = new Xelus({
  baseURL: 'https://api.example.com/v1',
  timout: 5000,
});

// 2. Make strongly-typed requests
interface User {
  id: string;
  name: string;
}

async function fetchUser() {
  try {
    const response = await api.get<User>('/user/123');
    console.log(response.data.name);
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}
```

## Advanced Usage: The Middleware Pipeline

Xelus is built to be extended. You can intercept requests and responses using Middlewares.

```ts
import { Xelus, XelusContext, XelusNext } from 'xelus';

const sdk = new Xelus({ baseURL: 'https://api.example.com' });

// Add a custom Authorization Middleware
sdk.use({
  name: 'AuthMiddleware',
  handler: async (ctx: XelusContext, next: XelusNext) => {
    // Intercept Request (Downstream)
    ctx.request.headers = {
      ...ctx.request.headers,
      Authorization: `Bearer my-secret-token`,
    };

    const start = Date.now();

    // Pass control to the next middleware / network adapter
    await next();

    // Intercept Response (Upstream)
    const ms = Date.now() - start;
    console.log(`[${ctx.request.method}] ${ctx.request.url} - ${ctx.response?.status} (${ms}ms)`);
  }
});
```

## License

MIT © Torkovwryy
