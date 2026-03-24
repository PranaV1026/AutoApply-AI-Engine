const fs = require('fs/promises');
const path = require('path');
const { generateTailoredResume } = require('./generateTailoredResume');
const { renderLatexResume } = require('./renderLatexResume');

module.exports = {
  generateTailoredResume,
  renderLatexResume
};

async function readJsonFile(filePath) {
  const fullPath = path.resolve(filePath);
  const contents = await fs.readFile(fullPath, 'utf8');
  return JSON.parse(contents);
}

async function readTextFile(filePath) {
  const fullPath = path.resolve(filePath);
  return fs.readFile(fullPath, 'utf8');
}

if (require.main === module) {
  const [masterResumePath, jobDescriptionPath] = process.argv.slice(2);

  if (!masterResumePath || !jobDescriptionPath) {
    console.error('Usage: node src/index.js <masterResume.json> <jobDescription.txt>');
    process.exit(1);
  }

  Promise.all([readJsonFile(masterResumePath), readTextFile(jobDescriptionPath)])
    .then(([masterResumeJson, jobDescription]) =>
      generateTailoredResume(masterResumeJson, jobDescription)
    )
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
