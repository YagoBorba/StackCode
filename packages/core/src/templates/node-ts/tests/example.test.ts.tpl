import { ExampleController } from '../src/controllers/example.controller.js';

/**
 * Basic tests for ExampleController
 */
describe('ExampleController', () => {
  test('getWelcome should return welcome message', () => {
    const result = ExampleController.getWelcome();
    
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('status', 'running');
    expect(result).toHaveProperty('version', '1.0.0');
  });

  test('getHealth should return health status', () => {
    const result = ExampleController.getHealth();
    
    expect(result).toHaveProperty('status', 'healthy');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('service');
  });
});
