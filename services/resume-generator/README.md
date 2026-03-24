# Resume Generator (OpenAI + LaTeX)

This service provides:
1. Tailored resume content generation from OpenAI
2. ATS-friendly LaTeX template rendering with dynamic placeholders

## Output format (tailored content)
```json
{
  "skills": [],
  "experience": [],
  "projects": []
}
```

## ATS-friendly LaTeX template
Template file:
- `latex/templates/ats_resume.tex`

Placeholders:
- `{{NAME}}`
- `{{SKILLS}}`
- `{{EXPERIENCE}}`
- `{{PROJECTS}}`

## Features
- ATS-focused keyword alignment
- Emphasizes relevant skills and impact bullets
- Removes irrelevant content from output
- Keeps sections concise
- Schema-constrained JSON output
- Safe LaTeX escaping for dynamic values

## Install
```bash
cd services/resume-generator
npm install
```

## Generate tailored content (OpenAI)
```js
const { generateTailoredResume } = require('./src');

const result = await generateTailoredResume(masterResumeJson, jobDescription);
console.log(result);
```

## Render `.tex` from dynamic content
### Input JSON shape
```json
{
  "name": "Alex Doe",
  "skills": ["Node.js", "PostgreSQL", "System Design"],
  "experience": [
    "Built scalable APIs handling 2M+ requests/day",
    "Reduced p95 latency by 35% via query optimization"
  ],
  "projects": [
    "AutoApply Engine: built workflow orchestration with n8n",
    "Resume Pipeline: generated ATS-ready resumes with OpenAI"
  ]
}
```

### CLI
```bash
cd services/resume-generator
npm run render:tex -- ./examples/resumeContent.json ./output/resume.tex
```

Optional custom template:
```bash
npm run render:tex -- ./examples/resumeContent.json ./output/resume.tex ./latex/templates/ats_resume.tex
```

## Notes
- LaTeX rendering script: `src/renderLatexResume.js`
- CLI wrapper: `src/renderLatexCli.js`
- Uses only facts present in master resume input for generation.
