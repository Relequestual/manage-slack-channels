// Helper function to support asynchronous replace operations

module.exports.replaceAsync = async function replaceAsync(string, regex, asyncCallback) {
  const matches = Array.from(string.matchAll(regex));
  const replacements = await Promise.all(
    matches.map(([match, ...args]) => asyncCallback(match, ...args))
  );
  // Remember, replace function can be called multiple times
  let currentIndex = 0;
  return string.replace(regex, () => replacements[currentIndex++]);
};
