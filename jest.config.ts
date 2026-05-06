import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@atoms/(.*)$': '<rootDir>/components/atoms/$1',
    '^@molecules/(.*)$': '<rootDir>/components/molecules/$1',
    '^@organisms/(.*)$': '<rootDir>/components/organisms/$1',
    '^@templates/(.*)$': '<rootDir>/components/templates/$1',
    '^@sections/(.*)$': '<rootDir>/components/sections/$1',
    '^@store/(.*)$': '<rootDir>/store/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@providers/(.*)$': '<rootDir>/components/providers/$1',

    '^.+\\.module\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(next-intl|@babel/runtime)/)',
    String.raw`^.+\.module\.(css|sass|scss)$`,
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
  ],
  coverageThreshold: {
    global: {
      branches: 2,
      functions: 2,
      lines: 2,
      statements: 2,
    },
  },
}

export default createJestConfig(customJestConfig)
