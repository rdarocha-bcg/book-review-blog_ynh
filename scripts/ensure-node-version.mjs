/**
 * Ensures Node.js meets Angular CLI 18 minimum (v18.19+).
 * Run via npm prestart hook — keep syntax ES5-safe for very old Node error messages.
 */
'use strict';

var match = process.version.match(/^v(\d+)\.(\d+)\.(\d+)/);
if (!match) {
  console.error('[ensure-node-version] Could not parse Node version:', process.version);
  process.exit(1);
}

var major = parseInt(match[1], 10);
var minor = parseInt(match[2], 10);
var patch = parseInt(match[3], 10);

var ok =
  major > 18 ||
  (major === 18 && (minor > 18 || (minor === 18 && patch >= 19)));

if (!ok) {
  console.error(
    '[ensure-node-version] Node ' +
      process.version +
      ' is below the minimum for Angular 18 (need >= 18.19.0).'
  );
  console.error(
    '  Install current LTS from https://nodejs.org/ or on Windows run:'
  );
  console.error('  powershell -ExecutionPolicy Bypass -File .\\scripts\\dev-windows.ps1');
  process.exit(1);
}
