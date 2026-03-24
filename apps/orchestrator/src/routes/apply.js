const express = require('express');
const { applyService } = require('../services/applyService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const result = await applyService(req.body || {});

    if (!result.success) {
      return res.status(502).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
