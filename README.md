# AutoApply AI Engine

## Repository Scaffold

The complete production-ready folder scaffold is now present in the repository.
See `docs/architecture/FOLDER_STRUCTURE.md` for the full tree and folder-by-folder explanation.

Production-grade system to scrape jobs, analyze fit, generate tailored application documents, and optionally automate application submission.

## 1) High-Level Architecture

```text
[Scheduler / Trigger]
        |
        v
[Ingestion Workflows (n8n)] ---> [Job Source Connectors]
        |                                |
        |                                +--> LinkedIn Scraper (Playwright)
        |                                +--> Naukri Scraper (Playwright)
        v
[Normalization + Dedup Service (Node.js)]
        |
        v
[Job Intelligence Service (AI JD Analyzer)]
        |
        +--> [Resume Tailoring Service (LaTeX + AI)] ---> [PDF Compiler Service]
        |
        +--> [Cover Letter Service (AI)]
        v
[Application Orchestrator]
        |
        +--> Optional [Auto-Apply Bot (Playwright)]
        v
[Tracking + Analytics (PostgreSQL + API)]
```

## 2) Suggested Folder Structure

```text
autoapply-ai-engine/
  apps/
    orchestrator/                  # Node.js service coordinating end-to-end pipeline
    worker/                        # Background workers for AI + document generation jobs
  workflows/
    n8n/
      job_ingestion.json           # n8n workflow exports
      application_pipeline.json
  services/
    scraper/
      linkedin/
      naukri/
    jd-analyzer/
    resume-generator/
      templates/
      latex/
    cover-letter-generator/
    pdf-compiler/
    auto-apply/
  packages/
    shared-types/
    shared-utils/
    prompt-library/
  infra/
    docker/
    db/
      migrations/
      schema/
      seeds/
    observability/
  docs/
    architecture.md
    api-spec.md
    runbooks/
  tests/
    unit/
    integration/
    e2e/
  .env.example
  docker-compose.yml
  README.md
```

## 3) Module Breakdown

## 3.1 Ingestion Module (LinkedIn, Naukri)
**Responsibilities**
- Trigger source-specific scraping runs (via n8n schedule/manual event).
- Scrape search results + job detail pages.
- Handle pagination, retries, anti-bot delays, and checkpointing.
- Emit raw job events to processing queue.

**Key components**
- `LinkedInScraper` (Playwright)
- `NaukriScraper` (Playwright)
- `ScrapeSessionManager` (cookies, auth state, proxy config)
- `JobRawStore` (optional blob/json archival)

**Output contract**
- Normalized `RawJobEvent` payload with source metadata and scrape timestamp.

## 3.2 Job Normalization + Dedup Module
**Responsibilities**
- Convert source-specific formats into canonical `JobPosting` schema.
- Deduplicate by stable keys (external ID, URL hash, company+title+location+posted date heuristic).
- Enrich with derived fields (seniority, remote type, salary signals).

**Output**
- `JobPosting` rows in PostgreSQL.
- `JobReadyForAnalysis` event.

## 3.3 JD Analysis Module (AI)
**Responsibilities**
- Parse JD into structured requirements:
  - hard skills, soft skills, years of experience
  - domain keywords
  - mandatory vs optional requirements
- Compute candidate-fit score against master profile.
- Extract tailoring instructions for resume + cover letter.

**Implementation notes**
- Prompt templates in `packages/prompt-library`.
- Strong JSON schema validation on model responses.
- Retry + fallback model strategy.

**Output**
- `JobAnalysis` record with score/rationale/keyword map.

## 3.4 Resume Tailoring Module (LaTeX)
**Responsibilities**
- Select best bullet points/projects from candidate master data.
- Rewrite bullets to align with JD keywords without fabricating facts.
- Generate `.tex` from reusable templates.

**Key components**
- `ResumeContentSelector`
- `ResumeBulletRewriter`
- `LatexRenderer`
- `TemplateVersionManager`

**Output**
- Versioned `.tex` resume artifact + metadata.

## 3.5 Cover Letter Generation Module
**Responsibilities**
- Generate concise, role-specific cover letters from approved facts.
- Enforce style constraints (tone, length, no hallucinated claims).

**Output**
- Markdown/plaintext + optional `.tex` cover letter artifact.

## 3.6 PDF Compilation Module
**Responsibilities**
- Compile LaTeX to PDF in isolated worker container.
- Capture compile logs and fail fast on template errors.
- Store artifacts in object storage/local artifacts path.

**Output**
- Resume PDF URL/path.
- Compile status + diagnostics.

