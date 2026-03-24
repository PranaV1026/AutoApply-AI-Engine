const { percentageOverlap, roleMatchPercentage } = require('./matchers');

const WEIGHTS = {
  skillMatch: 0.5,
  keywordMatch: 0.3,
  roleMatch: 0.2
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * @typedef {{ skills?: string[], keywords?: string[], role?: string }} ExtractedJdData
 * @typedef {{ skills?: string[], keywords?: string[], currentRole?: string, targetRoles?: string[] }} UserResumeData
 */

/**
 * Returns detailed relevance score using formula:
 * score = (skill_match * 0.5) + (keyword_match * 0.3) + (role_match * 0.2)
 *
 * All component matches are percentages in the range [0, 100].
 * Final score is rounded to nearest integer in [0, 100].
 *
 * @param {ExtractedJdData} jdData
 * @param {UserResumeData} resumeData
 */
function calculateRelevanceScoreWithBreakdown(jdData = {}, resumeData = {}) {
  const skillMatch = percentageOverlap(jdData.skills, resumeData.skills);
  const keywordMatch = percentageOverlap(jdData.keywords, resumeData.keywords);
  const roleMatch = roleMatchPercentage(jdData.role, resumeData.currentRole, resumeData.targetRoles);

  const weightedScore =
    skillMatch * WEIGHTS.skillMatch +
    keywordMatch * WEIGHTS.keywordMatch +
    roleMatch * WEIGHTS.roleMatch;

  const score = clamp(Math.round(weightedScore), 0, 100);

  return {
    score,
    breakdown: {
      skillMatch: Number(skillMatch.toFixed(2)),
      keywordMatch: Number(keywordMatch.toFixed(2)),
      roleMatch: Number(roleMatch.toFixed(2)),
      weights: WEIGHTS
    }
  };
}

/**
 * Public compact scorer that returns only score (0-100).
 * @param {ExtractedJdData} jdData
 * @param {UserResumeData} resumeData
 */
function calculateRelevanceScore(jdData = {}, resumeData = {}) {
  return calculateRelevanceScoreWithBreakdown(jdData, resumeData).score;
}

module.exports = {
  calculateRelevanceScore,
  calculateRelevanceScoreWithBreakdown,
  WEIGHTS
};
