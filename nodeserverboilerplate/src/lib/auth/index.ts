import * as bcrypt from 'bcrypt-nodejs';

import { Logger } from '../logger';
import { misc } from '../../config/misc';
import { Ranks, is as rankBelongsTo } from '../userRanks';
import { Middleware } from '../../interfaces';

export type VerifyFn = (password: string, hash: string) => Promise<boolean>;
export type HashFn = (password: string) => Promise<[boolean, string]>;
export type AuthorizeFn = (requiredRank: number[]) => Middleware;

export interface Auth {
  NAME: string;
  hash: HashFn;
  verify: VerifyFn;
  authorize: AuthorizeFn;
  middleware: Middleware;
}

/**
 * Returns false if the password does not match, true if it matches. Can throw errors
 */
export async function verify(password: string, hash: string): Promise<boolean> {
  return await new Promise((resolve: ((didMatch: boolean) => void)) => {
    bcrypt.compare(password, hash, (err: Error, didMatch: boolean) => {
      /* istanbul ignore if: Difficult to test */
      if (err) {
        resolve(false);
        return;
      }
      resolve(didMatch);
    });
  });
}

export function makeAuth(logger: Logger, loginDisabled: boolean, failurePath: string): Auth {

  const that: Auth = {
    NAME: 'auth',

    /**
     * Used to hash a password
     */
    hash: (password: string): Promise<[boolean, string]> => {
      return new Promise((resolve, reject) => {
        bcrypt.genSalt(misc.saltRounds, (err, salt) => {
          /* istanbul ignore if: difficult to test */
          if (err) {
            logger.error(`Error at GENSALT auth: ${err.message} ${err.stack}`);
            resolve([false, '']);
            return;
          }
          bcrypt.hash(password, salt, () => { }, (e, hash) => {
            /* istanbul ignore if: difficult to test */
            if (e) {
              logger.error(`Error at HASH auth: ${e.message} ${e.stack}`);
              resolve([false, '']);
              return;
            }
            resolve([true, hash]);
          });
        });
      });
    },

    verify,

    /**
     * Attaches the methods 'verify' and 'hash' to the context of a route
     */
    middleware: async (req, res, next) => {
      req.auth = that;
      next();
    },

    /**
     * Used to filter the access to areas based on user ranks: in other words, it is an authorization middleware
     * Given a required rank, it will check if the current user meets the criteria: if he does, the route calls the
     * next middleware; if not, it redirects to the 'failure path' page
     */
    authorize: (requiredRank: Ranks[]): Middleware => {
      return async (req, res, next) => {

        if (loginDisabled) {
          return next();
        }

        let currRank: Ranks;

        if (req && req.isAuthenticated && req.isAuthenticated() && req.user) {
          currRank = typeof req.user.rank === 'number' ? req.user.rank : Ranks.S_NotRegistered;
        } else {
          currRank = Ranks.S_NotRegistered;
        }

        if (rankBelongsTo(currRank, requiredRank)) {
          return next();
        } else {
          logger.warn(`User ${req.user} tried to access restricted area ${req.originalUrl}`);
          res.redirect(failurePath);
          return;
        }
      };
    },
  };

  return that;

}
