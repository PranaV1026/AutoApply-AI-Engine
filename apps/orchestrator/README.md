# AutoApply Orchestrator API (Express)

Production-ready Express API server that orchestrates key AutoApply modules.

## Features
- Express.js server
- `dotenv` environment loading
- JSON body parsing
- Basic request logging middleware
- Modular routes
- Centralized error handling

## Implemented routes
- `POST /api/jobs/fetch`
  - Triggers LinkedIn scraper module
  - Returns jobs JSON
- `POST /api/jd/analyze`
  - Input: `{ description }`
  - Returns structured JD JSON
- `POST /api/resume/generate`
  - Input: `{ jobDescription, userData }` (or `{ job: { description }, masterResumeJson }`)
  - Returns tailored resume content JSON
- `POST /api/pdf/compile`
  - Input: `{ texPath }`
  - Returns PDF artifact paths
- `POST /api/apply`
  - Input: `{ jobUrl, resumePdfPath, applicantName?, applicantEmail? }`
  - Runs Playwright apply flow

## Run
```bash
cd apps/orchestrator
npm install
cp .env.example .env
npm run dev
```

Server starts on `PORT` (default `3000`).

## Example cURL
```bash
curl -X POST http://localhost:3000/api/jd/analyze \
  -H "Content-Type: application/json" \
  -d '{"description":"Looking for a Node.js engineer with AWS experience"}'
```

## Notes
- Routes call existing modules in `services/*` directly.
- Set `OPENAI_API_KEY` in `.env` for JD/resume routes.
