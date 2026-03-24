function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toNormalizedSet(values = []) {
  return new Set(
    (Array.isArray(values) ? values : [])
      .map((value) => normalize(value))
      .filter(Boolean)
  );
}

function percentageOverlap(sourceValues = [], targetValues = []) {
  const source = toNormalizedSet(sourceValues);
  const target = toNormalizedSet(targetValues);

  if (source.size === 0 || target.size === 0) {
    return 0;
  }

  let matches = 0;
  for (const item of source) {
    if (target.has(item)) {
      matches += 1;
      continue;
    }

    // Light fuzzy fallback for terms like "node" vs "node.js"
    const fuzzyHit = [...target].some((candidate) => item.includes(candidate) || candidate.includes(item));
    if (fuzzyHit) {
      matches += 1;
    }
  }

  return (matches / source.size) * 100;
}

function roleMatchPercentage(jdRole = '', resumeRole = '', resumeTargetRoles = []) {
  const normalizedJdRole = normalize(jdRole);
  const normalizedResumeRole = normalize(resumeRole);

  if (!normalizedJdRole) {
    return 0;
  }

  if (normalizedResumeRole && (normalizedJdRole.includes(normalizedResumeRole) || normalizedResumeRole.includes(normalizedJdRole))) {
    return 100;
  }

  const targetRoleSet = toNormalizedSet(resumeTargetRoles);
  if (targetRoleSet.size > 0) {
    const exactOrContains = [...targetRoleSet].some(
      (role) => normalizedJdRole.includes(role) || role.includes(normalizedJdRole)
    );

    if (exactOrContains) {
      return 100;
    }
  }

  return 0;
}

module.exports = {
  normalize,
  percentageOverlap,
  roleMatchPercentage
};
