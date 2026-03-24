const fs = require('fs/promises');
const path = require('path');

async function saveJson(filePath, data) {
  const fullPath = path.resolve(filePath);
  const dir = path.dirname(fullPath);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

module.exports = {
  saveJson
};
