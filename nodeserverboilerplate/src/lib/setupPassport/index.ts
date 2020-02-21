/**
 * Configuration for passport. It includes special cases for signing up and
 * logging in.
 */
import { Strategy, VerifyFunction } from 'passport-local';
import * as Passport from 'passport';
import { Request } from 'express';

import { makeUsersManager } from '../../managers/user';
import { misc } from '../../config/misc';
import { UserModel } from '../../models/User';
import { Connection } from 'typeorm';

const makeUserDeserializer = (
  connection: Connection,
) => (
  user: number,
  next: ((error: any, user: UserModel | boolean) => void),
) => {

  const userManager = makeUsersManager({ db: connection } as Request); // Mock context

  userManager.getOne(user).then((u) => {
    if (u) {
      next(null, u);
    } else {
      next(null, false);
    }
  });
};

const makeUserSerializer = (
  // empty
) => (
  user: UserModel | string | number,
  next: ((error: any, user: number) => void),
) => {
  if (typeof user === 'string' || typeof user === 'number') {
    next(null, +user);
  } else {
    next(null, user.id);
  }
};

const makeUserVerifier = (connection: Connection, enableLogin: boolean): VerifyFunction => (email, password, done) => {

  if (!enableLogin) {
    done(null, false, {
      message: 'Login is disabled',
    });
    return;
  }

  (async () => {
    const userManager = makeUsersManager({ db: connection } as Request); // Mock context
    const user = await userManager.verify(email, password);
    if (user) {
      done(null, user.id);
      return;
    } else {
      done(null, false, {
        message: 'Invalid email or password',
      });
      return;
    }
  })();
};

/**
 * This function sets up the passport module to be used with express
 * @param passport is the passport module
 * @param query is the middleware for querying the database
 */
export function setupPassport(passport: typeof Passport, connection: Connection) {

  passport.deserializeUser(makeUserDeserializer(connection));

  passport.serializeUser(makeUserSerializer());

  passport.use('local-login', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
  }, makeUserVerifier(connection, misc.enableLogin)));
}

export {
  makeUserDeserializer,
  makeUserSerializer,
  makeUserVerifier,
};
