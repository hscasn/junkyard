import { ExampleEntity } from '../../../src/entities';
import { expect } from 'chai';

describe(`entities/Example unit tests`, () => {

  it('should create an entity', () => {
    expect(() => {
      const e = new ExampleEntity();
      e.id = 1;
      e.property = 'test';
      e.thumbnail = 'another test';
      e.thumbnail_media_type = 'type';
    }).not.to.throw();
  });

});
