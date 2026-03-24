const { LinkedInScraper } = require('../../../../services/scraper/linkedin/src/scraper');
const { saveJson } = require('../../../../services/scraper/linkedin/src/utils/file');
const { env } = require('../config/env');

async function fetchJobs(input = {}) {
  const searchUrl = input.searchUrl || env.linkedinSearchUrl;

  if (!searchUrl) {
    const error = new Error('searchUrl is required (request body or LINKEDIN_SEARCH_URL env)');
    error.statusCode = 400;
    throw error;
  }

  const scraper = new LinkedInScraper({
    searchUrl,
    headless: input.headless ?? env.headless,
    maxJobs: Number.isFinite(input.maxJobs) ? input.maxJobs : 20,
    timeoutMs: Number.isFinite(input.timeoutMs) ? input.timeoutMs : 30_000,
    maxRetries: Number.isFinite(input.maxRetries) ? input.maxRetries : 3,
    retryDelayMs: Number.isFinite(input.retryDelayMs) ? input.retryDelayMs : 1_500
  });

  try {
    await scraper.init();
    const jobs = await scraper.scrapeJobs();

    if (input.outputPath) {
      await saveJson(input.outputPath, jobs);
    }

    return jobs;
  } finally {
    await scraper.close();
  }
}

module.exports = {
  fetchJobs
};
