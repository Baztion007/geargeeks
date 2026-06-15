const { spawn } = require('child_process');
const path = require('path');

function startServer() {
  console.log('[keep-alive] Starting Next.js dev server...');
  const child = spawn('node', [path.join(__dirname, 'node_modules/.bin/next'), 'dev', '-p', '3000'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  child.on('exit', (code, signal) => {
    console.log(`[keep-alive] Process exited with code ${code}, signal ${signal}. Restarting in 3s...`);
    setTimeout(startServer, 3000);
  });
  
  child.on('error', (err) => {
    console.error('[keep-alive] Error:', err);
    setTimeout(startServer, 3000);
  });
}

startServer();
