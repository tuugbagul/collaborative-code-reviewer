require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Parse JSON only for non-proxied routes (body consumed by proxy otherwise)
app.use('/health', express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'API Gateway running' });
});

// JWT guard for analysis routes
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// /api/auth/** → Auth Service (no auth required)
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
  })
);

// /api/analyze/** → Analysis Service (JWT required)
app.use(
  '/api/analyze',
  verifyToken,
  createProxyMiddleware({
    target: process.env.ANALYSIS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/analyze': '/analyze' },
  })
);

app.listen(PORT, () => console.log(`API Gateway listening on port ${PORT}`));
