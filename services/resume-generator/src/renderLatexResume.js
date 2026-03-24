const fs = require('fs/promises');
const path = require('path');

const DEFAULT_TEMPLATE = path.resolve(__dirname, '../latex/templates/ats_resume.tex');

function escapeLatex(value) {
  return String(value || '')
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

function toBulletList(items = []) {
  const safeItems = (Array.isArray(items) ? items : [])
    .map((item) => escapeLatex(item).trim())
    .filter(Boolean);

  if (safeItems.length === 0) {
    return '\\textit{N/A}';
  }

  const bullets = safeItems.map((item) => `  \\item ${item}`).join('\n');
  return ['\\begin{itemize}', bullets, '\\end{itemize}'].join('\n');
}

function validateResumeContent(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('resume content must be an object');
  }

  if (typeof data.name !== 'string' || !data.name.trim()) {
    throw new Error('resume content must include a non-empty "name" string');
  }

  const ensureArray = (fieldName) => {
    if (!Array.isArray(data[fieldName]) || !data[fieldName].every((x) => typeof x === 'string')) {
      throw new Error(`resume content field "${fieldName}" must be string[]`);
    }
  };

  ensureArray('skills');
  ensureArray('experience');
  ensureArray('projects');
}

/**
 * Render ATS-friendly LaTeX resume from a template with placeholders.
 * @param {{name: string, skills: string[], experience: string[], projects: string[]}} resumeContent
 * @param {{templatePath?: string, outputPath: string}} options
 */
async function renderLatexResume(resumeContent, options) {
  validateResumeContent(resumeContent);

  if (!options || typeof options !== 'object' || !options.outputPath) {
    throw new Error('options.outputPath is required');
  }

  const templatePath = options.templatePath
    ? path.resolve(options.templatePath)
    : DEFAULT_TEMPLATE;

  const outputPath = path.resolve(options.outputPath);
  const template = await fs.readFile(templatePath, 'utf8');

  const rendered = template
    .replace(/\{\{NAME\}\}/g, escapeLatex(resumeContent.name))
    .replace(/\{\{SKILLS\}\}/g, toBulletList(resumeContent.skills))
    .replace(/\{\{EXPERIENCE\}\}/g, toBulletList(resumeContent.experience))
    .replace(/\{\{PROJECTS\}\}/g, toBulletList(resumeContent.projects));

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, rendered, 'utf8');

  return {
    outputPath,
    templatePath
  };
}

module.exports = {
  renderLatexResume,
  escapeLatex,
  toBulletList
};
