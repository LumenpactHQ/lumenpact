const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { getFrontendDir, getNpmCommand } = require('./run-frontend');

test('resolves the frontend directory from the script location', () => {
  const frontendDir = getFrontendDir();
  assert.equal(path.basename(frontendDir), 'frontend');
  assert.equal(path.resolve(frontendDir), frontendDir);
});

test('uses npm.cmd on Windows and npm elsewhere', () => {
  const command = getNpmCommand('win32');
  assert.equal(command, 'npm.cmd');

  const unixCommand = getNpmCommand('linux');
  assert.equal(unixCommand, 'npm');
});
