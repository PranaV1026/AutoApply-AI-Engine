# Resume Generator (OpenAI)

Generates ATS-optimized tailored resume content from:
- Master resume JSON
- Job description text

## Output format
```json
{
  "skills": [],
  "experience": [],
  "projects": []
}
```

## Features
- ATS-focused keyword alignment
- Emphasizes relevant skills and impact bullets
- Removes irrelevant content from output
- Keeps sections concise
- Schema-constrained JSON output

## Install
```bash
cd services/resume-generator
npm install
```

## Usage as a function
```js
const { generateTailoredResume } = require('./src');

const result = await generateTailoredResume(masterResumeJson, jobDescription);
console.log(result);
```

## Usage as CLI
```bash
cd services/resume-generator
OPENAI_API_KEY="..." node src/index.js ./examples/masterResume.json ./examples/jobDescription.txt
```

## Notes
- Uses OpenAI JSON schema response format for consistent structure.
- Uses only facts present in master resume input.
