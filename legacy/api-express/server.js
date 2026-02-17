const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 4000;

// Conexión a Postgres (Railway inyecta DATABASE_URL automáticamente)
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

app.use(express.json());

// Health check (para Railway)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'foundteach-api', timestamp: new Date().toISOString() });
});

// Health check con verificación de base de datos
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = pool
      ? await pool.query('SELECT 1').then(() => 'connected').catch(() => 'disconnected')
      : 'not configured';
    res.json({
      status: 'ok',
      service: 'foundteach-api',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoints API (estructura base para expandir)
app.get('/api', (req, res) => {
  res.json({
    name: 'FoundTeach API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FoundTeach API running on port ${PORT}`);
});
