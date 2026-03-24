const fs = require('fs/promises');
const path = require('path');
const { renderLatexResume } = require('./renderLatexResume');

async function main() {
  const [inputJsonPath, outputTexPath, customTemplatePath] = process.argv.slice(2);

  if (!inputJsonPath || !outputTexPath) {
    console.error('Usage: node src/renderLatexCli.js <resumeContent.json> <output.tex> [template.tex]');
    process.exit(1);
  }

  try {
    const raw = await fs.readFile(path.resolve(inputJsonPath), 'utf8');
    const resumeContent = JSON.parse(raw);

    const result = await renderLatexResume(resumeContent, {
      outputPath: outputTexPath,
      templatePath: customTemplatePath
    });

    console.log(`LaTeX resume written to: ${result.outputPath}`);
  } catch (error) {
    console.error(`Failed to render LaTeX resume: ${error.message}`);
    process.exit(1);
  }
}

main();
