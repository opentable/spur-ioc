module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.[jt]s?(x)'
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  moduleFileExtensions: [
    'js',
    'json'
  ],
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec).[tj]s?(x)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
};
