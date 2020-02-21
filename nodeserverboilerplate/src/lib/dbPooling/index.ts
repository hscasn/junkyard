import { getConnectionManager, Connection } from 'typeorm';

import * as express from 'express';

import { database } from '../../config/database';
import { ALL_ENTITIES } from '../../entities';

export async function attachDbPool(app: express.Express): Promise<Connection> {
  const pool = getConnectionManager().create({
    type:        database.type as any,
    host:        database.host,
    port:        database.port,
    username:    database.user,
    password:    database.password,
    database:    database.database,
    synchronize: database.synchronize,
    logging:     database.logging,
    entities:    [...ALL_ENTITIES],
  });

  const connection = await pool.connect();

  app.use(async (req, res, next) => {
    req.db = connection;
    next();
  });

  return connection;
}
