import { spawn } from 'child_process';

console.log('Starting server test...');

const server = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'pipe',
  shell: true
});

server.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

server.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

server.on('error', (error) => {
  console.log('ERROR:', error.message);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Kill after 10 seconds for testing
setTimeout(() => {
  console.log('Killing server for test...');
  server.kill();
}, 10000);
