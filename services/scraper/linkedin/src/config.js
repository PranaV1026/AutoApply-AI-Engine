const path = require('path');

function parseNumber(value, defaultValue) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function loadConfig() {
  const searchUrl = process.env.LINKEDIN_SEARCH_URL;

  if (!searchUrl) {
    throw new Error('Missing required env var: LINKEDIN_SEARCH_URL');
  }

  return {
    searchUrl,
    headless: process.env.HEADLESS !== 'false',
    maxJobs: parseNumber(process.env.MAX_JOBS, 20),
    timeoutMs: parseNumber(process.env.TIMEOUT_MS, 30_000),
    maxRetries: parseNumber(process.env.MAX_RETRIES, 3),
    retryDelayMs: parseNumber(process.env.RETRY_DELAY_MS, 1_500),
    outputPath: process.env.OUTPUT_PATH || path.resolve(process.cwd(), 'linkedin_jobs.json')
  };
}

module.exports = {
  loadConfig
};
