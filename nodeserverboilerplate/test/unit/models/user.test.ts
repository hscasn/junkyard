import { user } from '../../../src/models';
import { expect } from 'chai';
import { Ranks, getRankName } from '../../../src/lib/userRanks';
import { UserEntity } from '../../../src/entities/User';
import { UserModel, UserEditModel, AdminUserEditModel, UserAddModel } from '../../../src/models/User';

describe(`models/User unit tests`, () => {

  describe('makeUserModel', () => {

    it('should create an entity from a valid entity', () => {
      const expected = {
        NAME: 'UserModel',
        id: 4,
        email: 'test@email.com',
        displayName: 'Display Name',
        rank: Ranks.Regular,
        rankName: getRankName(Ranks.Regular),
      };

      const input = new UserEntity();
      input.id = expected.id;
      input.email = expected.email;
      input.display_name = expected.displayName;
      input.password = 'pwd1';
      input.password_token = 'token';
      input.password_token_creation_date = '2018-05-26T19:15:24.214Z';
      input.rank = expected.rank;

      const result = user.makeUserModel(input);

      expect(result).to.eql(expected);
    });

    it('should create an entity from an unsanitized entity, but should sanitize it', () => {
      const expected: UserModel = {
        NAME: 'UserModel',
        id: 4,
        email: 'test@email.com',
        displayName: 'Display Name',
        rank: Ranks.Regular,
        rankName: getRankName(Ranks.Regular),
      };

      const input: any = {
        id: expected.id + '',
        email: expected.email.toUpperCase() + '   ',
        display_name: '  ' + expected.displayName + '  ',
        password: 'pwd1',
        password_token: 'token',
        password_token_creation_date: '2018-05-26T19:15:24.214Z',
        rank: expected.rank + '',
        extraProp: 1,
      };

      const result = user.makeUserModel(input);

      expect(result).to.eql(expected);
    });

    it('should throw if model is not valid', () => {
      expect(() => user.makeUserModel({} as any)).to.throw();
    });

  });

  describe('makeUserAddModel', () => {

    it('should create an entity from an unsanitized entity, but should sanitize it', () => {
      const expected: UserAddModel = {
        NAME: 'UserAddModel',
        email: 'email@test.com',
        password: ' Password123! ',
      };

      const input: any = {
        email: ' EMAIL@TEST.COM  ',
        password: ' Password123! ',
      };

      const result = user.makeUserAddModel(input);

      expect(result).to.eql(expected);
    });

    it('should throw if model is not valid', () => {
      expect(() => user.makeUserAddModel({} as any)).to.throw();
    });

  });

  describe('makeUserEditModel', () => {

    it('should create an entity from an unsanitized entity, but should sanitize it', () => {
      const expected: UserEditModel = {
        NAME: 'UserEditModel',
        id: 4,
        displayName: 'Display Name',
      };

      const input: any = {
        id: expected.id + '',
        email: ' EMAIL@TEST.COM  ',
        displayName: '  ' + expected.displayName + '  ',
        password: 'pwd1',
        passwordToken: 'token',
        passwordTokenCreationDate: '2018-05-26T19:15:24.214Z',
        rank: Ranks.Regular + '',
      };

      const result = user.makeUserEditModel(input);

      expect(result).to.eql(expected);
    });

    it('should throw if model is not valid', () => {
      expect(() => user.makeUserEditModel({} as any)).to.throw();
    });

  });

  describe('makeAdminUserEditModel', () => {

    it('should create an entity from an unsanitized entity, but should sanitize it', () => {
      const expected: AdminUserEditModel = {
        NAME: 'AdminUserEditModel',
        id: 4,
        displayName: 'Display Name',
        rank: Ranks.Regular,
      };

      const input: any = {
        id: expected.id + '',
        email: ' TEST@EMAIL.COM  ',
        displayName: '  ' + expected.displayName + '  ',
        password: 'pwd1',
        passwordToken: 'token',
        passwordTokenCreationDate: '2018-05-26T19:15:24.214Z',
        rank: expected.rank + '',
      };

      const result = user.makeAdminUserEditModel(input);

      expect(result).to.eql(expected);
    });

    it('should throw if model is not valid', () => {
      expect(() => user.makeAdminUserEditModel({} as any)).to.throw();
    });

  });

});
