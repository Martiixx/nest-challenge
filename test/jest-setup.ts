// Jest setup for e2e tests
// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_DATABASE = 'test_db';

// Mock external HTTP calls
jest.mock('axios');

// Mock TypeORM connections for testing
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  createConnection: jest.fn(),
  getConnection: jest.fn(),
  getRepository: jest.fn(),
}));

// Increase timeout for async operations
jest.setTimeout(30000);
