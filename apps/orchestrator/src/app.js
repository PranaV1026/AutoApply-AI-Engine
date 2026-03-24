const express = require('express');
const { requestLogger } = require('./middleware/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(requestLogger);

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = {
  app
};
