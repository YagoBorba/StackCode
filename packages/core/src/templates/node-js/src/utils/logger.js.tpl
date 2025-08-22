// Simple logger utility
class Logger {
  constructor() {
    this.colors = {
      info: '\x1b[36m',    // Cyan
      warn: '\x1b[33m',    // Yellow
      error: '\x1b[31m',   // Red
      success: '\x1b[32m', // Green
      reset: '\x1b[0m'     // Reset
    };
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const color = this.colors[level] || this.colors.reset;
    const levelStr = level.toUpperCase().padEnd(7);
    
    console.log(
      `${color}[${timestamp}] ${levelStr}${this.colors.reset}`,
      message,
      ...args
    );
  }

  info(message, ...args) {
    this.formatMessage('info', message, ...args);
  }

  warn(message, ...args) {
    this.formatMessage('warn', message, ...args);
  }

  error(message, ...args) {
    this.formatMessage('error', message, ...args);
  }

  success(message, ...args) {
    this.formatMessage('success', message, ...args);
  }
}

export const logger = new Logger();
