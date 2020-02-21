import { initializeDb } from '../../../../src/lib/dbInitializer';
import { expect } from 'chai';
import { makeConnection, clearAll } from '../../../utils/testingDatabase';
import { Connection } from 'typeorm';
import { UserEntity } from '../../../../src/entities';

describe(`lib/dbInitializer integration tests`, function (this: any) {
  this.timeout(20000);

  let connection: Connection = null as any;

  before(async () => {
    connection = await makeConnection();
    await clearAll(connection);
  });

  afterEach(async () => {
    await clearAll(connection);
  });

  describe('initializeDb', () => {

    const mockedLogger: any = {
      fatal: () => { /* */ },
      error: () => { /* */ },
      warn: () => { /* */ },
      info: () => { /* */ },
      debug: () => { /* */ },
      trace: () => { /* */ },
    };

    const mockedHash = (str: string) => Promise.resolve([true, str] as [boolean, string]);

    it(`should skip the default admin creation`, async () => {
      const config: any = {
        createDefAdmin: false,
      };
      await initializeDb(connection, config, mockedLogger, mockedHash);
      const users = await connection.manager.find(UserEntity);
      expect(users.length).to.eql(0);
    });

    it(`should create a default admin`, async () => {
      const config: any = {
        createDefAdmin: true,
        defAdminEmail: 'admin@email.com',
        defAdminPassword: 'password1',
      };
      await initializeDb(connection, config, mockedLogger, mockedHash);
      const users = await connection.manager.find(UserEntity);
      expect(users.length).to.eql(1);
      const admin = users[0];
      expect(admin.email).to.eql(config.defAdminEmail);
      expect(admin.password).to.eql(config.defAdminPassword);
    });

    it(`should not create a default admin if there are users in the database`, async () => {
      const config: any = {
        createDefAdmin: true,
        defAdminEmail: 'admin@email.com',
        defAdminPassword: 'password1',
      };

      const u = new UserEntity();
      u.display_name = 'display name';
      u.email = 'test@email.com';
      u.password = 'password';
      await connection.manager.save(UserEntity, u);

      await initializeDb(connection, config, mockedLogger, mockedHash);

      const users = await connection.manager.find(UserEntity);

      expect(users.length).to.eql(1);
      const existingUser = users[0];
      expect(existingUser.email).to.eql(u.email);
    });

  });

});
