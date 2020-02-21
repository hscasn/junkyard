// tslint:disable:no-unused-expression
import { verify, makeAuth } from '../../../../src/lib/auth';
import { expect } from 'chai';
import { logger } from '../../../utils/mockedLogger';
import * as bcrypt from 'bcrypt-nodejs';
import { Ranks } from '../../../../src/lib/userRanks';

describe(`lib/auth unit tests`, function (this: any) {
  describe('verify', () => {

    it(`should approve valid hash`, (done) => {
      const key = 'word';
      bcrypt.hash(key, '', () => {}, (err, hash) => {
        verify(key, hash)
          .then((didMatch) => {
            if (didMatch) {
              done();
            } else {
              done('Should not have been approved');
            }
          });
      });
    });

    it(`should not approve valid hash`, (done) => {
      const key = 'word';
      bcrypt.hash('wrong word', '', () => {}, (err, hash) => {
        verify(key, hash)
          .then((didMatch) => {
            if (didMatch) {
              done('Should have been approved');
            } else {
              done();
            }
          });
      });
    });

  });

  describe('makeAuth', () => {

    describe('hash', () => {

      it(`should successfully hash`, (done) => {
        const key = 'word';
        makeAuth(logger, false, '')
          .hash(key)
          .then(([didHash, hash]) => {
            expect(didHash).to.be.true;
            bcrypt.compare(key, hash, (err, areSame) => {
              if (areSame) {
                done();
              } else {
                done('Hashed, but the hash is invalid');
              }
            });
          })
          .catch((e) => {
            done(e);
          });
      });
    });

    describe('middleware', () => {

      it('should set the verify and hash functions in the request and call next function', (done) => {
        const req: any = {};
        makeAuth(logger, false, '')
          .middleware(req, {} as any, () => {
            expect(req.auth.NAME).to.eql('auth');
            expect(typeof req.auth.hash).to.eql('function');
            expect(typeof req.auth.verify).to.eql('function');
            done();
          });
      });

    });

    describe('authorize', () => {

      it('should call next function if login is disabled', (done) => {
        const req: any = {};
        const middleware = makeAuth(logger, true, '').authorize([]);
        middleware(req, {} as any, () => {
          done();
        });
      });

      it('should accept user even if not authenticated', (done) => {
        const req: any = {
          isAuthenticated: undefined,
        };
        const middleware = makeAuth(logger, false, '').authorize([Ranks.S_NotRegistered]);
        middleware(req, {} as any, () => {
          done();
        });
      });

      it('authenticated user without rank should be considered not registered', (done) => {
        const req: any = {
          isAuthenticated: () => true,
        };
        const middleware = makeAuth(logger, false, '').authorize([Ranks.S_NotRegistered]);
        middleware(req, {} as any, () => {
          done();
        });
      });

      it('should accept not authenticated user', (done) => {
        const req: any = {
          isAuthenticated: () => true,
          user: { rank: Ranks.S_NotRegistered },
        };
        const middleware = makeAuth(logger, false, '').authorize([Ranks.S_NotRegistered]);
        middleware(req, { redirect: () => done('should not have failed') } as any, () => {
          done();
        });
      });

      it('should accept regular user', (done) => {
        const req: any = {
          isAuthenticated: () => true,
          user: { rank: Ranks.Regular },
        };
        const middleware = makeAuth(logger, false, '').authorize([Ranks.S_Registered]);
        middleware(req, { redirect: () => done('should not have failed') } as any, () => {
          done();
        });
      });

      it('should accept regular admin (rank === 0)', (done) => {
        const req: any = {
          isAuthenticated: () => true,
          user: { rank: Ranks.Admin },
        };
        const middleware = makeAuth(logger, false, '').authorize([Ranks.S_Registered]);
        middleware(req, { redirect: () => done('should not have failed') } as any, () => {
          done();
        });
      });

      it('should not accept unauthorized user', (done) => {
        const req: any = {
          isAuthenticated: () => true,
          user: { rank: Ranks.Regular },
        };
        const res: any = {
          redirect: () => {
            done();
          },
        };
        const middleware = makeAuth(logger, false, '').authorize([Ranks.Admin]);
        middleware(req, res, () => {
          done('Should have not been accepted');
        });
      });

    });
  });
});
