const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function parseIntOrDefault(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseIntOrDefault(process.env.PORT, 3000),
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  linkedinSearchUrl: process.env.LINKEDIN_SEARCH_URL || '',
  applicantName: process.env.APPLICANT_NAME || '',
  applicantEmail: process.env.APPLICANT_EMAIL || '',
  headless: process.env.HEADLESS !== 'false',
  delayMinMs: parseIntOrDefault(process.env.DELAY_MIN_MS, 600),
  delayMaxMs: parseIntOrDefault(process.env.DELAY_MAX_MS, 1800)
};

module.exports = {
  env
};
