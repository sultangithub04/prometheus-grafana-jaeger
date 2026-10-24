
const app = require('./app');
const logger = require('./logger');
const {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  activeRequests,
} = require('./metrics');

const PORT = process.env.PORT || 3000;

app.get('/metrics', async (req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    next(error);
  }
});
app.get('/health', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});

function shutdown(signal) {
  logger.info({ signal }, 'Shutting down server');

  server.close((err) => {
    if (err) {
      logger.error(err, 'Server shutdown failed');
      process.exitCode = 1;
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
