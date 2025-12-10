// src/common/logger.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const sqlHighlight = (message: string) => {
  return message
    .replace(/\bSELECT\b/g, '\x1b[1mSELECT\x1b[0m')
    .replace(/\bINSERT\b/g, '\x1b[1mINSERT\x1b[0m')
    .replace(/\bUPDATE\b/g, '\x1b[1mUPDATE\x1b[0m')
    .replace(/\bDELETE\b/g, '\x1b[1mDELETE\x1b[0m')
    .replace(/\bFROM\b/g, '\x1b[1mFROM\x1b[0m')
    .replace(/\bWHERE\b/g, '\x1b[1mWHERE\x1b[0m');
};

export const logger = WinstonModule.createLogger({
  level: 'debug',
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf((info) => {
      const levelColor = {
        error: '\x1b[31m', // red
        warn: '\x1b[33m',  // yellow
        info: '\x1b[32m',  // green
        debug: '\x1b[34m', // blue
      }[info.level] || '\x1b[0m';

      const contextColor = '\x1b[36m'; // cyan
      const reset = '\x1b[0m';

      const context = info.context
        ? `${contextColor}[${info.context}]${reset} `
        : '';

      const message =
        typeof info.message === 'string'
          ? sqlHighlight(info.message)
          : info.message;

      return `[${info.timestamp}] ${levelColor}${info.level.toUpperCase()}${reset} ${context}► ${message}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});
