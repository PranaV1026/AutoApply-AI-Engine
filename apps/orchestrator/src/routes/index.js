const express = require('express');
const jobsRoutes = require('./jobs');
const jdRoutes = require('./jd');
const resumeRoutes = require('./resume');
const pdfRoutes = require('./pdf');
const applyRoutes = require('./apply');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'autoapply-orchestrator'
  });
});

router.use('/jobs', jobsRoutes);
router.use('/jd', jdRoutes);
router.use('/resume', resumeRoutes);
router.use('/pdf', pdfRoutes);
router.use('/apply', applyRoutes);

module.exports = router;
