const OpenAI = require('openai');

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const outputSchema = {
  name: 'job_description_analysis',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      skills: {
        type: 'array',
        items: { type: 'string' }
      },
      tools: {
        type: 'array',
        items: { type: 'string' }
      },
      experienceLevel: {
        type: 'string',
        enum: ['intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'unknown']
      },
      keywords: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    required: ['skills', 'tools', 'experienceLevel', 'keywords']
  }
};

function buildPrompt(jobDescription) {
  return [
    'You are a precise job-description analyzer for recruiting automation.',
    'Extract only information explicitly present or strongly implied by the text.',
    'Do not invent company-specific facts.',
    'Return concise normalized values.',
    '',
    'Rules:',
    '1) skills: capabilities/competencies (e.g., "system design", "stakeholder communication").',
    '2) tools: technologies/platforms/frameworks/languages (e.g., "Node.js", "PostgreSQL", "AWS").',
    '3) experienceLevel: choose exactly one of [intern, junior, mid, senior, lead, manager, unknown].',
    '4) keywords: top ATS-relevant terms and phrases.',
    '5) Remove duplicates and keep arrays sorted by relevance.',
    '',
    'Job Description:',
    jobDescription
  ].join('\n');
}

function validateNormalizedOutput(data) {
  const hasStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string');

  if (!data || typeof data !== 'object') {
    throw new Error('Model output is not an object');
  }

  if (!hasStringArray(data.skills)) {
    throw new Error('Invalid output: skills must be string[]');
  }

  if (!hasStringArray(data.tools)) {
    throw new Error('Invalid output: tools must be string[]');
  }

  if (typeof data.experienceLevel !== 'string') {
    throw new Error('Invalid output: experienceLevel must be string');
  }

  if (!hasStringArray(data.keywords)) {
    throw new Error('Invalid output: keywords must be string[]');
  }

  return {
    skills: [...new Set(data.skills.map((item) => item.trim()).filter(Boolean))],
    tools: [...new Set(data.tools.map((item) => item.trim()).filter(Boolean))],
    experienceLevel: data.experienceLevel.trim() || 'unknown',
    keywords: [...new Set(data.keywords.map((item) => item.trim()).filter(Boolean))]
  };
}

/**
 * Analyze one job description and return consistent JSON output.
 *
 * @param {string} jobDescription
 * @param {{ apiKey?: string, model?: string }} [options]
 * @returns {Promise<{skills: string[], tools: string[], experienceLevel: string, keywords: string[]}>}
 */
async function analyzeJobDescription(jobDescription, options = {}) {
  if (!jobDescription || typeof jobDescription !== 'string') {
    throw new Error('jobDescription must be a non-empty string');
  }

  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OpenAI API key. Set OPENAI_API_KEY.');
  }

  const model = options.model || DEFAULT_MODEL;
  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0,
      response_format: {
        type: 'json_schema',
        json_schema: outputSchema
      },
      messages: [
        {
          role: 'system',
          content:
            'You output only JSON that matches the provided schema. Never include markdown or extra text.'
        },
        {
          role: 'user',
          content: buildPrompt(jobDescription)
        }
      ]
    });

    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response did not include message content');
    }

    const parsed = JSON.parse(content);
    return validateNormalizedOutput(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse model JSON output: ${error.message}`);
    }

    if (error?.status) {
      throw new Error(`OpenAI API error (${error.status}): ${error.message}`);
    }

    throw new Error(`Job description analysis failed: ${error.message}`);
  }
}

module.exports = {
  analyzeJobDescription
};
