import { getVar, isTrue } from '../lib/env';

const envSecret  =  getVar('SESSION_SECRET', '');

const session: CookieSessionInterfaces.CookieSessionOptions = {
  name: getVar('SESSION_NAME', 'sessionstorage'),
  secret: (envSecret.length  > 0) ? envSecret : 'defaultsessionkey',

  // If using secure cookie, make sure to use SSL
  secure: isTrue('SESSION_SECURE', true),
};

export { session };
