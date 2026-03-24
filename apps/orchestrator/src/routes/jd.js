const express = require('express');
const { analyzeJobDescriptionService } = require('../services/jdService');

const router = express.Router();

router.post('/analyze', async (req, res, next) => {
  try {
    const description = req.body?.description;
    const analysis = await analyzeJobDescriptionService(description);
    res.status(200).json(analysis);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
