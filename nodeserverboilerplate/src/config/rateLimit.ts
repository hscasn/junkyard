import * as RateLimit from 'express-rate-limit';

import { getVar } from '../lib/env';

const rateLimit: RateLimit.Options = { // 300 requests in one minute
  windowMs:   +getVar('RATELIMIT_WINDOWMS'),
  max:        +getVar('RATELIMIT_MAX'),
  delayAfter: +getVar('RATELIMIT_DELAY_AFTER'),
};

export { rateLimit };
