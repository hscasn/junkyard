// tslint:disable:no-unused-expression
import { stringifyError } from '../../../../src/lib/stringifyError';
import { expect } from 'chai';

describe(`lib/stringifyError unit tests`, () => {

  it('should keep the properties message and stack, if available', () => {
    const e: any = stringifyError(new Error('my error'));

    const s = JSON.parse(e);

    expect(s.message).to.include('my error');
    expect(typeof s.stack).to.eql('string');
    expect(s.stack.length).to.gte(1);
  });

  it('should return undefined for null, undefined, or empty string', () => {
    [
      null,
      undefined,
      '',
    ].forEach((error: any) => {
      const e = stringifyError(error);
      expect(e).to.be.undefined;
    });
  });

  it('should return an object with a message if receiving a string or other primitive', () => {
    [
      'message',
      123,
      true,
    ].forEach((error: any) => {
      const e: any = stringifyError(error);
      const s = JSON.parse(e);
      expect(s).to.be.eql({ message: error + '' });
    });
  });

});
