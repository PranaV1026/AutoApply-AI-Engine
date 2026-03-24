const { compileLatexToPdf } = require('../../../../services/pdf-compiler/src/compileLatexToPdf');

async function compilePdfService(input) {
  const texPath = input?.texPath || input?.resumeTexPath;

  if (!texPath || typeof texPath !== 'string') {
    const error = new Error('texPath is required');
    error.statusCode = 400;
    throw error;
  }

  return compileLatexToPdf(texPath, {
    outputDir: input.outputDir,
    timeoutMs: Number.isFinite(input.timeoutMs) ? input.timeoutMs : 60_000,
    runs: Number.isFinite(input.runs) ? input.runs : 1
  });
}

module.exports = {
  compilePdfService
};
