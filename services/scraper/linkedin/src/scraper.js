const { chromium } = require('playwright');
const { withRetry } = require('./utils/retry');

/**
 * LinkedIn basic scraper (public/easy-apply list pages).
 * Note: selectors can change over time; keep this module isolated for easy updates.
 */
class LinkedInScraper {
  /**
   * @param {{ searchUrl: string, headless: boolean, maxJobs: number, timeoutMs: number, maxRetries: number, retryDelayMs: number }} config
   */
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init() {
    this.browser = await chromium.launch({ headless: this.config.headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.config.timeoutMs);
  }

  async close() {
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeJobs() {
    const jobs = await withRetry(
      async () => {
        await this.page.goto(this.config.searchUrl, {
          waitUntil: 'domcontentloaded'
        });

        await this.scrollResults();
        return this.extractJobsFromList();
      },
      {
        retries: this.config.maxRetries,
        delayMs: this.config.retryDelayMs,
        context: 'LinkedIn scrapeJobs'
      }
    );

    return jobs.slice(0, this.config.maxJobs);
  }

  async scrollResults() {
    const maxScrolls = 6;

    for (let i = 0; i < maxScrolls; i += 1) {
      await this.page.mouse.wheel(0, 3000);
      await this.page.waitForTimeout(800);
    }
  }

  async extractJobsFromList() {
    const cardSelector = 'ul.jobs-search__results-list li';
    const fallbackCardSelector = '.jobs-search-results__list-item';

    const selectorToUse = (await this.page.locator(cardSelector).count()) > 0
      ? cardSelector
      : fallbackCardSelector;

    const cards = this.page.locator(selectorToUse);
    const count = await cards.count();
    const limit = Math.min(count, this.config.maxJobs);

    const items = [];

    for (let i = 0; i < limit; i += 1) {
      const card = cards.nth(i);

      try {
        await card.scrollIntoViewIfNeeded();
        await card.click({ timeout: 5_000 });
      } catch (error) {
        console.warn(`[linkedin] Unable to click job card ${i + 1}: ${error.message}`);
      }

      await this.page.waitForTimeout(700);

      const job = await this.extractSingleJob(card);
      if (job.title || job.company || job.description || job.applyLink) {
        items.push(job);
      }
    }

    return items;
  }

  async extractSingleJob(card) {
    const safeText = async (locator) => {
      try {
        const value = await locator.first().textContent();
        return value ? value.trim() : '';
      } catch {
        return '';
      }
    };

    const safeHref = async (locator) => {
      try {
        const value = await locator.first().getAttribute('href');
        return value ? value.trim() : '';
      } catch {
        return '';
      }
    };

    // Extract from card first.
    let title = await safeText(card.locator('h3.base-search-card__title, h3.job-search-card__title'));
    let company = await safeText(card.locator('h4.base-search-card__subtitle, a.hidden-nested-link'));
    let applyLink = await safeHref(card.locator('a.base-card__full-link, a.base-search-card__full-link'));

    // Extract detail-pane description if available.
    const description = await safeText(
      this.page.locator(
        '.show-more-less-html__markup, .jobs-description__content, .jobs-box__html-content'
      )
    );

    // Fallback to detail pane title/company when card values are empty.
    if (!title) {
      title = await safeText(this.page.locator('h2.top-card-layout__title, h1.top-card-layout__title'));
    }

    if (!company) {
      company = await safeText(this.page.locator('a.topcard__org-name-link, span.topcard__flavor'));
    }

    if (!applyLink) {
      applyLink = await safeHref(this.page.locator('a.topcard__link, a.apply-button'));
    }

    return {
      title,
      company,
      description,
      applyLink,
      source: 'linkedin',
      scrapedAt: new Date().toISOString()
    };
  }
}

module.exports = {
  LinkedInScraper
};
