/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['dotenv/config', '<rootDir>/test/msw/setup'],
};

module.exports = config;
