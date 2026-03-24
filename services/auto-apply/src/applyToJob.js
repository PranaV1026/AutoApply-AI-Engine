const path = require('path');
const fs = require('fs/promises');
const { chromium } = require('playwright');
const { randomDelay } = require('./utils/randomDelay');
const logger = require('./utils/logger');

const DEFAULT_SELECTORS = {
  nameInput: 'input[name="name"], input[name="fullName"], #name',
  emailInput: 'input[type="email"], input[name="email"], #email',
  resumeInput: 'input[type="file"]',
  applyButton: 'button:has-text("Apply"), button:has-text("Submit"), button[type="submit"]'
};

async function ensureFileExists(filePath) {
  const resolved = path.resolve(filePath);
  try {
    await fs.access(resolved);
  } catch {
    throw new Error(`Resume file not found: ${resolved}`);
  }
  return resolved;
}

async function fillTextField(page, selector, value, label) {
  const field = page.locator(selector).first();
  await field.waitFor({ state: 'visible', timeout: 10_000 });
  await field.fill(value);
  logger.info(`Filled ${label}`);
}

async function uploadFile(page, selector, filePath) {
  const input = page.locator(selector).first();
  await input.waitFor({ state: 'attached', timeout: 10_000 });
  await input.setInputFiles(filePath);
  logger.info('Uploaded resume file');
}

async function clickApply(page, selector) {
  const button = page.locator(selector).first();
  await button.waitFor({ state: 'visible', timeout: 10_000 });
  await button.click();
  logger.info('Clicked apply button');
}

/**
 * Automates a basic job application flow.
 *
 * @param {{
 *  jobUrl: string,
 *  applicantName: string,
 *  applicantEmail: string,
 *  resumePdfPath: string,
 *  headless?: boolean,
 *  delayMinMs?: number,
 *  delayMaxMs?: number,
 *  selectors?: Partial<typeof DEFAULT_SELECTORS>
 * }} input
 */
async function applyToJob(input) {
  if (!input?.jobUrl || !input?.applicantName || !input?.applicantEmail || !input?.resumePdfPath) {
    throw new Error('Missing required fields: jobUrl, applicantName, applicantEmail, resumePdfPath');
  }

  const resolvedResumePath = await ensureFileExists(input.resumePdfPath);
  const selectors = {
    ...DEFAULT_SELECTORS,
    ...(input.selectors || {})
  };

  const delayMinMs = Number.isFinite(input.delayMinMs) ? input.delayMinMs : 600;
  const delayMaxMs = Number.isFinite(input.delayMaxMs) ? input.delayMaxMs : 1800;

  let browser;
  const startedAt = Date.now();

  try {
    logger.info('Launching browser...');
    browser = await chromium.launch({ headless: input.headless !== false });
    const context = await browser.newContext();
    const page = await context.newPage();

    logger.info('Opening job link...', { jobUrl: input.jobUrl });
    await page.goto(input.jobUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await randomDelay(delayMinMs, delayMaxMs);

    await fillTextField(page, selectors.nameInput, input.applicantName, 'name');
    await randomDelay(delayMinMs, delayMaxMs);

    await fillTextField(page, selectors.emailInput, input.applicantEmail, 'email');
    await randomDelay(delayMinMs, delayMaxMs);

    await uploadFile(page, selectors.resumeInput, resolvedResumePath);
    await randomDelay(delayMinMs, delayMaxMs);

    await clickApply(page, selectors.applyButton);

    const elapsedMs = Date.now() - startedAt;
    logger.info('Application flow completed', { elapsedMs });

    return {
      success: true,
      elapsedMs,
      jobUrl: input.jobUrl
    };
  } catch (error) {
    logger.error('Application flow failed', {
      message: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message,
      jobUrl: input.jobUrl
    };
  } finally {
    if (browser) {
      await browser.close();
      logger.info('Browser closed');
    }
  }
}

module.exports = {
  applyToJob,
  DEFAULT_SELECTORS
};
