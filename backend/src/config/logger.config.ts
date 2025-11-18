import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const getBrazilTimestamp = () => {
  return new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
};

export const getLoggerConfig = (): WinstonModuleOptions => ({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: getBrazilTimestamp }),
        winston.format.ms(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: getBrazilTimestamp }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/requests.log',
      format: winston.format.combine(
        winston.format((info) => (info.category === 'request' ? info : false))(),
        winston.format.timestamp({ format: getBrazilTimestamp }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/business.log',
      format: winston.format.combine(
        winston.format((info) => (info.category === 'business' ? info : false))(),
        winston.format.timestamp({ format: getBrazilTimestamp }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/security.log',
      format: winston.format.combine(
        winston.format((info) => (info.category === 'security' ? info : false))(),
        winston.format.timestamp({ format: getBrazilTimestamp }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/performance.log',
      format: winston.format.combine(
        winston.format((info) => (info.category === 'performance' ? info : false))(),
        winston.format.timestamp({ format: getBrazilTimestamp }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp({ format: getBrazilTimestamp }),
        winston.format.json(),
      ),
    }),
  ],
});
