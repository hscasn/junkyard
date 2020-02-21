// tslint:disable:no-unused-expression
import * as HttpCodes from 'http-status-codes';
import { Request, Response } from 'express';
import { expect } from 'chai';
import { controller } from '../../../../../src/controllers/api/clientLogger';
import { stringifyError } from '../../../../../src/lib/stringifyError';

describe(`controllers/api/clientLogger unit tests`, () => {

  before(async () => {
  });

  afterEach(async () => {
  });

  describe('get', () => {

    it('should log an stringified Error object', (done) => {
      let failed = false;
      let loggerCalled = false;

      const req: Request = {
        params: {
          level: 'warn',
        },
        body: {
          error: stringifyError(new Error('this is an error')),
        },
        logger: {
          warn: (errorCode: number, errorMessage: string) => {
            done('Should not have been called');
            failed = true;
          },
          clientWarn: () => {
            loggerCalled = true;
          },
        },
      } as any;

      const json = (response: any) => {
        if (failed)
          return;

        expect(response.data.message).to.include('this is an error');
        expect(loggerCalled).to.be.true;

        done();
      };

      const res: Response = {
        json,
        error: (errorCode: number, errorMessage: string) => {
          done('Should not have been called');
          failed = true;
        },
      } as any;

      controller.get(req, res, () => { /* */ });
    });

    it('should log an error with message and stack', (done) => {
      let failed = false;
      let loggerCalled = false;

      const req: Request = {
        params: {
          level: 'warn',
        },
        body: {
          error: stringifyError(JSON.stringify({
            message: 'this is an error',
            stack: 'this is a stack',
          })),
        },
        logger: {
          warn: (errorCode: number, errorMessage: string) => {
            done('Should not have been called');
            failed = true;
          },
          clientWarn: () => {
            loggerCalled = true;
          },
        },
      } as any;

      const json = (response: any) => {
        if (failed)
          return;

        expect(response.data.message).to.include('this is an error');
        expect(response.data.message).to.include('this is a stack');
        expect(loggerCalled).to.be.true;

        done();
      };

      const res: Response = {
        json,
        error: (errorCode: number, errorMessage: string) => {
          done('Should not have been called');
          failed = true;
        },
      } as any;

      controller.get(req, res, () => { /* */ });
    });

    it('should log errors even without stack', (done) => {
      let failed = false;
      let loggerCalled = false;

      const req: Request = {
        params: {
          level: 'warn',
        },
        body: {
          error: stringifyError(JSON.stringify({
            message: 'this is an error',
          })),
        },
        logger: {
          warn: (errorCode: number, errorMessage: string) => {
            done('Should not have been called');
            failed = true;
          },
          clientWarn: () => {
            loggerCalled = true;
          },
        },
      } as any;

      const json = (response: any) => {
        if (failed)
          return;

        expect(response.data.message).to.include('this is an error');
        expect(loggerCalled).to.be.true;

        done();
      };

      const res: Response = {
        json,
        error: (errorCode: number, errorMessage: string) => {
          done('Should not have been called');
          failed = true;
        },
      } as any;

      controller.get(req, res, () => { /* */ });
    });

    it('should return a bad request for invalid parameters', (done) => {
      const req: Request = {
        params: {
        },
        body: {
          error: stringifyError(new Error('this is an error')),
        },
      } as any;

      const res: Response = {
        error: (errorCode: number, errorMessage: string) => {
          expect(errorCode).to.eql(HttpCodes.BAD_REQUEST);
          expect(errorMessage).to.include('level');
          done();
        },
      } as any;

      controller.get(req, res, () => { /* */ });
    });

    it('should return a bad request for invalid body', (done) => {
      const req: Request = {
        params: {
          level: 'warn',
        },
        body: {
        },
      } as any;

      const res: Response = {
        error: (errorCode: number, errorMessage: string) => {
          expect(errorCode).to.eql(HttpCodes.BAD_REQUEST);
          expect(errorMessage).to.include('error');
          done();
        },
      } as any;

      controller.get(req, res, () => { /* */ });
    });

    it('should return a bad request for unknown level', (done) => {
      const req: Request = {
        params: {
          level: 'no?',
        },
        body: {
          error: stringifyError(new Error('this is an error')),
        },
      } as any;

      const res: Response = {
        error: (errorCode: number, errorMessage: string) => {
          expect(errorCode).to.eql(HttpCodes.BAD_REQUEST);
          expect(errorMessage).to.include('Invalid level');
          done();
        },
      } as any;

      controller.get(req, res, () => { /* */ });
    });

    it('should log with level "error"', (done) => {

      const req: Request = {
        params: {
          level: 'error',
        },
        body: {
          error: stringifyError(new Error('this is an error')),
        },
        logger: {
          clientError: () => done(),
        },
      } as any;

      const res: Response = { json: (response: any) => { /* */ } } as any;

      controller.get(req, res, () => { /* */ });
    });

    it('should log with level "warn"', (done) => {

      const req: Request = {
        params: {
          level: 'warn',
        },
        body: {
          error: stringifyError(new Error('this is an error')),
        },
        logger: {
          clientWarn: () => done(),
        },
      } as any;

      const res: Response = { json: (response: any) => { /* */ } } as any;

      controller.get(req, res, () => { /* */ });
    });

    it('should log with level "info"', (done) => {

      const req: Request = {
        params: {
          level: 'info',
        },
        body: {
          error: stringifyError(new Error('this is an error')),
        },
        logger: {
          clientInfo: () => done(),
        },
      } as any;

      const res: Response = { json: (response: any) => { /* */ } } as any;

      controller.get(req, res, () => { /* */ });
    });

    it('should log with level "debug"', (done) => {

      const req: Request = {
        params: {
          level: 'debug',
        },
        body: {
          error: stringifyError(new Error('this is an error')),
        },
        logger: {
          clientDebug: () => done(),
        },
      } as any;

      const res: Response = { json: (response: any) => { /* */ } } as any;

      controller.get(req, res, () => { /* */ });
    });

    it('should log with level "trace"', (done) => {

      const req: Request = {
        params: {
          level: 'trace',
        },
        body: {
          error: stringifyError(new Error('this is an error')),
        },
        logger: {
          clientTrace: () => done(),
        },
      } as any;

      const res: Response = { json: (response: any) => { /* */ } } as any;

      controller.get(req, res, () => { /* */ });
    });

  });

});
