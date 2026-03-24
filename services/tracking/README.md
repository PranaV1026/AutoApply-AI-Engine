# Tracking Service (PostgreSQL)

Schema + Node.js repository functions for tracking job applications.

## Table fields
- `company`
- `role`
- `score`
- `status`
- `resume_path`
- `applied_at`

Plus metadata:
- `id`, `created_at`, `updated_at`

## Schema files
- `database/postgres/schema/job_applications.sql`
- `database/postgres/migrations/001_create_job_applications.sql`

## Setup
1. Run migration SQL against your PostgreSQL DB.
2. Set `DATABASE_URL`.
3. Install dependencies:

```bash
cd services/tracking
npm install
```

## API
```js
const {
  insertApplication,
  updateApplicationStatus,
  fetchApplications,
  closePool
} = require('./src');

// Insert
const inserted = await insertApplication({
  company: 'Acme Corp',
  role: 'Backend Engineer',
  score: 82.5,
  status: 'applied',
  resumePath: '/artifacts/resume.pdf',
  appliedAt: new Date().toISOString()
});

// Update status
const updated = await updateApplicationStatus(inserted.id, 'interview');

// Fetch
const rows = await fetchApplications({ status: 'interview', limit: 20 });

await closePool();
```

## Allowed statuses
`saved`, `ready_to_apply`, `applied`, `in_review`, `interview`, `rejected`, `offer`
