import { XelusError } from './XelusError.js';
import type { XelusRequestConfig } from '../types/index.js';

export class NetworkError extends XelusError {
  public readonly config: XelusRequestConfig;
  public readonly originalError?: Error;

  constructor(message: string, config: XelusRequestConfig, originalError?: Error) {
    super(message);
    this.config = config;

    if (originalError !== undefined) {
      this.originalError = originalError;
    }
  }
}
