// tslint:disable:no-unused-expression
import { setupPassport, makeUserDeserializer, makeUserSerializer,
         makeUserVerifier } from '../../../../src/lib/setupPassport';
import { makeConnection, clearAll } from '../../../utils/testingDatabase';
import { expect } from 'chai';
import { Connection } from 'typeorm';
import { UserEntity } from '../../../../src/entities';
import { UserModel, makeUserModel } from '../../../../src/models/User';
import { makeAuth } from '../../../../src/lib/auth';
import { logger } from '../../../utils/mockedLogger';
import { Ranks } from '../../../../src/lib/userRanks';

describe(`lib/setupPassport integration tests`, function (this: any) {
  this.timeout(20000);

  let connection: Connection = null as any;

  before(async () => {
    connection = await makeConnection();
    await clearAll(connection);
  });

  afterEach(async () => {
    await clearAll(connection);
  });

  describe('makeUserDeserializer', () => {

    it(`should deserialize a valid user`, (done) => {
      const u = new UserEntity();
      u.display_name = 'display name';
      u.email = 'test@email.com';
      u.password = 'password';
      connection.manager.save(UserEntity, u).then((saved) => {
        const deserialize = makeUserDeserializer(connection);

        deserialize(saved.id, (error: any, user: UserModel | boolean) => {
          expect(error).to.be.null;
          if (typeof user === 'boolean') {
            done(`Got ${user} instead of a user model`);
          } else {
            expect(user.displayName).to.eql(u.display_name);
            expect(user.email).to.eql(u.email);
            done();
          }
        });
      });
    });

    it(`should give "false" for user if the user is invalid`, (done) => {
      const deserialize = makeUserDeserializer(connection);

      deserialize(-1, (error: any, user: UserModel | boolean) => {
        expect(error).to.be.null;
        expect(user).to.be.false;
        done();
      });
    });

  });

  describe('makeUserSerializer', () => {

    it(`should serialize a user from a string`, (done) => {
      const serialize = makeUserSerializer();

      serialize('5', (error: any, user: number) => {
        expect(error).to.be.null;
        expect(user).to.eql(5);
        done();
      });
    });

    it(`should serialize a user from a number`, (done) => {
      const serialize = makeUserSerializer();

      serialize(5, (error: any, user: number) => {
        expect(error).to.be.null;
        expect(user).to.eql(5);
        done();
      });
    });

    it(`should serialize a user from a UserModel`, (done) => {
      const serialize = makeUserSerializer();

      const userEntity = new UserEntity();
      userEntity.id = 5;
      userEntity.email = 'test@email.com';
      userEntity.display_name = 'test';
      userEntity.rank = Ranks.Regular;

      const userModel: UserModel = makeUserModel(userEntity);

      serialize(userModel, (error: any, user: number) => {
        expect(error).to.be.null;
        expect(user).to.eql(5);
        done();
      });
    });

  });

  describe('makeUserVerifier', () => {

    it(`should refuse to login if login is disabled`, (done) => {
      const verify = makeUserVerifier(connection, false);
      const email = 'test@email.com';
      const displayName = 'display name';
      const password = 'password123';

      const u = new UserEntity();
      u.display_name = displayName;
      u.email = email;
      u.password = password;

      connection.manager.save(UserEntity, u).then((saved) => {
        verify(email, password, (error, user, options) => {
          expect(error).to.be.null;
          expect(user).to.be.false;
          expect(typeof options).to.eql('object');
          expect(options && options.message).to.include('disabled');
          done();
        });
      });
    });

    it(`should login successfully`, (done) => {
      const verify = makeUserVerifier(connection, true);
      const email = 'test@email.com';
      const displayName = 'display name';
      const password = 'password123';

      const auth = makeAuth(logger, false, '');

      auth.hash(password).then(([didHash, hash]) => {
        const u = new UserEntity();
        u.display_name = displayName;
        u.email = email;
        u.password = hash;

        connection.manager.save(UserEntity, u).then((saved) => {
          verify(email, password, (error, user, options) => {
            expect(error).to.be.null;
            expect(user).to.eql(saved.id);
            expect(options).to.be.undefined;
            done();
          });
        });
      });
    });

    it(`should not login if password is invalid`, (done) => {
      const verify = makeUserVerifier(connection, true);
      const email = 'test@email.com';
      const displayName = 'display name';
      const password = 'password123';

      const auth = makeAuth(logger, false, '');

      auth.hash(password).then(([didHash, hash]) => {
        const u = new UserEntity();
        u.display_name = displayName;
        u.email = email;
        u.password = hash;

        connection.manager.save(UserEntity, u).then((saved) => {
          verify(email, 'wrong password', (error, user, options) => {
            expect(error).to.be.null;
            expect(user).to.be.false;
            expect(typeof options).to.eql('object');
            expect(options && options.message).to.include('Invalid');
            done();
          });
        });
      });
    });

    it(`should not login if email is invalid`, (done) => {
      const verify = makeUserVerifier(connection, true);
      const email = 'test@email.com';
      const displayName = 'display name';
      const password = 'password123';

      const auth = makeAuth(logger, false, '');

      auth.hash(password).then(([didHash, hash]) => {
        const u = new UserEntity();
        u.display_name = displayName;
        u.email = email;
        u.password = hash;

        connection.manager.save(UserEntity, u).then((saved) => {
          verify('wrong email', password, (error, user, options) => {
            expect(error).to.be.null;
            expect(user).to.be.false;
            expect(typeof options).to.eql('object');
            expect(options && options.message).to.include('Invalid');
            done();
          });
        });
      });
    });

  });

  describe('setupPassport', () => {

    it(`should set deserializeUser, serializeUser, and use methods`, (done) => {
      const checkIfDone = (() => {
        let calls = 0;
        return () => {
          calls++;
          if (calls === 3) {
            done();
          }
        };
      })();

      const passport: any = {
        deserializeUser: checkIfDone,
        serializeUser: checkIfDone,
        use: checkIfDone,
      };

      setupPassport(passport, connection);
    });

  });

});
