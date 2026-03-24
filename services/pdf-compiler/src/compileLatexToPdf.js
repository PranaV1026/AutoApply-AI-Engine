const fs = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');

function runPdflatex(texFilePath, outputDir, timeoutMs) {
  return new Promise((resolve, reject) => {
    const args = [
      '-interaction=nonstopmode',
      '-halt-on-error',
      `-output-directory=${outputDir}`,
      texFilePath
    ];

    const child = spawn('pdflatex', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`pdflatex timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timer);

      if (error.code === 'ENOENT') {
        reject(new Error('pdflatex not found. Please install TeX Live / MacTeX and ensure pdflatex is in PATH.'));
        return;
      }

      reject(error);
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`pdflatex failed with code ${code}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

/**
 * Compile .tex into PDF and return generated PDF path.
 *
 * @param {string} texPath
 * @param {{ outputDir?: string, timeoutMs?: number, runs?: number }} [options]
 * @returns {Promise<{ pdfPath: string, logPath: string, outputDir: string }>} 
 */
async function compileLatexToPdf(texPath, options = {}) {
  if (!texPath || typeof texPath !== 'string') {
    throw new Error('texPath must be a non-empty string');
  }

  const fullTexPath = path.resolve(texPath);

  try {
    await fs.access(fullTexPath);
  } catch {
    throw new Error(`Input .tex file not found: ${fullTexPath}`);
  }

  if (path.extname(fullTexPath).toLowerCase() !== '.tex') {
    throw new Error(`Input file must be .tex: ${fullTexPath}`);
  }

  const outputDir = path.resolve(options.outputDir || path.dirname(fullTexPath));
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 60_000;
  const runs = Number.isFinite(options.runs) ? Math.max(1, options.runs) : 1;

  await fs.mkdir(outputDir, { recursive: true });

  for (let i = 0; i < runs; i += 1) {
    await runPdflatex(fullTexPath, outputDir, timeoutMs);
  }

  const baseName = path.basename(fullTexPath, '.tex');
  const pdfPath = path.join(outputDir, `${baseName}.pdf`);
  const logPath = path.join(outputDir, `${baseName}.log`);

  try {
    await fs.access(pdfPath);
  } catch {
    throw new Error(`Compilation finished but PDF not found: ${pdfPath}`);
  }

  return {
    pdfPath,
    logPath,
    outputDir
  };
}

module.exports = {
  compileLatexToPdf
};
