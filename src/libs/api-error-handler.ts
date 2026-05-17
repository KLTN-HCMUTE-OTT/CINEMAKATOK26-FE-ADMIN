import { AxiosError } from 'axios'

import { AppError, ErrorCode, httpStatusToErrorCode } from '@/libs/http/errors'

export interface ApiErrorResponse {
  statusCode: number
  message: string
  error?: string
}

export class ApiError extends AppError {
  response?: ApiErrorResponse

  constructor(error: AxiosError<ApiErrorResponse>) {
    const status = error.response?.status || 500
    const message = error.response?.data?.message || error.message || 'Unknown error occurred'

    super(httpStatusToErrorCode(status), message, status)
    this.name = 'ApiError'
    this.response = error.response?.data
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    return new ApiError(error)
  }

  if (error instanceof AppError) {
    const apiError = new ApiError({
      message: error.message,
      response: { status: error.statusCode, data: { statusCode: error.statusCode, message: error.message } }
    } as AxiosError<ApiErrorResponse>)

    return apiError
  }

  return new ApiError({
    message: 'Unknown error occurred',
    response: {
      status: 500,
      data: {
        statusCode: 500,
        message: 'Unknown error occurred'
      }
    }
  } as AxiosError<ApiErrorResponse>)
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message
  }

  const apiError = handleApiError(error)

  return apiError.response?.message || apiError.message || 'An error occurred'
}

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.code === ErrorCode.NETWORK_ERROR
  }

  return error instanceof AxiosError && !error.response
}
