const express = require('express');
const { fetchJobs } = require('../services/jobsService');

const router = express.Router();

router.post('/fetch', async (req, res, next) => {
  try {
    const jobs = await fetchJobs(req.body || {});
    res.status(200).json({
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
