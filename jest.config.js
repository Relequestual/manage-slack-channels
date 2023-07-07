/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/test/msw/setup'],
};

module.exports = config;
