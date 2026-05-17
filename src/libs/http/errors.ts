export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  UNKNOWN = 'UNKNOWN'
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public override readonly message: string,
    public readonly statusCode: number,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500
  }

  get isServerError(): boolean {
    return this.statusCode >= 500
  }

  get isAuthError(): boolean {
    return this.code === ErrorCode.UNAUTHORIZED || this.code === ErrorCode.FORBIDDEN
  }
}

const STATUS_TO_ERROR_CODE: Record<number, ErrorCode> = {
  400: ErrorCode.VALIDATION_ERROR,
  401: ErrorCode.UNAUTHORIZED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  409: ErrorCode.CONFLICT,
  422: ErrorCode.VALIDATION_ERROR,
  429: ErrorCode.RATE_LIMITED,
  500: ErrorCode.SERVER_ERROR,
  502: ErrorCode.SERVER_ERROR,
  503: ErrorCode.SERVER_ERROR,
  504: ErrorCode.SERVER_ERROR
}

export function httpStatusToErrorCode(status: number): ErrorCode {
  return STATUS_TO_ERROR_CODE[status] ?? (status >= 500 ? ErrorCode.SERVER_ERROR : ErrorCode.UNKNOWN)
}

export function createAppError(status: number, message: string, context?: Record<string, unknown>): AppError {
  return new AppError(httpStatusToErrorCode(status), message, status, context)
}
