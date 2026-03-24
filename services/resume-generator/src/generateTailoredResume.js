const OpenAI = require('openai');

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const outputSchema = {
  name: 'tailored_resume_content',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      skills: {
        type: 'array',
        items: { type: 'string' }
      },
      experience: {
        type: 'array',
        items: { type: 'string' }
      },
      projects: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    required: ['skills', 'experience', 'projects']
  }
};

function buildPrompt(masterResumeJson, jobDescription) {
  const prettyResume = JSON.stringify(masterResumeJson, null, 2);

  return [
    'You are an expert resume writer optimizing for ATS and recruiter readability.',
    'Your goal is to tailor resume content to the job description using ONLY facts from the master resume.',
    '',
    'Requirements:',
    '- ATS optimized: include role-relevant keywords naturally.',
    '- Highlight relevant skills and outcomes first.',
    '- Remove irrelevant content that does not support this role.',
    '- Keep output concise and high-impact.',
    '- Do not invent companies, tools, metrics, or responsibilities.',
    '- Use action-oriented, measurable phrasing when facts support it.',
    '',
    'Section instructions:',
    '1) skills: 8-15 most relevant skills/tools only.',
    '2) experience: 3-6 concise bullet points tailored to JD priorities.',
    '3) projects: 2-4 role-relevant project bullets.',
    '',
    'Master Resume JSON:',
    prettyResume,
    '',
    'Job Description:',
    jobDescription
  ].join('\n');
}

function ensureStringArray(value, fieldName) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid output: ${fieldName} must be string[]`);
  }
}

function normalizeOutput(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Model output is not an object');
  }

  ensureStringArray(data.skills, 'skills');
  ensureStringArray(data.experience, 'experience');
  ensureStringArray(data.projects, 'projects');

  const clean = (items) => [...new Set(items.map((item) => item.trim()).filter(Boolean))];

  return {
    skills: clean(data.skills).slice(0, 15),
    experience: clean(data.experience).slice(0, 6),
    projects: clean(data.projects).slice(0, 4)
  };
}

/**
 * @param {object} masterResumeJson
 * @param {string} jobDescription
 * @param {{ apiKey?: string, model?: string }} [options]
 * @returns {Promise<{skills: string[], experience: string[], projects: string[]}>}
 */
async function generateTailoredResume(masterResumeJson, jobDescription, options = {}) {
  if (!masterResumeJson || typeof masterResumeJson !== 'object' || Array.isArray(masterResumeJson)) {
    throw new Error('masterResumeJson must be a non-null object');
  }

  if (!jobDescription || typeof jobDescription !== 'string') {
    throw new Error('jobDescription must be a non-empty string');
  }

  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OpenAI API key. Set OPENAI_API_KEY.');
  }

  const client = new OpenAI({ apiKey });
  const model = options.model || DEFAULT_MODEL;

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: {
        type: 'json_schema',
        json_schema: outputSchema
      },
      messages: [
        {
          role: 'system',
          content:
            'You are a strict JSON generator. Return only valid JSON matching the response schema. No markdown.'
        },
        {
          role: 'user',
          content: buildPrompt(masterResumeJson, jobDescription)
        }
      ]
    });

    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response did not include message content');
    }

    const parsed = JSON.parse(content);
    return normalizeOutput(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse model JSON output: ${error.message}`);
    }

    if (error?.status) {
      throw new Error(`OpenAI API error (${error.status}): ${error.message}`);
    }

    throw new Error(`Tailored resume generation failed: ${error.message}`);
  }
}

module.exports = {
  generateTailoredResume
};
