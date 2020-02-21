// tslint:disable:no-unused-expression
import { makeEmailer } from '../../../../src/lib/emailer';
import { expect } from 'chai';

describe(`lib/emailer unit tests`, () => {

  describe('middleware', () => {

    it(`should attach emailer to request`, (done) => {
      const req: any = {};
      const res: any = {};
      const e =  makeEmailer({} as any, {} as any);
      e.middleware(req, res, () => {
        expect(req.emailer.NAME).to.eql('emailer');
        expect(req.emailer).to.not.be.undefined;
        expect(typeof req.emailer.sendPasswordRecovery).to.eql('function');
        done();
      });
    });

  });

  describe('sendPasswordRecovery', () => {

    it(`should call the sendMail method`, (done) => {
      const email = 'email@email.com';
      const token = 'abc';
      const req: any = {};
      const res: any = {};
      const e =  makeEmailer({
        sendMail: (options: any) => {
          expect(typeof options.from).to.eql('string');
          expect(options.to).to.eql(email);
          expect(typeof options.subject).to.eql('string');
          expect(typeof options.text).to.eql('string');
          done();
        },
      } as any, {
        error: () => {},
      } as any);
      e.sendPasswordRecovery(email, token);
    });

    it(`should log if error happens`, (done) => {
      const email = 'email@email.com';
      const token = 'abc';
      const req: any = {};
      const res: any = {};
      const e =  makeEmailer({
        sendMail: (options: any, cb: any) => {
          cb({
            message: 'oooh',
            stack: 'nooo',
          });
        },
      } as any, {
        error: (err: any) => {
          expect(err).to.include('oooh');
          expect(err).to.include('nooo');
          done();
        },
      } as any);
      e.sendPasswordRecovery(email, token);
    });

    it(`should not throw if nothing is passed to callback`, () => {
      const email = 'email@email.com';
      const token = 'abc';
      const req: any = {};
      const res: any = {};
      const e =  makeEmailer({
        sendMail: (options: any, cb: any) => {
          cb();
        },
      } as any, {
        error: () => {},
      } as any);
      expect(() => e.sendPasswordRecovery(email, token)).to.not.throw();
    });

  });

});
