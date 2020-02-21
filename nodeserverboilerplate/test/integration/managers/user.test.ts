// tslint:disable:no-unused-expression
import * as R from 'ramda';
import { Request } from 'express';
import * as moment from 'moment';
import { makeUsersManager } from '../../../src/managers/user';
import { expect } from 'chai';
import { makeConnection, clearAll } from '../../utils/testingDatabase';
import { Connection } from 'typeorm';
import { UserEntity } from '../../../src/entities';
import { makeRequestMocker, mockUser } from '../../utils/managerUtils';
import {
  makeUserModel,
  makeUserEditModel,
  makeAdminUserEditModel,
  UserAddModel,
  makeUserAddModel,
} from '../../../src/models/User';
import { Ranks } from '../../../src/lib/userRanks';
import { makeAuth } from '../../../src/lib/auth';

describe(`managers/user integration tests`, function (this: any) {
  this.timeout(20000);

  let connection: Connection = null as any;
  const getConnection = () => Promise.resolve(connection);
  let makeMockedReq: (p?: object) => Request = null as any;

  before(async () => {
    connection = await makeConnection();
    await clearAll(connection);
    makeMockedReq = makeRequestMocker(connection);
  });

  afterEach(async () => {
    await clearAll(connection);
  });

  describe('getOne', () => {

    it(`should return undefined for not existing entry`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const user = await manager.getOne(1);

      expect(user).to.be.undefined;
    });

    it(`should get one entry`, async () => {
      let chosenId = 0;
      let chosenDisplayName: string = null as any;

      for (const id of R.range(1, 5)) {
        const u = mockUser();
        await connection.manager.save(UserEntity, u);
        if (u.id > chosenId) {
          chosenId = u.id;
          chosenDisplayName = u.display_name;
        }
      }

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const user = await manager.getOne(chosenId);

      expect(user && user.displayName).to.eql(chosenDisplayName);
    });

  });

  describe('getAll', () => {

    it(`should return an empty array if there are no entries`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const user = await manager.getOne(1);

      expect(user).to.be.undefined;
    });

    it(`should get all entries`, async () => {
      const propertiesList = [];

      for (const id of R.range(1, 5)) {
        const u = mockUser();
        await connection.manager.save(UserEntity, u);
        propertiesList.push(u.display_name);
      }

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const users = await manager.getAll();

      expect(users.length).to.eql(4);
      expect(R.map((e) => e.displayName, users)).to.eql(propertiesList);
    });

  });

  describe('getCount', () => {

    it(`should return 0 if there are no users`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const result = await manager.getCount();

      expect(result).to.eql(0);
    });

    it(`should get the correct count`, async () => {
      for (const id of R.range(1, 5)) {
        const u = mockUser();
        await connection.manager.save(UserEntity, u);
      }

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const result = await manager.getCount();

      expect(result).to.eql(4);
    });

  });

  describe('insertUser', () => {

    it(`should add a new entry`, async () => {
      const input = {
        email: 'test@email.com',
        password: 'password123',
      };

      const u: UserAddModel = makeUserAddModel(input);

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const user = await manager.insertUser(u);

      const expectedEntity = new UserEntity();
      expectedEntity.id = (user && user.id) as any;
      expectedEntity.email = input.email;
      expectedEntity.display_name = input.email;
      expectedEntity.rank = Ranks.Regular;

      expect(user).to.eql(makeUserModel(expectedEntity));
    });

    it(`should return undefined if error happens`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const r = await manager.insertUser(null as any);
      const s = await manager.insertUser({} as any);

      expect(r).to.be.undefined;
      expect(s).to.be.undefined;
    });

    it(`should return undefined if the db throw`, async () => {
      const input = {
        email: 'test@email.com',
        password: 'password123',
      };

      const u: UserAddModel = makeUserAddModel(input);

      const req = makeMockedReq({});

      const oldSave = (req as any).db.manager.save;
      (req as any).db.manager.save = () => { throw new Error(); };

      const manager = makeUsersManager(req);

      const user = await manager.insertUser(u);

      (req as any).db.manager.save = oldSave;

      expect(user).to.be.undefined;
    });

  });

  describe('insertAdmin', () => {

    it(`should add a new entry`, async () => {
      const input = {
        email: 'test@email.com',
        password: 'password123',
      };

      const u: UserAddModel = makeUserAddModel(input);

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const user = await manager.insertAdmin(u);

      const expectedEntity = new UserEntity();
      expectedEntity.id = (user && user.id) as any;
      expectedEntity.email = input.email;
      expectedEntity.display_name = input.email;
      expectedEntity.rank = Ranks.Admin;

      expect(user).to.eql(makeUserModel(expectedEntity));
    });

    it(`should return undefined if error happens`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const r = await manager.insertAdmin(null as any);
      const s = await manager.insertAdmin({} as any);

      expect(r).to.be.undefined;
      expect(s).to.be.undefined;
    });

    it(`should return undefined if the db throw`, async () => {
      const input = {
        email: 'test@email.com',
        password: 'password123',
      };

      const u: UserAddModel = makeUserAddModel(input);

      const req = makeMockedReq({});

      const oldSave = (req as any).db.manager.save;
      (req as any).db.manager.save = () => { throw new Error(); };

      const manager = makeUsersManager(req);

      const user = await manager.insertAdmin(u);

      (req as any).db.manager.save = oldSave;

      expect(user).to.be.undefined;
    });

  });

  describe('editExisting', () => {

    it(`should edit an entry`, async () => {
      const insertedUser = await connection.manager.save(UserEntity, mockUser());

      const editUser = makeUserEditModel({
        id: insertedUser.id,
        displayName: 'new displayName',
        rank: Ranks.Admin,
      } as any);

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      await manager.editExisting(editUser);

      const inDb = await connection.manager.findOne(UserEntity, insertedUser.id);

      expect(inDb && inDb.display_name).to.eql('new displayName');
      expect(inDb && inDb.rank).to.eql(Ranks.Regular);
    });

    it(`should return undefined if the entry does not exist`, async () => {
      const editUser = makeUserEditModel({
        id: 100,
        displayName: 'new displayName',
      } as any);

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const result = await manager.editExisting(editUser);

      expect(result).to.be.undefined;
    });

    it(`should return undefined if error happens`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const r = await manager.editExisting(null as any);
      const s = await manager.editExisting({} as any);

      expect(r).to.be.undefined;
      expect(s).to.be.undefined;
    });

  });

  describe('adminEditExisting', () => {

    it(`should edit an entry`, async () => {
      const insertedUser = await connection.manager.save(UserEntity, mockUser());

      const editUser = makeAdminUserEditModel({
        id: insertedUser.id,
        displayName: 'new displayName',
        rank: Ranks.Admin,
      });

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      await manager.adminEditExisting(editUser);

      const inDb = await connection.manager.findOne(UserEntity, insertedUser.id);

      expect(inDb && inDb.display_name).to.eql('new displayName');
      expect(inDb && inDb.rank).to.eql(Ranks.Admin);
    });

    it(`should return undefined if the entry does not exist`, async () => {
      const editUser = makeAdminUserEditModel({
        id: 100,
        displayName: 'new displayName',
        rank: Ranks.Admin,
      });

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const result = await manager.adminEditExisting(editUser);

      expect(result).to.be.undefined;
    });

    it(`should return undefined if error happens`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const r = await manager.adminEditExisting(null as any);
      const s = await manager.adminEditExisting({} as any);

      expect(r).to.be.undefined;
      expect(s).to.be.undefined;
    });

  });

  describe('changePassword', () => {

    it(`should edit an entry`, async () => {
      const insertedUser = await connection.manager.save(UserEntity, mockUser());

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const result = await manager.changePassword(insertedUser.email, 'new password');
      expect(result).to.be.true;

      const inDb = await connection.manager.findOne(UserEntity, insertedUser.id);
      expect(inDb && inDb.password).to.eql('new password');
    });

    it(`should return false if the entry does not exist`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const result = await manager.changePassword('bad email', 'new password');
      expect(result).to.be.false;
    });

  });

  describe('setPasswordToken', () => {

    it(`should edit an entry`, async () => {
      const insertedUser = await connection.manager.save(UserEntity, mockUser());

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const result = await manager.setPasswordToken(insertedUser.email, 'new token');
      expect(result).to.be.true;

      const inDb = await connection.manager.findOne(UserEntity, insertedUser.id);
      expect(inDb && inDb.password_token).to.eql('new token');

      const tokenCreationDateIsValid = moment(inDb && inDb.password_token_creation_date)
        .isBetween(moment().subtract(5, 'minutes'), moment().add(5, 'minutes'));
      expect(tokenCreationDateIsValid).to.be.true;
    });

    it(`should return false if the entry does not exist`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const result = await manager.setPasswordToken('bad email', 'new token');
      expect(result).to.be.false;
    });

  });

  describe('isTokenValid', () => {

    it(`should return true if the token is good`, async () => {
      const mockedUser = mockUser();
      mockedUser.password_token = 'token';
      mockedUser.password_token_creation_date = moment().toISOString();
      const insertedUser = await connection.manager.save(UserEntity, mockedUser);

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const limitDate = moment().add(1, 'hour').toDate();

      const isTokenValid = await manager.isTokenValid(mockedUser.email, mockedUser.password_token, limitDate);

      expect(isTokenValid).to.be.true;
    });

    it(`should return false if the token is expired`, async () => {
      const mockedUser = mockUser();
      mockedUser.password_token = 'token';
      mockedUser.password_token_creation_date = moment().toISOString();
      const insertedUser = await connection.manager.save(UserEntity, mockedUser);

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const limitDate = moment().subtract(1, 'hour').toDate();

      const isTokenValid = await manager.isTokenValid(mockedUser.email, mockedUser.password_token, limitDate);

      expect(isTokenValid).to.be.false;
    });

    it(`should return false if the email does not exist`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const limitDate = moment().add(1, 'week').toDate();

      const isTokenValid = await manager.isTokenValid('bad email', 'bad token', limitDate);

      expect(isTokenValid).to.be.false;
    });

    it(`should return false if the token is invalid`, async () => {
      const mockedUser = mockUser();
      mockedUser.password_token = 'token';
      mockedUser.password_token_creation_date = moment().toISOString();
      const insertedUser = await connection.manager.save(UserEntity, mockedUser);

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const limitDate = moment().add(1, 'week').toDate();

      const isTokenValid = await manager.isTokenValid(mockedUser.email, 'bad token', limitDate);

      expect(isTokenValid).to.be.false;
    });

  });

  describe('remove', () => {

    it(`should remove an entry`, async () => {
      let chosenId = 0;

      for (const id of R.range(1, 5)) {
        const u = mockUser();
        await connection.manager.save(UserEntity, u);
        if (u.id > chosenId) {
          chosenId = u.id;
        }
      }

      const req = makeMockedReq({});
      const manager = makeUsersManager(req);

      const inDb1 = await connection.manager.find(UserEntity);
      expect(inDb1.length).to.eql(4);

      const result = await manager.remove(chosenId);
      expect(result).to.be.true;

      const inDb2 = await connection.manager.find(UserEntity);
      expect(inDb2.length).to.eql(3);

      const entryIsInDb = !!R.find(R.propEq('id', chosenId), inDb2);
      expect(entryIsInDb).to.be.false;
    });

    it(`should return false if error happens`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const r = await manager.remove(null as any);
      const s = await manager.remove({} as any);
      const t = await manager.remove(1 as any);

      expect(r).to.be.false;
      expect(s).to.be.false;
      expect(t).to.be.false;
    });

    it(`should return false if the db throws`, async () => {
      let chosenId = 0;

      for (const id of R.range(1, 5)) {
        const u = mockUser();
        await connection.manager.save(UserEntity, u);
        if (u.id > chosenId) {
          chosenId = u.id;
        }
      }

      const req = makeMockedReq({});

      const oldRemove = (req as any).db.manager.remove;
      (req as any).db.manager.remove = () => { throw new Error(); };

      const manager = makeUsersManager(req);

      const t = await manager.remove(chosenId);

      (req as any).db.manager.remove = oldRemove;

      expect(t).to.be.false;
    });

  });

  describe('emailExists', () => {

    it(`should return false for non existing entry`, async () => {
      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const result = await manager.emailExists('bad email');

      expect(result).to.be.false;
    });

    it(`should return true for existing entry`, async () => {
      const u = mockUser();
      await connection.manager.save(UserEntity, u);

      const req = makeMockedReq({});

      const manager = makeUsersManager(req);

      const result = await manager.emailExists(u.email);

      expect(result).to.be.true;
    });

  });

  describe('verify', () => {

    it(`should get one entry`, async () => {
      const p = 'password123';
      const req = makeMockedReq({});

      const auth = makeAuth((req as any).logger, false, '');
      const [didHash, hashed] = await auth.hash(p);

      const u = mockUser();
      u.password = hashed;
      await connection.manager.save(UserEntity, u);

      const manager = makeUsersManager(req);

      const user = await manager.verify(u.email, p);

      expect(user && user.email).to.eql(u.email);
    });

    it(`should return undefined if password is wrong`, async () => {
      const p = 'password123';
      const req = makeMockedReq({});

      const auth = makeAuth((req as any).logger, false, '');
      const [didHash, hashed] = await auth.hash(p);

      const u = mockUser();
      u.password = hashed;
      await connection.manager.save(UserEntity, u);

      const manager = makeUsersManager(req);

      const user = await manager.verify(u.email, 'wrong password');

      expect(user).to.be.undefined;
    });

    it(`should return undefined if email is wrong`, async () => {
      const p = 'password123';
      const req = makeMockedReq({});

      const auth = makeAuth((req as any).logger, false, '');
      const [didHash, hashed] = await auth.hash(p);

      const u = mockUser();
      u.password = hashed;
      await connection.manager.save(UserEntity, u);

      const manager = makeUsersManager(req);

      const user = await manager.verify('wrong email', p);

      expect(user).to.be.undefined;
    });

  });

});
