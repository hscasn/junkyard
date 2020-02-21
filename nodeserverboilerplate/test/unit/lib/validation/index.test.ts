// tslint:disable:no-unused-expression
import { isEmail, isValidPassword, inspectorWrapper } from '../../../../src/lib/validation';
import { expect } from 'chai';

describe('lib/validation unit tests', () => {

  describe(`isEmail`, () => {

    const scenarios: [string, boolean][] = [
      ['test@test', false],
      ['test@test.com', true],
      ['test@test.ca', true],
      ['test.com', false],
      ['test.ca', false],
      ['test@test@test.com', false],
      ['test@test@test.ca', false],
      ['test@TEST.com', true],
      ['TEST@test.com', true],
      ['TEST@TEST.COM', true],
      ['@test.com', false],
      ['test@.com', false],
      ['email@example.com', true],
      ['firstname.lastname@example.com', true],
      ['email@subdomain.example.com', true],
      ['email@123.123.123.123', true],
      ['1234567890@example.com', true],
      ['email@example-one.com', true],
      ['_______@example.com', true],
      ['email@example.name', true],
      ['email@example.museum', true],
      ['email@example.co.jp', true],
      ['firstname-lastname@example.com', true],
      ['much.“more\ unusual”@example.com', false],
      ['very.unusual.“@”.unusual.com@example.com', false],
      ['very.“(),:;<>[]”.VERY.“very@\\ "very”.unusual@strange.example.com', false],
      ['email@[123.123.123.123]', false],
      ['"email"@example.com', false],
      ['firstname+lastname@example.com', false],
      ['plainaddress', false],
      ['#@%^%#$@#$@#.com', false],
      ['@example.com', false],
      ['Joe Smith <email@example.com>', false],
      ['email.example.com', false],
      ['email@example@example.com', false],
      ['あいうえお@example.com', false],
      ['email@example.com (Joe Smith)', false],
      ['email@example', false],
      ['"(),:;<>[\]@example.com', false],
      ['just"not"right@example.com', false],
      ['this\ is"really"not\allowed@example.com', false],
    ];

    scenarios.forEach(([email, expected]) => {
      it(`Should return ${expected.toString()} for ${email}`, () => {
        expect(isEmail(email)).to.be.eql(expected);
      });
    });
  });

  describe(`isValidPassword`, () => {

    const scenarios: [string, boolean][] = [
      ['', false],
      ['password', false],
      ['PASSWORD', false],
      ['(){}}{)()()', false],
      ['A1', false],
      [')(s1', false],
      ['11', false],
      ['12345678910', false],
      ['VERYLONGPASSWORD', false],
      ['verylongpassword', false],
      ['P(){}[]\'".,!@#$%^&*-=_+;:paASSWORD1ThispasswordIsTooLong', false],

      ['     pwd1      ', true],
      ['     p    wd1      ', true],
      ['password1', true],
      ['PASSWORD1', true],
      ['P(){}[]\'".,!@#$%^&*- =_+;:paASRD1', true],

    ];

    scenarios.forEach(([email, expected]) => {
      it(`should return ${expected.toString()} for ${email}`, () => {
        expect(isValidPassword(email)).to.be.eql(expected);
      });
    });
  });

  describe('inspectorWrapper', () => {

    it('should wrap an unknown function that fails', (done) => {
      const dummyWrapped1 = (inspectorWrapper((b: boolean) => b, 'error')).bind({
        report: () => {
          done();
        },
      });
      dummyWrapped1({} as any, false);
    });

    it('should wrap an unknown function that succeeds', (done) => {
      let reported = false;
      const dummyWrapped1 = (inspectorWrapper((b: boolean) => b, 'error')).bind({
        report: () => {
          reported = true;
          done('should not have been called');
        },
      });

      dummyWrapped1({} as any, true);
      expect(reported).to.be.false;
      done();
    });

    it('should work if error message is empty or undefined, even if the function is unknown', () => {
      const dummyWrapped1 = (inspectorWrapper((b: boolean) => b)).bind({});
      const dummyWrapped2 = (inspectorWrapper((b: boolean) => b, '')).bind({});
      const dummyWrapped3 = (inspectorWrapper((b: boolean) => b)).bind({report: () => {}});
      expect(() => dummyWrapped1({} as any, true)).not.to.throw();
      expect(() => dummyWrapped2({} as any, true)).not.to.throw();
      expect(() => dummyWrapped3({} as any, false)).not.to.throw();
    });

    it('should use custome error messages for known functions', (done) => {
      let wrappedNo = 0;

      const dummyWrapped1 = inspectorWrapper(isEmail).bind({
        report: (error: string) => {
          expect(error).to.include('Invalid email');
          wrappedNo++;
          finish();
        },
      });

      const dummyWrapped2 = inspectorWrapper(isValidPassword).bind({
        report: (error: string) => {
          expect(error).to.include('Invalid password');
          wrappedNo++;
          finish();
        },
      });

      dummyWrapped1({} as any, 'no');
      dummyWrapped2({} as any, 'no');

      function finish() {
        if (wrappedNo === 2) {
          done();
        }
      }
    });

  });

});
