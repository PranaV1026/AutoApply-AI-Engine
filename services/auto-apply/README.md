# Auto Apply (Playwright)

Modular Playwright automation script for basic job application flow.

## Features
- Open job link
- Fill name and email
- Upload resume PDF
- Click apply
- Random delays to mimic human timing
- Structured logging
- Error handling with success/error response

## Install
```bash
cd services/auto-apply
npm install
npx playwright install chromium
```

## Configure
Set environment variables (or copy from `.env.example`):

- `JOB_URL`
- `APPLICANT_NAME`
- `APPLICANT_EMAIL`
- `RESUME_PDF_PATH`
- Optional: `HEADLESS`, `DELAY_MIN_MS`, `DELAY_MAX_MS`

## Run
```bash
cd services/auto-apply
JOB_URL="https://example.com/job/123" \
APPLICANT_NAME="Alex Doe" \
APPLICANT_EMAIL="alex@example.com" \
RESUME_PDF_PATH="../resume-generator/output/resume.pdf" \
npm run apply
```

## Output
Success:
```json
{
  "success": true,
  "elapsedMs": 5234,
  "jobUrl": "https://example.com/job/123"
}
```

Failure:
```json
{
  "success": false,
  "error": "...",
  "jobUrl": "https://example.com/job/123"
}
```

## Notes
- Selectors are centralized in `DEFAULT_SELECTORS` in `src/applyToJob.js` for easy customization.
- For specific job sites, pass custom selectors by extending the module call in code.
