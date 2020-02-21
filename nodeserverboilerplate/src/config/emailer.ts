import { Config } from '../interfaces';

import { getVar } from '../lib/env';

const emailer: Config['emailer'] = {
  service: getVar('EMAILER_SERVICE'),
  auth: {
    user: getVar('EMAILER_USER'),
    pass: getVar('EMAILER_PASS'),
  },
};

export { emailer };
