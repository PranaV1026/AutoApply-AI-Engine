function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generic retry helper with linear backoff.
 * @template T
 * @param {() => Promise<T>} operation
 * @param {{ retries: number, delayMs: number, context?: string }} options
 * @returns {Promise<T>}
 */
async function withRetry(operation, options) {
  const retries = Math.max(0, options.retries || 0);
  const delayMs = Math.max(0, options.delayMs || 0);
  const context = options.context || 'operation';

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const isLast = attempt === retries;

      if (isLast) {
        break;
      }

      const backoff = delayMs * (attempt + 1);
      console.warn(`[retry] ${context} failed (attempt ${attempt + 1}/${retries + 1}): ${error.message}`);
      await sleep(backoff);
    }
  }

  throw new Error(`[retry] ${context} failed after ${retries + 1} attempts: ${lastError.message}`);
}

module.exports = {
  withRetry
};
