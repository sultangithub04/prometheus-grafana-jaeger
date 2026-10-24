const express = require('express');
const logger = require('./logger');
const {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  activeRequests,
} = require('./metrics');

const app = express();

app.use(express.json());

// const logger = pino({
//   level: process.env.LOG_LEVEL || "info",
//   redact: {
//     paths: [
//       "req.headers.authorization",
//       "req.headers.cookie",
//       "req.body.password",
//       "req.body.token",
//       "req.body.cardNumber",
//     ],
//     censor: "[REDACTED]",
//   },
// });

// app.use(pinoHttp({ logger }));

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  activeRequests.inc();

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route?.path || req.path;

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: String(res.statusCode),
    });

    httpRequestDuration.observe(
      { method: req.method, route },
      duration
    );

    activeRequests.dec();

    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationSeconds: duration,
    }, 'HTTP request completed');
  });

  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'Observability Demo API',
    status: 'healthy',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]);
});
app.get('/metrics', async (req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    next(error);
  }
});

app.get('/api/error', (req, res) => {
  logger.error('Intentional demo error');
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = app;
