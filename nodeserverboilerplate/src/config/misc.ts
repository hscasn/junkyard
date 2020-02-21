import { Config } from '../interfaces';

import { getVar, isTrue } from '../lib/env';

const misc: Config['misc'] = {
  websiteAddress:           getVar('MISC_WEBSITE_ADDRESS'),
  websiteTitle:             getVar('MISC_WEBSITE_TITLE'),
  saltRounds:              +getVar('MISC_SALT_ROUNDS'),
  passwordTokenExpireTime: +getVar('MISC_PASSWORD_TOKEN_EXPIRY_TIME'),
  enableSignup:             isTrue('MISC_ENABLE_SIGNUP'),
  enableLogin:              isTrue('MISC_ENABLE_LOGIN'),
  enablePasswordRecovery:   isTrue('MISC_ENABLE_PASSWORD_RECOVER'),
  enablePasswordChange:     isTrue('MISC_ENABLE_PASSWORD_CHANGE'),
  uploadDirectory:          getVar('MISC_UPLOAD_DIRECTORY', '') || undefined,
};

export { misc };
