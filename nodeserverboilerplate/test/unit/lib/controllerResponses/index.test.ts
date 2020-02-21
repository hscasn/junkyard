// tslint:disable:no-unused-expression
import { image, acceptsImage, attach, error, messageError, messageInfo,
         messageSuccess, messageWarning } from '../../../../src/lib/controllerResponses';
import { expect } from 'chai';
import * as HttpCodes from 'http-status-codes';
import { MessageType } from '../../../../src/views/routes/message';

describe(`lib/controllerResponses unit tests`, () => {

  describe('image', () => {

    it(`should set type and send content`, (done) => {
      let type: any;
      const req: any = {};
      const res: any = {
        type: (t: any) => type = t,
        send: (t: any) => {
          expect(t).to.eql('content');
          expect(type).to.eql('type');
          done();
        },
      };
      image(req, res, 'type', 'content');
    });

  });

  describe('acceptsImage', () => {

    it(`should accept image`, () => {
      const req: any = {
        accepts: (t: any) => /image/.test(t),
      };
      const a = acceptsImage(req);
      expect(a).to.be.true;
    });

    it(`should not accept image`, () => {
      const req: any = {
        accepts: () => false,
      };
      const a = acceptsImage(req);
      expect(a).to.be.false;
    });

  });

  describe('attach', () => {

    it(`should attach response methods`, (done) => {
      const req: any = {};
      const res: any = {};
      const middleware = attach();
      middleware(req, res, () => {
        expect(typeof res.error).to.eql('function');
        expect(typeof res.messageSuccess).to.eql('function');
        expect(typeof res.messageWarning).to.eql('function');
        expect(typeof res.messageError).to.eql('function');
        expect(typeof res.messageInfo).to.eql('function');
        expect(typeof res.image).to.eql('function');
        done();
      });
    });

  });

  describe('error', () => {

    it(`should accept error without message or logger message`, () => {
      const res: any = {
        status: () => {
          return {
            render: () => { /* */ },
          };
        },
      };
      expect(() => error({} as any, res, HttpCodes.OK)).not.to.throw();
    });

    it(`shoud log message, if provided`, () => {
      let called = false;
      const res: any = {
        status: () => {
          return {
            render: () => { /* */ },
          };
        },
      };
      const req: any = {
        logger: {
          error: (msg: string) => {
            expect(msg).to.eql('log message');
            called = true;
          },
        },
      };
      error(req, res, HttpCodes.OK, 'message', 'log message');
      expect(called).to.be.true;
    });

    it(`should set body and type`, (done) => {
      let status: any;
      let didLog = false;
      const errorCode = HttpCodes.IM_A_TEAPOT;
      const message = 'my message';
      const req: any = {
        testReq: true,
        logger: {
          error: () => {
            didLog = true;
          },
        },
      };
      const res: any = {
        status: (s: any) => {
          status = s;
          return {
            render: (route: any, props: any) => {
              if (typeof route !== 'string') {
                done('The error route is not a string');
              } else if (!props.req.testReq) {
                done('The request was not sent with the error');
              } else if (status !== HttpCodes.IM_A_TEAPOT) {
                done('The http code returned do not match with the one sent');
              } else if (props.message !== message) {
                done('The messages do not match');
              } else if (!didLog) {
                done('The logger message was not logged');
              } else {
                done();
              }
            },
          };
        },
      };
      error(req, res, errorCode, message, 'anything');
    });

  });

  describe('messageInfo', () => {

    it(`should not crash if message is not passed`, () => {
      const req: any = {};
      const res: any = {
        status: (s: any) => {
          return {
            render: (route: any, props: any) => {},
          };
        },
      };
      expect(() => messageInfo(req, res, HttpCodes.IM_A_TEAPOT)).to.not.throw();
    });

    it(`should set all required fields`, (done) => {
      let status: any;
      const message = 'anything';
      const req: any = {
        testReq: true,
      };
      const res: any = {
        status: (s: any) => {
          status = s;
          return {
            render: (route: any, props: any) => {
              if (typeof route !== 'string') {
                done('The error route is not a string');
              } else if (!props.req.testReq) {
                done('The request was not sent with the data');
              } else if (props.message !== message) {
                done('The messages do not match');
              } else if (props.httpCode !== HttpCodes.IM_A_TEAPOT) {
                done('The http code returned do not match with the one sent');
              } else if (props.messageType !== MessageType.Info) {
                done('The message type should be "info"');
              } else {
                done();
              }
            },
          };
        },
      };
      messageInfo(req, res, HttpCodes.IM_A_TEAPOT, message);
    });

  });

  describe('messageError', () => {

    it(`should not crash if message is not passed`, () => {
      const req: any = {};
      const res: any = {
        status: (s: any) => {
          return {
            render: (route: any, props: any) => {},
          };
        },
      };
      expect(() => messageError(req, res, HttpCodes.IM_A_TEAPOT)).to.not.throw();
    });

    it(`should set all required fields`, (done) => {
      let status: any;
      const message = 'anything';
      const req: any = {
        testReq: true,
      };
      const res: any = {
        status: (s: any) => {
          status = s;
          return {
            render: (route: any, props: any) => {
              if (typeof route !== 'string') {
                done('The error route is not a string');
              } else if (!props.req.testReq) {
                done('The request was not sent with the data');
              } else if (props.message !== message) {
                done('The messages do not match');
              } else if (props.httpCode !== HttpCodes.IM_A_TEAPOT) {
                done('The http code returned do not match with the one sent');
              } else if (props.messageType !== MessageType.Error) {
                done('The message type should be "error"');
              } else {
                done();
              }
            },
          };
        },
      };
      messageError(req, res, HttpCodes.IM_A_TEAPOT, message);
    });

  });

  describe('messageWarning', () => {

    it(`should not crash if message is not passed`, () => {
      const req: any = {};
      const res: any = {
        status: (s: any) => {
          return {
            render: (route: any, props: any) => {},
          };
        },
      };
      expect(() => messageWarning(req, res, HttpCodes.IM_A_TEAPOT)).to.not.throw();
    });

    it(`should set all required fields`, (done) => {
      let status: any;
      const message = 'anything';
      const req: any = {
        testReq: true,
      };
      const res: any = {
        status: (s: any) => {
          status = s;
          return {
            render: (route: any, props: any) => {
              if (typeof route !== 'string') {
                done('The error route is not a string');
              } else if (!props.req.testReq) {
                done('The request was not sent with the data');
              } else if (props.message !== message) {
                done('The messages do not match');
              } else if (props.httpCode !== HttpCodes.IM_A_TEAPOT) {
                done('The http code returned do not match with the one sent');
              } else if (props.messageType !== MessageType.Warn) {
                done('The message type should be "warn"');
              } else {
                done();
              }
            },
          };
        },
      };
      messageWarning(req, res, HttpCodes.IM_A_TEAPOT, message);
    });

  });

  describe('messageSuccess', () => {

    it(`should not crash if message is not passed`, () => {
      const req: any = {};
      const res: any = {
        status: (s: any) => {
          return {
            render: (route: any, props: any) => {},
          };
        },
      };
      expect(() => messageSuccess(req, res, HttpCodes.IM_A_TEAPOT)).to.not.throw();
    });

    it(`should set all required fields`, (done) => {
      let status: any;
      const message = 'anything';
      const req: any = {
        testReq: true,
      };
      const res: any = {
        status: (s: any) => {
          status = s;
          return {
            render: (route: any, props: any) => {
              if (typeof route !== 'string') {
                done('The error route is not a string');
              } else if (!props.req.testReq) {
                done('The request was not sent with the data');
              } else if (props.message !== message) {
                done('The messages do not match');
              } else if (props.httpCode !== HttpCodes.IM_A_TEAPOT) {
                done('The http code returned do not match with the one sent');
              } else if (props.messageType !== MessageType.Success) {
                done('The message type should be "success"');
              } else {
                done();
              }
            },
          };
        },
      };
      messageSuccess(req, res, HttpCodes.IM_A_TEAPOT, message);
    });

  });
});
