const { generateTailoredResume } = require('../../../../services/resume-generator/src/generateTailoredResume');
const { env } = require('../config/env');

async function generateResumeService(input) {
  const jobDescription = input?.jobDescription || input?.job?.description;
  const userData = input?.userData || input?.masterResumeJson;

  if (!jobDescription || typeof jobDescription !== 'string') {
    const error = new Error('jobDescription is required (or job.description)');
    error.statusCode = 400;
    throw error;
  }

  if (!userData || typeof userData !== 'object' || Array.isArray(userData)) {
    const error = new Error('userData (master resume JSON object) is required');
    error.statusCode = 400;
    throw error;
  }

  return generateTailoredResume(userData, jobDescription, {
    apiKey: env.openAiApiKey,
    model: env.openAiModel
  });
}

module.exports = {
  generateResumeService
};
