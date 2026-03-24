function randomInt(min, max) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

async function randomDelay(minMs = 500, maxMs = 1500) {
  const delayMs = randomInt(minMs, maxMs);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return delayMs;
}

module.exports = {
  randomDelay
};
