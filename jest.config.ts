import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    dir: './',
});

const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
    setupFiles: ['<rootDir>/jest.env.js'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    maxWorkers: 1, // tests need to run sequentially e.g. add user before updating
    clearMocks: true,
    resetMocks: true,
    cache: false,
    verbose: true,
};

export default createJestConfig(config);
