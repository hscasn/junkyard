import { UserEntity } from '../../../src/entities';
import { expect } from 'chai';
import { Ranks } from '../../../src/lib/userRanks';

describe(`entities/User unit tests`, () => {

  it('should create an entity', () => {
    expect(() => {
      const e = new UserEntity();
      e.id = 1;
      e.email = 'test@email.com';
      e.display_name = 'display name';
      e.password = 'text';
      e.password_token = 'text';
      e.password_token_creation_date = 'text';
      e.rank = Ranks.Regular;
    }).not.to.throw();
  });

});
