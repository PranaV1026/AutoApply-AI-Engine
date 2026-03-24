const { analyzeJobDescription } = require('./analyzeJobDescription');
const {
  calculateRelevanceScore,
  calculateRelevanceScoreWithBreakdown,
  WEIGHTS
} = require('./scoring/calculateRelevanceScore');

module.exports = {
  analyzeJobDescription,
  calculateRelevanceScore,
  calculateRelevanceScoreWithBreakdown,
  WEIGHTS
};

if (require.main === module) {
  const input = process.argv.slice(2).join(' ').trim();

  if (!input) {
    console.error('Usage: node src/index.js "<job description text>"');
    process.exit(1);
  }

  analyzeJobDescription(input)
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
