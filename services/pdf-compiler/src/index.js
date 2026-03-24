const path = require('path');
const { compileLatexToPdf } = require('./compileLatexToPdf');

module.exports = {
  compileLatexToPdf
};

if (require.main === module) {
  const [texPathArg, outputDirArg] = process.argv.slice(2);

  if (!texPathArg) {
    console.error('Usage: node src/index.js <input.tex> [outputDir]');
    process.exit(1);
  }

  const texPath = path.resolve(texPathArg);
  const outputDir = outputDirArg ? path.resolve(outputDirArg) : undefined;

  compileLatexToPdf(texPath, {
    outputDir,
    runs: 1,
    timeoutMs: 60_000
  })
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    })
    .catch((error) => {
      console.error(`PDF compilation failed: ${error.message}`);
      process.exit(1);
    });
}
