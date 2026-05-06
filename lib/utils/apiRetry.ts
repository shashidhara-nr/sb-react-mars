export interface RetryOptions {
  maxRetries?: number;
  timeouts?: number[];
  onRetry?: (attempt: number, error: any) => void;
}

export async function retryWithTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 2,
    timeouts = [10000, 15000, 20000],
    onRetry,
  } = options;

  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const abortController = new AbortController();
    const currentTimeout = timeouts[attempt] || timeouts[timeouts.length - 1];

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, currentTimeout);

    try {
      const result = await fn(abortController.signal);
      clearTimeout(timeoutId);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      
      if (onRetry && attempt < maxRetries) {
        onRetry(attempt + 1, error);
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  throw lastError;
}

export function isTimeoutError(error: any): boolean {
  return (
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_CANCELED' ||
    error.name === 'CanceledError' ||
    error.name === 'AbortError' ||
    error.message?.includes('timeout') ||
    error.message?.includes('canceled')
  );
}

