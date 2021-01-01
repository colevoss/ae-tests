import * as pino from 'pino';

export const createLogger = () => {
  return pino({
    prettyPrint: process.env.ENV !== 'production',
    messageKey: 'message',
    level: 'debug',
  });
};

export type Logger = pino.Logger;
