export class DomainError<T> extends Error {
  public readonly statusCode: number;
  public readonly details?: T;

  constructor(message: string, statusCode: number = 400, details?: T) {
    super(message);
    this.name = "DomainError";
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
