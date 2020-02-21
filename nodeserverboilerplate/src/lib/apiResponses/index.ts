import { getStatusText } from 'http-status-codes';
import { ApiResponse } from '../../interfaces';

/**
 * Sends an error as response: it contains the error code and the title of the code. It has no data, and optionally
 * a message
 */
export function error(e: number, message?: string): ApiResponse<null> {
  return {
    error: e,
    errorTitle: getStatusText(e),
    message: typeof message === 'string' ? message : null,
    data: null,
  };
}

/**
 * Sends data as a response (in case the api request was successful). The error code is 0, it has no error title,
 * no message, and anything as data
 */
export function data<T>(d: T): ApiResponse<T> {
  return {
    error: null,
    errorTitle: null,
    message: null,
    data: d,
  };
}
