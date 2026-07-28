const { spawn } = require('child_process');
const path = require('path');

console.log(' Launching DAMALE SCHOOL KATSINA CBT Platform...\n');

const cmd = process.platform === 'win32' ? 'cmd.exe' : 'npm';
const args = process.platform === 'win32' ? ['/c', 'npm run dev'] : ['run', 'dev'];

const serverProcess = spawn(cmd, args, {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit'
});

const clientProcess = spawn(cmd, args, {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit'
});

serverProcess.on('error', (err) => {
  console.error('Server process error:', err);
});

clientProcess.on('error', (err) => {
  console.error('Client process error:', err);
});

process.on('SIGINT', () => {
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
});
