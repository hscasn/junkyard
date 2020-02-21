import { example } from '../../../src/models';
import { expect } from 'chai';
import { ExampleEntity } from '../../../src/entities/Example';
import { ExampleModel, ExampleAddModel, ExampleEditModel } from '../../../src/models/Example';

describe(`models/Example unit tests`, () => {

  describe('makeExampleModel', () => {

    it('should create an entity from a valid entity', () => {
      const expected = {
        NAME: 'ExampleModel',
        id: 4,
        property: 'property name',
      };

      const input = new ExampleEntity();
      input.id = expected.id;
      input.property = expected.property.toUpperCase() + '   ';

      const result = example.makeExampleModel(input);

      expect(result).to.eql(expected);
    });

    it('should create an entity from an unsanitized entity, but should sanitize it', () => {
      const expected: ExampleModel = {
        NAME: 'ExampleModel',
        id: 4,
        property: 'property name',
      };

      const input: any = {
        id: expected.id + '',
        property: expected.property.toUpperCase() + '   ',
        extraProp: 1,
      };

      const result = example.makeExampleModel(input);

      expect(result).to.eql(expected);
    });

    it('should throw if model is not valid', () => {
      expect(() => example.makeExampleModel({} as any)).to.throw();
    });

  });

  describe('makeExampleEditModel', () => {

    it('should create an entity from an unsanitized entity, but should sanitize it', () => {
      const expected: ExampleEditModel = {
        NAME: 'ExampleEditModel',
        id: 4,
        property: 'property name',
      };

      const input: any = {
        id: expected.id + '',
        property: expected.property.toUpperCase() + '   ',
        extraProp: 1,
      };

      const result = example.makeExampleEditModel(input);

      expect(result).to.eql(expected);
    });

    it('should throw if model is not valid', () => {
      expect(() => example.makeExampleEditModel({} as any)).to.throw();
    });

  });

  describe('makeExampleAddModel', () => {

    it('should create an entity from an unsanitized entity, but should sanitize it', () => {
      const expected: ExampleAddModel = {
        NAME: 'ExampleAddModel',
        property: 'property name',
        thumbnail: 'thumbnailContent',
        thumbnailMediaType: 'thumbnailtype',
      };

      const input: any = {
        NAME: 'ExampleAddModel',
        property: expected.property.toUpperCase() + '   ',
        thumbnail: '    ' + expected.thumbnail,
        thumbnailMediaType: '   ' + expected.thumbnailMediaType.toUpperCase(),
        extraProp: 1,
      };

      const result = example.makeExampleAddModel(input);

      expect(result).to.eql(expected);
    });

    it('should throw if model is not valid', () => {
      expect(() => example.makeExampleAddModel({} as any)).to.throw();
    });

  });

});
