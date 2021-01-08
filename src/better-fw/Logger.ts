import * as pino from 'pino';

const firebaseLevels = {
  notice: 35,
  critical: 55,
  emergency: 60,
  alert: 70,
};

const levelFormatter = (label: string, number: number) => {
  let gcpSeverity: string;

  switch (label) {
    case 'trace':
      gcpSeverity = 'DEBUG';
      break;

    case 'notice':
      gcpSeverity = 'NOTICE';
      break;

    case 'warn':
      gcpSeverity = 'WARNING';
      break;

    default:
      gcpSeverity = label.toUpperCase();
  }

  return { level: number, severity: gcpSeverity };
};

const level = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'info';
    case 'development':
      return 'debug';
    case 'test':
      return 'fatal';
    default:
      return 'debug';
  }
};
export type Logger = pino.Logger & {
  notice: pino.LogFn;
  critical: pino.LogFn;
  emergency: pino.LogFn;
  alert: pino.LogFn;
  child(bindings: pino.Bindings): Logger;
};

export const createLogger = (): Logger => {
  return pino({
    prettyPrint: process.env.NODE_ENV !== 'production',
    messageKey: 'message',
    level: level(),
    customLevels: firebaseLevels,
    formatters: {
      level: levelFormatter,
      bindings: () => ({}),
    },
  }) as Logger;
};
