const { loadConfig } = require('./config');
const { saveJson } = require('./utils/file');
const { LinkedInScraper } = require('./scraper');

async function main() {
  const config = loadConfig();
  const scraper = new LinkedInScraper(config);

  try {
    console.log('[linkedin] Initializing browser...');
    await scraper.init();

    console.log('[linkedin] Scraping jobs...');
    const jobs = await scraper.scrapeJobs();

    await saveJson(config.outputPath, jobs);
    console.log(`[linkedin] Done. Saved ${jobs.length} jobs to ${config.outputPath}`);
  } catch (error) {
    console.error(`[linkedin] Scrape failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await scraper.close();
  }
}

main();
