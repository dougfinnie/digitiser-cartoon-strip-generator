const fs = require('fs');
const https = require('https');
const path = require('path');

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https
      .get(url, response => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download ${url}: ${response.statusCode}`)
          );
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', err => {
        fs.unlink(filename, () => {}); // Delete the file on error
        reject(err);
      });
  });
}

function getUniqueFilename(filepath) {
  const dir = path.dirname(filepath);
  const ext = path.extname(filepath);
  const base = path.basename(filepath, ext);

  let counter = 1;
  let newPath = filepath;

  while (fs.existsSync(newPath)) {
    newPath = path.join(dir, `${base}_${counter}${ext}`);
    counter++;
  }

  return newPath;
}

async function downloadAllAssets() {
  try {
    // Ensure assets directory exists
    if (!fs.existsSync('assets')) {
      fs.mkdirSync('assets', { recursive: true });
      console.log('Created assets directory');
    }

    const assetsData = fs.readFileSync('.glitch-assets', 'utf8');
    const lines = assetsData.split('\n').filter(line => line.trim());

    console.log(`Found ${lines.length} assets to process...`);

    for (const line of lines) {
      try {
        const asset = JSON.parse(line);
        if (asset.url && asset.name && !asset.deleted) {
          const extension =
            path.extname(asset.name) || path.extname(asset.url) || '.jpg';
          const baseName =
            path.basename(asset.name, path.extname(asset.name)) || asset.uuid;
          const localPath = path.join('assets', baseName + extension);
          const uniquePath = getUniqueFilename(localPath);

          console.log(`Downloading ${asset.name} -> ${uniquePath}`);
          await downloadImage(asset.url, uniquePath);
          console.log(`✓ Downloaded: ${uniquePath}`);
        } else if (asset.deleted) {
          console.log(`Skipping deleted asset: ${asset.uuid}`);
        }
      } catch (parseError) {
        console.log(`Skipping invalid line: ${line.substring(0, 50)}...`);
      }
    }

    console.log('All assets downloaded successfully!');
  } catch (error) {
    console.error('Error downloading assets:', error);
  }
}

downloadAllAssets();
