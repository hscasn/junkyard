import { Config } from '../interfaces';

import { getVar, isTrue } from '../lib/env';

const server: Config['server'] = {
  httpPort:      +getVar('SERVER_HTTPPORT'),
  loginDisabled:  isTrue('SERVER_LOGINDISABLED'),
};

export { server };
