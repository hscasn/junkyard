import { error, data } from '../../../../src/lib/apiResponses';
import { expect } from 'chai';
import * as HttpCodes from 'http-status-codes';

describe(`lib/apiResponses unit tests`, () => {

  describe('error', () => {

    it(`should create error response even without message`, () => {
      const e = error(HttpCodes.BAD_GATEWAY);
      expect(e).to.be.eql({
        error: HttpCodes.BAD_GATEWAY,
        errorTitle: 'Bad Gateway',
        message: null,
        data: null,
      });
    });

    it(`should create error response with message`, () => {
      const e = error(HttpCodes.BAD_GATEWAY, 'error message');
      expect(e).to.be.eql({
        error: HttpCodes.BAD_GATEWAY,
        errorTitle: 'Bad Gateway',
        message: 'error message',
        data: null,
      });
    });

  });

  describe('data', () => {

    it(`should create data response`, () => {
      const e = data({ ok: true });
      expect(e).to.be.eql({
        error: null,
        errorTitle: null,
        message: null,
        data: { ok: true },
      });
    });

  });

});
