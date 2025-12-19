/**
 * Build script for all extension versions
 * 构建所有版本的插件
 */

const fs = require('fs');
const path = require('path');

console.log('Building MakerWorld QuickFav...\n');

// 检查必要的文件
const requiredFiles = [
  'chrome-extension/manifest.json',
  'chrome-extension/content.js',
  'chrome-extension/styles.css',
  'firefox-extension/manifest.json',
  'firefox-extension/content.js',
  'firefox-extension/styles.css',
  'userscript/makerworld-quickfav.user.js'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing file: ${file}`);
    allFilesExist = false;
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

if (!allFilesExist) {
  console.error('\n❌ Build failed: Missing required files');
  process.exit(1);
}

console.log('\n✅ All files present');
console.log('✅ Build successful!');
console.log('\nNext steps:');
console.log('1. Add icons to chrome-extension/icons/ and firefox-extension/icons/');
console.log('2. Test the extensions in your browser');
console.log('3. Run "npm run package" to create distribution packages');

