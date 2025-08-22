/**
 * Example controller for handling basic routes
 */
export class ExampleController {
  static getWelcome() {
    return {
      message: 'Welcome to {{projectName}}!',
      status: 'running',
      version: '1.0.0'
    };
  }

  static getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: '{{projectName}}'
    };
  }
}
