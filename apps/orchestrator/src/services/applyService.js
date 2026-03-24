const { applyToJob } = require('../../../../services/auto-apply/src/applyToJob');
const { env } = require('../config/env');

async function applyService(input) {
  const jobUrl = input?.jobUrl;
  const resumePdfPath = input?.resumePdfPath;
  const applicantName = input?.applicantName || env.applicantName;
  const applicantEmail = input?.applicantEmail || env.applicantEmail;

  if (!jobUrl || typeof jobUrl !== 'string') {
    const error = new Error('jobUrl is required');
    error.statusCode = 400;
    throw error;
  }

  if (!resumePdfPath || typeof resumePdfPath !== 'string') {
    const error = new Error('resumePdfPath is required');
    error.statusCode = 400;
    throw error;
  }

  if (!applicantName || !applicantEmail) {
    const error = new Error('applicantName and applicantEmail are required (body or env)');
    error.statusCode = 400;
    throw error;
  }

  return applyToJob({
    jobUrl,
    resumePdfPath,
    applicantName,
    applicantEmail,
    headless: input.headless ?? env.headless,
    delayMinMs: Number.isFinite(input.delayMinMs) ? input.delayMinMs : env.delayMinMs,
    delayMaxMs: Number.isFinite(input.delayMaxMs) ? input.delayMaxMs : env.delayMaxMs,
    selectors: input.selectors
  });
}

module.exports = {
  applyService
};