## 3.7 Auto-Apply Module (Optional)
**Responsibilities**
- Execute source-specific apply flows with Playwright.
- Upload resume, fill forms, handle screening questions using policy rules.
- Keep safe mode (dry run) and human-in-the-loop checkpoints.

**Safety controls**
- Rate limiting and max applications/day.
- Explicit allowlist filters (companies, locations, salary range).
- Blocklist for sensitive employers/roles.

## 3.8 Application Tracking Module (PostgreSQL)
**Responsibilities**
- Persist full lifecycle:
  - scraped -> analyzed -> docs generated -> applied -> response -> interview/rejected/offer
- Store artifacts and audit logs.
- Expose query API for dashboard/reporting.

**Core tables**
- `jobs`
- `job_analysis`
- `resume_versions`
- `cover_letters`
- `applications`
- `application_events`
- `automation_runs`

## 3.9 Orchestration Module (n8n + Node.js)
**Responsibilities**
- n8n handles triggers, scheduling, and cross-service glue.
- Node.js services own business logic, validation, and idempotent operations.
- Queue-based execution for heavy/async tasks.

**Recommended workflow stages**
1. Ingest jobs.
2. Normalize + dedup.
3. Analyze JD.
4. Generate docs.
5. Compile PDF.
6. (Optional) auto-apply.
7. Update tracking + notifications.

## 4) Data Contracts (Minimal v1)

```ts
interface JobPosting {
  id: string;
  source: 'linkedin' | 'naukri';
  sourceJobId: string;
  url: string;
  title: string;
  company: string;
  location: string;
  description: string;
  postedAt?: string;
  scrapedAt: string;
}

interface JobAnalysis {
  jobId: string;
  fitScore: number; // 0-100
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  missingSkills: string[];
  tailoringGuidance: string[];
  modelVersion: string;
}
```

## 5) Development Plan (Phased)

## Phase 0: Foundation (Week 1)
- Bootstrap monorepo structure and coding standards.
- Setup PostgreSQL + migrations + seed profile data.
- Setup logging, config management, error handling conventions.
- Create CI pipeline (lint, test, build).

**Exit criteria**
- Services run locally via `docker-compose`.
- Health checks + DB connectivity verified.

## Phase 1: Job Ingestion MVP (Week 2)
- Implement LinkedIn and Naukri basic scraper flows (search + details).
- Add normalization + dedup.
- Persist jobs in DB.
- Create n8n scheduled workflow.

**Exit criteria**
- System ingests and stores jobs on schedule with <5% duplicate rate.

## Phase 2: AI JD Analysis (Week 3)
- Implement prompt templates and schema-validated AI output.
- Store analysis and fit score.
- Add thresholds for shortlist filtering.

**Exit criteria**
- 95%+ analysis responses pass schema validation.

## Phase 3: Resume + Cover Letter Generation (Week 4)
- Build tailored resume pipeline from master profile.
- Build cover letter generation with guardrails.
- Add artifact versioning in DB.

**Exit criteria**
- Generated documents available for shortlisted jobs.

## Phase 4: PDF Compilation + Quality Gate (Week 5)
- Add LaTeX compile container worker.
- Capture compile errors and implement auto-retry.
- Add quality checks (missing sections, page length limits).

**Exit criteria**
- 98%+ resume compile success on test set.

## Phase 5: Optional Auto-Apply (Week 6)
- Implement guarded application flows for one source first.
- Add dry-run + approval gates.
- Add daily limits and safety rules.

**Exit criteria**
- Successful controlled auto-apply runs with complete audit logs.

## Phase 6: Hardening + Observability (Week 7)
- Add metrics (success/failure by stage, latency, cost per application).
- Add alerting + runbooks.
- Load and resilience testing.

**Exit criteria**
- Stable 24h run in staging with alert coverage.

## 6) Non-Functional Requirements
- **Reliability:** idempotent jobs, retry with exponential backoff, dead-letter queue.
- **Security:** encrypted secrets, PII minimization, strict access controls.
- **Compliance:** respect platform terms and rate limits.
- **Scalability:** queue-based workers, horizontal scaling for scraping/AI tasks.
- **Observability:** structured logs, traces, per-job correlation IDs.

## 7) v1 Priorities (Simple First)
1. LinkedIn + Naukri ingestion (basic stable selectors).
2. JD analysis with one AI model + strict schema checks.
3. One LaTeX resume template + PDF compile.
4. Tracking DB + simple dashboard API.
5. Keep auto-apply behind feature flag until confidence is high.

---

If you want, next I can generate:
1) The initial PostgreSQL schema (`sql` migrations),
2) TypeScript interfaces + service contracts,
3) A first n8n workflow JSON for the ingestion pipeline.
