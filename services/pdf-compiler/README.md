# PDF Compiler (LaTeX -> PDF)

Node.js utility to compile `.tex` into `.pdf` using `pdflatex`.

## Requirements
- Node.js 20+
- `pdflatex` installed and available in your `PATH`

## Install `pdflatex`
### Ubuntu / Debian
```bash
sudo apt-get update
sudo apt-get install -y texlive-latex-base texlive-latex-recommended texlive-fonts-recommended
```

### macOS (Homebrew)
```bash
brew install --cask mactex-no-gui
```

### Verify installation
```bash
pdflatex --version
```

## Install module dependencies
```bash
cd services/pdf-compiler
npm install
```

## Usage (CLI)
```bash
cd services/pdf-compiler
npm run compile -- ../resume-generator/output/resume.tex ./output
```

CLI output (JSON):
```json
{
  "pdfPath": "/abs/path/output/resume.pdf",
  "logPath": "/abs/path/output/resume.log",
  "outputDir": "/abs/path/output"
}
```

## Usage (as function)
```js
const { compileLatexToPdf } = require('./src');

const result = await compileLatexToPdf('./resume.tex', {
  outputDir: './output',
  timeoutMs: 60000,
  runs: 1
});

console.log(result.pdfPath);
```

## Error handling
- Invalid/missing input file checks.
- `.tex` extension validation.
- Handles missing `pdflatex` binary (`ENOENT`).
- Includes captured stdout/stderr on LaTeX compilation failure.
- Configurable timeout to avoid hanging builds.
