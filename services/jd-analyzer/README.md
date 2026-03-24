# Job Description Analyzer (OpenAI)

Analyzes a job description and returns consistent JSON:
- `skills`
- `tools`
- `experienceLevel`
- `keywords`

Also provides a reusable relevance scoring module for JD-vs-resume matching.

## Install
```bash
cd services/jd-analyzer
npm install
```

## Usage (as function)
```js
const {
  analyzeJobDescription,
  calculateRelevanceScore,
  calculateRelevanceScoreWithBreakdown
} = require('./src');

const extracted = await analyzeJobDescription(jobDescriptionText);

const resume = {
  skills: ['Node.js', 'PostgreSQL', 'System Design'],
  keywords: ['microservices', 'REST APIs', 'cloud'],
  currentRole: 'Senior Software Engineer',
  targetRoles: ['Backend Engineer', 'Software Engineer']
};

const scoreOnly = calculateRelevanceScore(
  { skills: extracted.skills, keywords: extracted.keywords, role: 'Backend Engineer' },
  resume
);

const detailed = calculateRelevanceScoreWithBreakdown(
  { skills: extracted.skills, keywords: extracted.keywords, role: 'Backend Engineer' },
  resume
);

console.log(scoreOnly); // 0-100
console.log(detailed);
```

## Scoring formula
```text
score = (skill_match * 0.5) + (keyword_match * 0.3) + (role_match * 0.2)
```

- `skill_match`: overlap % between JD skills and resume skills
- `keyword_match`: overlap % between JD keywords and resume keywords
- `role_match`: role alignment % (exact/contains match)
- Output score is normalized to **0-100**.

## Usage (CLI)
```bash
cd services/jd-analyzer
OPENAI_API_KEY="..." node src/index.js "We need a senior Node.js engineer with AWS and PostgreSQL experience..."
```

## Example analyzer output
```json
{
  "skills": ["backend development", "system design"],
  "tools": ["Node.js", "PostgreSQL", "AWS"],
  "experienceLevel": "senior",
  "keywords": ["REST APIs", "microservices", "cloud"]
}
```

## Notes
- Uses structured prompt + JSON Schema response format for consistent outputs.
- Includes output normalization and API error wrapping.
- Scoring logic is modular and reusable from any service.
