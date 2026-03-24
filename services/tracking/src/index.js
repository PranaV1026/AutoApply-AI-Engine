const { closePool } = require('./db');
const {
  insertApplication,
  updateApplicationStatus,
  fetchApplications,
  ALLOWED_STATUSES
} = require('./jobApplicationRepository');

module.exports = {
  insertApplication,
  updateApplicationStatus,
  fetchApplications,
  ALLOWED_STATUSES,
  closePool
};
