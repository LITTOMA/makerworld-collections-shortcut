/**
 * Package script for creating distribution files
 * 创建分发包
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// 创建 dist 目录
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

/**
 * 打包目录为 zip 文件
 */
function zipDirectory(sourceDir, outPath) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

async function packageExtensions() {
  console.log('Packaging MakerWorld QuickFav extensions...\n');

  try {
    // 打包 Chrome 扩展
    console.log('📦 Packaging Chrome extension...');
    await zipDirectory('chrome-extension', 'dist/makerworld-quickfav-chrome-v1.0.0.zip');
    console.log('✅ Chrome extension packaged: dist/makerworld-quickfav-chrome-v1.0.0.zip\n');

    // 打包 Firefox 扩展
    console.log('📦 Packaging Firefox extension...');
    await zipDirectory('firefox-extension', 'dist/makerworld-quickfav-firefox-v1.0.0.zip');
    console.log('✅ Firefox extension packaged: dist/makerworld-quickfav-firefox-v1.0.0.zip\n');

    // 复制用户脚本
    console.log('📦 Copying userscript...');
    fs.copyFileSync(
      'userscript/makerworld-quickfav.user.js',
      'dist/makerworld-quickfav.user.js'
    );
    console.log('✅ Userscript copied: dist/makerworld-quickfav.user.js\n');

    console.log('✅ All packages created successfully!');
    console.log('\nDistribution files:');
    console.log('- dist/makerworld-quickfav-chrome-v1.0.0.zip');
    console.log('- dist/makerworld-quickfav-firefox-v1.0.0.zip');
    console.log('- dist/makerworld-quickfav.user.js');
  } catch (err) {
    console.error('❌ Packaging failed:', err);
    process.exit(1);
  }
}

packageExtensions();

