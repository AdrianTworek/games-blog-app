export class AppError extends Error {
  status: string;
  isOperational: boolean;

  constructor(public statusCode: number, public message: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
