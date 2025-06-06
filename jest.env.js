// eslint-disable-next-line @typescript-eslint/no-require-imports
const { loadEnvConfig } = require('@next/env');

// Load environment variables from .env.test
loadEnvConfig(process.cwd(), true, {
    info: () => null,
    error: console.error,
});

// Ensure we're in test mode
process.env.NODE_ENV = 'test';
