export class XelusError extends Error {
  public readonly name: string;
  public readonly isXelusError: boolean;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.isXelusError = true;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
