# LinkedIn Job Scraper (Node.js + Playwright)

Basic scraper that collects:
- Job title
- Company
- Job description
- Apply link

Results are saved as JSON.

## Prerequisites
- Node.js 20+
- npm 10+

## Setup
```bash
cd services/scraper/linkedin
npm install
npx playwright install chromium
cp .env.example .env
```

## Run
```bash
LINKEDIN_SEARCH_URL="https://www.linkedin.com/jobs/search/?keywords=software%20engineer" \
OUTPUT_PATH="./output/linkedin_jobs.json" \
npm run scrape
```

Or run using env file variables exported in your shell.

## Output
A JSON file (default: `./linkedin_jobs.json`) containing records like:

```json
[
  {
    "title": "Software Engineer",
    "company": "Example Inc",
    "description": "...",
    "applyLink": "https://...",
    "source": "linkedin",
    "scrapedAt": "2026-03-24T12:00:00.000Z"
  }
]
```

## Notes
- LinkedIn HTML selectors can change; keep selectors in `src/scraper.js` updated as needed.
- This is a basic implementation and may require authenticated browsing or proxy strategy for high-volume runs.
