# AutoApply AI Engine - Folder Structure

This structure is organized for scale, clear ownership boundaries, and easy onboarding.

## Tree

```text
autoapply-ai-engine/
├── apps/
│   ├── orchestrator/
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── jobs/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   └── workers/
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   └── worker/
│       ├── src/
│       │   ├── jobs/
│       │   ├── processors/
│       │   ├── queues/
│       │   └── utils/
│       └── tests/
│           ├── unit/
│           └── integration/
├── workflows/
│   └── n8n/
│       ├── exports/
│       ├── nodes/
│       ├── credentials/
│       └── templates/
├── services/
│   ├── scraper/
│   │   ├── linkedin/
│   │   ├── naukri/
│   │   └── common/
│   ├── jd-analyzer/
│   │   ├── prompts/
│   │   ├── schemas/
│   │   └── evaluators/
│   ├── resume-generator/
│   │   ├── templates/
│   │   │   ├── base/
│   │   │   ├── software/
│   │   │   ├── data/
│   │   │   └── product/
│   │   ├── latex/
│   │   │   ├── partials/
│   │   │   └── styles/
│   │   └── renderers/
│   ├── cover-letter-generator/
│   │   ├── prompts/
│   │   └── templates/
│   ├── pdf-compiler/
│   │   ├── docker/
│   │   ├── scripts/
│   │   └── fonts/
│   └── auto-apply/
│       ├── playwright/
│       │   ├── fixtures/
│       │   ├── pages/
│       │   └── flows/
│       └── policies/
├── packages/
│   ├── shared-types/
│   │   └── src/
│   ├── shared-utils/
│   │   └── src/
│   ├── prompt-library/
│   │   ├── jd_analysis/
│   │   ├── resume_rewrite/
│   │   └── cover_letter/
│   ├── config/
│   │   └── src/
│   └── logger/
│       └── src/
├── infra/
│   ├── docker/
│   │   ├── local/
│   │   └── prod/
│   ├── k8s/
│   │   ├── base/
│   │   └── overlays/
│   │       ├── dev/
│   │       └── prod/
│   ├── db/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── schema/
│   └── observability/
│       ├── grafana/
│       ├── prometheus/
│       └── otel/
├── database/
│   ├── postgres/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   ├── functions/
│   │   └── views/
│   ├── backups/
│   └── scripts/
├── automation/
│   ├── scripts/
│   │   ├── bootstrap/
│   │   ├── deploy/
│   │   └── maintenance/
│   ├── ci/
│   ├── playwright/
│   └── load-tests/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── runbooks/
│   ├── adr/
│   └── onboarding/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
└── .github/
    └── workflows/
```

## Folder purpose

### `apps/`
- Deployable runtime services.
- `orchestrator`: Owns API endpoints, job coordination, and pipeline state transitions.
- `worker`: Processes async tasks (AI analysis, generation, compilation, automation jobs).

### `workflows/n8n/`
- n8n workflow exports, reusable node fragments, and workflow templates.
- Keeps automation definitions version-controlled and environment-portable.

### `services/`
- Domain-level business modules, each independently testable.
- `scraper/`: LinkedIn and Naukri adapters + shared scraping primitives.
- `jd-analyzer/`: Prompting, schema validation, and fit scoring.
- `resume-generator/`: Resume template management + LaTeX render pipeline.
- `cover-letter-generator/`: Prompt + style-specific generation.
- `pdf-compiler/`: Isolated PDF build environment and scripts.
- `auto-apply/`: Playwright application flows and policy checks.

### `packages/`
- Shared libraries to avoid duplication and enforce contracts.
- `shared-types` for DTOs/interfaces, `shared-utils` for helpers.
- `prompt-library` for reusable prompt templates/versioning.
- `config` centralizes env parsing and typed config.
- `logger` standardizes structured logging.

### `infra/`
- Environment and deployment definitions.
- Docker build contexts, Kubernetes manifests, DB bootstrapping, and observability setup.

### `database/`
- Database artifacts managed directly by backend/database teams.
- SQL migrations, views/functions, backup procedures, and operational scripts.

### `automation/`
- Operational scripts and CI-oriented helpers.
- Bootstrap/setup, deployments, maintenance tasks, and load/performance harnesses.

### `docs/`
- Architecture docs, API contracts, runbooks, ADRs, and onboarding materials.

### `tests/`
- Cross-service testing strategy: unit, integration, and end-to-end suites with shared fixtures.

### `.github/workflows/`
- CI/CD pipelines (lint, test, build, artifact generation, deployment gates).

## Best-practice notes
- Keep all business logic in `services/` and use `apps/` as composition layers.
- Keep workflow definitions (`n8n`) and automation scripts versioned with code.
- Prefer shared packages for contracts/config/logging to prevent service drift.
- Store DB migrations in source control and enforce forward-only migration discipline.
- Separate infra from app code to support multi-environment deployment safely.
