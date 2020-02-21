import { Config } from '../interfaces';

import { getVar, isTrue } from '../lib/env';

const database: Config['database'] = {
  type:              getVar('DB_TYPE'),
  user:              getVar('DB_USER'),
  password:          getVar('DB_PASS'),
  database:          getVar('DB_DATABASE'),
  host:              getVar('DB_HOST'),
  port:             +getVar('DB_PORT'),
  synchronize:       isTrue('DB_SYNC', true),
  logging:           isTrue('DB_LOG', true),
  createDefAdmin:    isTrue('DB_CREATE_DEFAULT_ADMIN'),
  defAdminEmail:     getVar('DB_DEFAULT_ADMIN_EMAIL'),
  defAdminPassword:  getVar('DB_DEFAULT_ADMIN_PASS'),
};

export { database };
