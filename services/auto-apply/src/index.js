const path = require('path');
const { applyToJob } = require('./applyToJob');

module.exports = {
  applyToJob
};

if (require.main === module) {
  const jobUrl = process.env.JOB_URL;
  const applicantName = process.env.APPLICANT_NAME;
  const applicantEmail = process.env.APPLICANT_EMAIL;
  const resumePdfPath = process.env.RESUME_PDF_PATH;

  if (!jobUrl || !applicantName || !applicantEmail || !resumePdfPath) {
    console.error('Missing env vars: JOB_URL, APPLICANT_NAME, APPLICANT_EMAIL, RESUME_PDF_PATH');
    process.exit(1);
  }

  applyToJob({
    jobUrl,
    applicantName,
    applicantEmail,
    resumePdfPath: path.resolve(resumePdfPath),
    headless: process.env.HEADLESS !== 'false',
    delayMinMs: Number.parseInt(process.env.DELAY_MIN_MS || '600', 10),
    delayMaxMs: Number.parseInt(process.env.DELAY_MAX_MS || '1800', 10)
  })
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error(`Fatal error: ${error.message}`);
      process.exit(1);
    });
}
