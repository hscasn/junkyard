import { database } from './database';
import { emailer } from './emailer';
import { logger } from './logger';
import { misc } from './misc';
import { rateLimit } from './rateLimit';
import { server } from './server';
import { session } from './session';
import { Config } from '../interfaces';

export function getPrintableConfig(config: Config) {
  const minimalConfig = {
    ...config,
  };
  delete minimalConfig.logger;

  return JSON.stringify(minimalConfig, undefined, 4);
}

export {
  database,
  emailer,
  logger,
  misc,
  rateLimit,
  server,
  session,
};
