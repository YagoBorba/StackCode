/**
 * Simple logger utility
 */
export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data || '');
  }

  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data || '');
  }
}
