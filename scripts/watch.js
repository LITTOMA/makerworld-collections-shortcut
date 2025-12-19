/**
 * Watch script for development
 * 开发模式监听文件变化
 */

const chokidar = require('chokidar');
const path = require('path');

console.log('🔍 Watching for file changes...\n');
console.log('Monitoring:');
console.log('- chrome-extension/');
console.log('- firefox-extension/');
console.log('- userscript/');
console.log('- shared/\n');

const watcher = chokidar.watch([
  'chrome-extension/**/*',
  'firefox-extension/**/*',
  'userscript/**/*',
  'shared/**/*'
], {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

watcher
  .on('change', (filepath) => {
    console.log(`📝 File changed: ${filepath}`);
  })
  .on('add', (filepath) => {
    console.log(`➕ File added: ${filepath}`);
  })
  .on('unlink', (filepath) => {
    console.log(`➖ File removed: ${filepath}`);
  });

console.log('Press Ctrl+C to stop watching\n');

