const express = require('express');
const { compilePdfService } = require('../services/pdfService');

const router = express.Router();

router.post('/compile', async (req, res, next) => {
  try {
    const result = await compilePdfService(req.body || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
