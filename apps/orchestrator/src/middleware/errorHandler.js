function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'NotFound',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'InternalServerError' : 'RequestError',
    message
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
