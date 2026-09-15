import app from './app.js';
import path from 'path';
import express from 'express';

// Serve root static HTML, CSS, JS files in local development
const rootDir = path.resolve(process.cwd(), '..');
app.use(express.static(rootDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Shree RBSK Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🌐 Open in browser: http://localhost:${PORT}`);
});
