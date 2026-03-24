const { query } = require('./db');

const ALLOWED_STATUSES = new Set([
  'saved',
  'ready_to_apply',
  'applied',
  'in_review',
  'interview',
  'rejected',
  'offer'
]);

function assertRequiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} is required and must be a non-empty string`);
  }
}

function normalizeScore(score) {
  const parsed = Number(score);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error('score must be a number between 0 and 100');
  }
  return Number(parsed.toFixed(2));
}

function normalizeStatus(status) {
  assertRequiredString(status, 'status');
  const normalized = status.trim().toLowerCase();
  if (!ALLOWED_STATUSES.has(normalized)) {
    throw new Error(`status must be one of: ${[...ALLOWED_STATUSES].join(', ')}`);
  }
  return normalized;
}

/**
 * Insert application tracking record.
 * @param {{company: string, role: string, score: number, status: string, resumePath: string, appliedAt?: string|Date|null}} input
 */
async function insertApplication(input) {
  assertRequiredString(input?.company, 'company');
  assertRequiredString(input?.role, 'role');
  assertRequiredString(input?.resumePath, 'resumePath');

  const score = normalizeScore(input.score);
  const status = normalizeStatus(input.status);
  const appliedAt = input.appliedAt ? new Date(input.appliedAt) : null;

  if (appliedAt && Number.isNaN(appliedAt.getTime())) {
    throw new Error('appliedAt must be a valid date/time if provided');
  }

  const sql = `
    INSERT INTO job_applications (company, role, score, status, resume_path, applied_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, company, role, score, status, resume_path AS "resumePath", applied_at AS "appliedAt", created_at AS "createdAt", updated_at AS "updatedAt"
  `;

  const params = [
    input.company.trim(),
    input.role.trim(),
    score,
    status,
    input.resumePath.trim(),
    appliedAt
  ];

  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Update application status.
 * @param {number|string} id
 * @param {string} status
 */
async function updateApplicationStatus(id, status) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('id must be a positive integer');
  }

  const normalizedStatus = normalizeStatus(status);

  const sql = `
    UPDATE job_applications
    SET status = $2
    WHERE id = $1
    RETURNING id, company, role, score, status, resume_path AS "resumePath", applied_at AS "appliedAt", created_at AS "createdAt", updated_at AS "updatedAt"
  `;

  const result = await query(sql, [numericId, normalizedStatus]);
  return result.rows[0] || null;
}

/**
 * Fetch application rows with optional filters.
 * @param {{status?: string, company?: string, limit?: number, offset?: number}} [filters]
 */
async function fetchApplications(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.status) {
    params.push(normalizeStatus(filters.status));
    clauses.push(`status = $${params.length}`);
  }

  if (filters.company) {
    assertRequiredString(filters.company, 'company');
    params.push(filters.company.trim());
    clauses.push(`company ILIKE $${params.length}`);
  }

  const limit = Number.isInteger(filters.limit) ? Math.min(Math.max(filters.limit, 1), 200) : 50;
  const offset = Number.isInteger(filters.offset) ? Math.max(filters.offset, 0) : 0;

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  const sql = `
    SELECT id, company, role, score, status, resume_path AS "resumePath", applied_at AS "appliedAt", created_at AS "createdAt", updated_at AS "updatedAt"
    FROM job_applications
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ${limitParam}
    OFFSET ${offsetParam}
  `;

  const result = await query(sql, params);
  return result.rows;
}

module.exports = {
  insertApplication,
  updateApplicationStatus,
  fetchApplications,
  ALLOWED_STATUSES
};
