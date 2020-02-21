import { Connection } from 'typeorm';
import { Request } from 'express';
import { UserEntity, ExampleEntity } from '../../src/entities';
import { logger } from './mockedLogger';

const getRandomInt = () => ~~(Math.random() * 1000);

const mockUser = (p: object = {}) => {
  const user = new UserEntity();

  user.id = getRandomInt();
  user.email = `test${getRandomInt()}@email.com`;
  user.display_name = `test${getRandomInt()}`;
  user.password = `test${getRandomInt()}`;
  user.password_token = `test${getRandomInt()}`;
  user.password_token_creation_date = (new Date()).toISOString();

  for (const prop in p) {
    if (p.hasOwnProperty(prop)) {
      (user as any)[prop] = (p as any)[prop];
    }
  }

  return user;
};

const mockExample = (p: object = {}) => {
  const example = new ExampleEntity();

  example.id = getRandomInt();
  example.property = `test${getRandomInt()}`;
  example.thumbnail = `test${getRandomInt()}`;
  example.thumbnail_media_type = `test${getRandomInt()}`;

  for (const prop in p) {
    if (p.hasOwnProperty(prop)) {
      (example as any)[prop] = (p as any)[prop];
    }
  }

  return example;
};

const makeRequestMocker = (connection: Connection) => (p: object = {}): Request => ({
  NAME: 'mockRequest',
  db: connection,
  logger,
  ...p,
} as any);

export { makeRequestMocker, mockUser, mockExample };
