import { Connection } from 'typeorm';
import { Request } from 'express';

import { makeUsersManager } from '../../managers/user';
import { Logger } from '../logger';
import { Config } from '../../interfaces';
import { UserAddModel, makeUserAddModel } from '../../models/User';

export async function initializeDb(
  connection: Connection,
  config: Config['database'],
  logger: Logger,
  hash: (password: string) => Promise<[boolean, string]>,
) {
  const userManager = makeUsersManager({ db: connection } as Request); // Mock context

  if (!config.createDefAdmin) {
    logger.info(`Skipping creation of default admin`);
  } else if (await userManager.getCount() < 1) {
    const [didHash, hashed] = await hash(config.defAdminPassword);
    if (!didHash) {
      throw new Error('Could not create default administrator: password hashing failed');
    }
    const user: UserAddModel = makeUserAddModel({
      email: config.defAdminEmail,
      password: hashed,
    });
    await userManager.insertAdmin(user);
    logger.warn(`Default admin ${config.defAdminEmail} created!`);
  } else {
    logger.info(`The database already has users. Default admin not created.`);
  }
}
