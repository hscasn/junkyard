import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';

import { getVar, isTrue } from '../../src/lib/env';
import { UserEntity, ExampleEntity, ALL_ENTITIES } from '../../src/entities';
import * as R from 'ramda';

export async function makeConnection() {
  const connection = await createConnection({
    name:         `test_connection_${Math.random().toString(36).substr(2)}`,
    type:         getVar('DB_TYPE') as any,
    username:     getVar('DB_USER'),
    password:     getVar('DB_PASS'),
    database:     `${getVar('DB_DATABASE')}_test`,
    host:         getVar('DB_HOST'),
    port:        +getVar('DB_PORT'),
    synchronize:  isTrue('DB_SYNC', true),
    logging:      false,
    entities:     [...ALL_ENTITIES],
  });

  return connection;
}

export async function clearAll(connection: Connection) {
  const entities = [
    UserEntity,
    ExampleEntity,
  ];

  for (const entity of entities) {
    const entries = await connection.manager.find(entity);
    const deleteQueries = R.map((entry: any) => connection.manager.delete(entity, entry), entries);
    await Promise.all(deleteQueries);
  }
}
