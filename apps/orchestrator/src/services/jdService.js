const { analyzeJobDescription } = require('../../../../services/jd-analyzer/src/analyzeJobDescription');
const { env } = require('../config/env');

async function analyzeJobDescriptionService(description) {
  if (!description || typeof description !== 'string') {
    const error = new Error('description is required and must be a string');
    error.statusCode = 400;
    throw error;
  }

  return analyzeJobDescription(description, {
    apiKey: env.openAiApiKey,
    model: env.openAiModel
  });
}

module.exports = {
  analyzeJobDescriptionService
};
