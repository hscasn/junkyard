// tslint:disable:no-console

import WritableStream = NodeJS.WritableStream;
import { createLogger, LoggerOptions } from 'bunyan';
import * as fsNode from 'fs';
import * as path from 'path';
import * as BunyanFormat from 'bunyan-format';

import { Config, Middleware } from '../../interfaces';
import { ErrorCodes } from '../errorCodes';

export interface Logger {
  NAME:          string;
  fatal:         (message: string, exitCode?: number) => void;
  error:         (message: string) => void;
  warn:          (message: string) => void;
  info:          (message: string) => void;
  debug:         (message: string) => void;
  trace:         (message: string) => void;
  clientError:   (message: string) => void;
  clientWarn:    (message: string) => void;
  clientInfo:    (message: string) => void;
  clientDebug:   (message: string) => void;
  clientTrace:   (message: string) => void;
  visitRecorder: () => Middleware;
  middleware:    Middleware;
}

export function makeLogger(fs: typeof fsNode, make: typeof createLogger, loggerConfig: Config['logger']): Logger {
  if (typeof fs !== 'object') {
    throw new Error('Argument fs must be an object');
  }
  if (typeof make !== 'function') {
    throw new Error('Argument make must be a function');
  }
  if (typeof loggerConfig !== 'object') {
    throw new Error('Argument loggerConfig must be an object');
  }

  const paths: string[] = [];

  ['requests', 'messages', 'client'].forEach(((src: string) => {
    const streams = loggerConfig[src] && loggerConfig[src].streams;
    /* istanbul ignore next */
    if (streams && streams.forEach) {
      streams.forEach((config: LoggerOptions) => {
        if (config.path) {
          paths.push(config.path);
        }
      });
    }
  }));

  paths.forEach((filepath: string) => {
    const dirname = path.dirname(filepath);
    try {
      fs.accessSync(dirname, fs.constants.F_OK | fs.constants.W_OK | fs.constants.X_OK);

      try {
        if (fs.existsSync(filepath)) {
          fs.accessSync(filepath, fs.constants.W_OK | fs.constants.R_OK);
        }
      } catch (e) {
        /* istanbul ignore next */
        console.log(`The log file ${filepath} cannot be written. Make sure it has RW permissions`);
        /* istanbul ignore next */
        process.exit(ErrorCodes.BadLogFile);
      }
    } catch (e) {
      /* istanbul ignore next */
      console.log(`The directory containing the log file ${filepath} (${dirname}) cannot be accessed or written. ` +
                  `Make sure it has WX permissions`);
      /* istanbul ignore next */
      process.exit(ErrorCodes.BadLogDir);
    }

  });

  const messageLogger = make(loggerConfig.messages);
  const requestLogger = make(loggerConfig.requests);
  const clientLogger  = make(loggerConfig.client);

  const that: Logger = {
    NAME: 'logger',

    /**
     * Logs and throws a fatal error. Makes the process exit with code 1, or another code if provided
     */
    fatal: (message: string, exitCode?: number): void => {
      messageLogger.fatal(message);
      /* istanbul ignore if */
      if (exitCode !== undefined) {
        process.exit(exitCode || 1);
      }
    },

    /**
     * Logs an error message
     */
    error: (message: string): void => {
      messageLogger.error(message);
    },

    /**
     * Logs a warning message
     */
    warn: (message: string): void => {
      messageLogger.warn(message);
    },

    /**
     * Logs an info message
     */
    info: (message: string): void => {
      messageLogger.info(message);
    },

    /**
     * Logs a debug message
     */
    debug: (message: string): void => {
      messageLogger.debug(message);
    },

    /**
     * Logs a trace message
     */
    trace: (message: string): void => {
      messageLogger.trace(message);
    },

    /**
     * Logs an error message that happened in the client
     */
    clientError: (message: string): void => {
      clientLogger.error(message);
    },

    /**
     * Logs a warning message that happened in the client
     */
    clientWarn: (message: string): void => {
      clientLogger.warn(message);
    },

    /**
     * Logs an info message that happened in the client
     */
    clientInfo: (message: string): void => {
      clientLogger.info(message);
    },

    /**
     * Logs a debug message that happened in the client
     */
    clientDebug: (message: string): void => {
      clientLogger.debug(message);
    },

    /**
     * Logs a trace message that happened in the client
     */
    clientTrace: (message: string): void => {
      clientLogger.trace(message);
    },

    /**
     * Generates a middleware that, when applied to a route, will log visits done to that route
     */
    visitRecorder: (): Middleware => {
      return async (req, res, next) => {
        requestLogger.info(`${req.method} from ${req.ip} to ${req.originalUrl}`);
        await next();
      };
    },

    /**
     * Attaches the logger to the context of a route
     */
    middleware: async (req, res, next) => {
      req.logger = that;
      await next();
    },
  };

  return Object.freeze(that);
}

export function getFormattedStream(): WritableStream {
  return new BunyanFormat({ outputMode: 'short' });
}
