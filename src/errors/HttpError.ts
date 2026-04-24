import { XelusError } from './XelusError.js';
import type { XelusResponse, XelusRequestConfig } from '../types/index.js';

export class HttpError extends XelusError {
  public readonly status: number;
  public readonly response: XelusResponse;
  public readonly config: XelusRequestConfig;

  constructor(
    message: string,
    status: number,
    response: XelusResponse,
    config: XelusRequestConfig,
  ) {
    super(message);
    this.status = status;
    this.response = response;
    this.config = config;
  }
}
