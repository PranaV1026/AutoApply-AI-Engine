const express = require('express');
const { generateResumeService } = require('../services/resumeService');

const router = express.Router();

router.post('/generate', async (req, res, next) => {
  try {
    const result = await generateResumeService(req.body || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
