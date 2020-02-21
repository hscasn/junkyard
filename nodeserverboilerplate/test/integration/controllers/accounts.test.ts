// tslint:disable:no-unused-expression
import * as R from 'ramda';
import * as HttpErrors from 'http-status-codes';
import { Request } from 'express';
import { makeConnection, clearAll } from '../../utils/testingDatabase';
import { expect } from 'chai';
import { Connection } from 'typeorm';
import { UserEntity } from '../../../src/entities';
import { makeUserAddModel } from '../../../src/models/User';
import { Props as ViewAllProps } from '../../../src/views/routes/accounts/viewAll';
import { Props as ViewOneProps } from '../../../src/views/routes/accounts/viewOne';
import { Props as EditFormProps } from '../../../src/views/routes/accounts/edit';
import { Props as DeletePromptProps } from '../../../src/views/routes/accounts/deletePrompt';
import { Props as ResetPasswordProps } from '../../../src/views/routes/accounts/resetPassword';
import { Props as PasswordRecoveryProps } from '../../../src/views/routes/accounts/requestPwdRecovery';
import { Props as ProfileEditFormProps } from '../../../src/views/routes/accounts/changeProfile';
import { Props as ChangePasswordFormProps } from '../../../src/views/routes/accounts/changePassword';
import { Props as LoginFormProps } from '../../../src/views/routes/accounts/login';
import { Props as SignupFormProps } from '../../../src/views/routes/accounts/signup';
import { controller } from '../../../src/controllers/accounts';
import { makeUsersManager, UsersManager } from '../../../src/managers/user';
import { Ranks } from '../../../src/lib/userRanks';
import { makeRequestMocker, mockExample } from '../../utils/managerUtils';
import { misc } from '../../../src/config/misc';
import { hashSync } from 'bcrypt-nodejs';

describe(`controllers/accounts integration tests`, function (this: any) {
  this.timeout(20000);

  let connection: Connection = null as any;
  const getConnection = () => Promise.resolve(connection);
  let mockRequest: (p?: any) => Request = null as any;
  const dummyNext = () => { /* */ };
  let usersManager: UsersManager = null as any;
  let allEmails: string[] = [];
  let allEntries: UserEntity[] = [];

  before(async () => {
    connection = await makeConnection();
    await clearAll(connection);
  });

  beforeEach(async () => {
    mockRequest = makeRequestMocker(connection);

    usersManager = makeUsersManager(mockRequest());

    const inserts: Promise<any>[] = [];
    allEmails = [];
    for (let i = 1; i <= 10; i++) {
      const e = mockExample();
      const email = `email@test${i}.com`;
      const password = hashSync(`password_${i}`);
      inserts.push(usersManager.insertUser(makeUserAddModel({
        email,
        password,
      })));
      allEmails.push(email);
    }
    allEntries = await Promise.all(inserts);
  });

  afterEach(async () => {
    await clearAll(connection);
  });

  describe('viewAll', () => {

    it(`should return all items`, (done) => {
      const req = mockRequest();

      controller.viewAll(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: ViewAllProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(props.userList.length).to.eql(10);
          expect(R.map(i => i.email, props.userList)).to.have.members(allEmails);
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('viewOne', () => {

    it(`should create an error if parameters are missing`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest();

      controller.viewOne(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should create an error if bad ID is passed`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        params: {
          id: 999999,
        },
      });

      controller.viewOne(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.NOT_FOUND);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should get one entry`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        params: {
          id: oneUser.id,
        },
      });

      controller.viewOne(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: ViewOneProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(props.user).to.eql(oneUser);
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('viewSelf', () => {

    it(`should return the current user`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        user: oneUser,
        isAuthenticated: () => true,
      });

      controller.viewSelf(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: ViewOneProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(props.user).to.eql(oneUser);
          done();
        },
      } as any, dummyNext);
    });

    it(`should fail if not authenticated`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        user: oneUser,
        isAuthenticated: () => false,
      });

      controller.viewSelf(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.UNAUTHORIZED);
          done();
        },
        render: (route: string, props: ViewOneProps) => {
          done('Should not have rendered');
        },
      } as any, dummyNext);
    });

    it(`should fail if user data is not in the request`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        isAuthenticated: () => true,
      });

      controller.viewSelf(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.UNAUTHORIZED);
          done();
        },
        render: (route: string, props: ViewOneProps) => {
          done('Should not have rendered');
        },
      } as any, dummyNext);
    });

  });

  describe('getSignupForm', () => {

    it(`should redirect to root if signup is not enabled`, (done) => {
      const req = mockRequest();
      const tmpSignup = misc.enableSignup;

      (misc as any).enableSignup = false;

      controller.getSignupForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        redirect: (route: string, props: ViewOneProps) => {
          expect(route).to.eql('/');
          (misc as any).enableSignup = tmpSignup;
          done();
        },
      } as any, dummyNext);
    });

    it(`should get signup form if signup is enabled`, (done) => {
      const req = mockRequest();
      const tmpSignup = misc.enableSignup;

      (misc as any).enableSignup = true;

      controller.getSignupForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: ViewOneProps) => {
          expect(route).to.eql('accounts/signup');
          (misc as any).enableSignup = tmpSignup;
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('getResetPasswordForm', () => {

    it(`should get the reset password form`, (done) => {
      const tmpRecovery = misc.enablePasswordRecovery;

      (misc as any).enablePasswordRecovery = true;

      const req = mockRequest({
        accepts: () => false,
        query: {
          email: 'email@email.com',
          token: 'something',
        },
      });

      controller.getResetPasswordForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: ResetPasswordProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(route).to.eql('accounts/resetPassword');
          expect(props.email).to.eql('email@email.com');
          expect(props.token).to.eql('something');
          (misc as any).enablePasswordRecovery = tmpRecovery;
          done();
        },
      } as any, dummyNext);
    });

    it(`should fail if parameters are illegal`, (done) => {
      const oneUser = allEntries[0];
      const tmpRecovery = misc.enablePasswordRecovery;

      (misc as any).enablePasswordRecovery = true;

      const req = mockRequest({
        accepts: () => false,
        query: {
        },
      });

      controller.getResetPasswordForm(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.BAD_REQUEST);
          (misc as any).enablePasswordRecovery = tmpRecovery;
          done();
        },
        render: (route: string, props: ViewOneProps) => {
          done('Should not have rendered');
        },
      } as any, dummyNext);
    });

    it(`should redirect to root if password recovery not enabled`, (done) => {
      const oneUser = allEntries[0];
      const tmpRecovery = misc.enablePasswordRecovery;

      (misc as any).enablePasswordRecovery = false;

      const req = mockRequest({
        accepts: () => false,
        query: {
          email: 'email@email.com',
          token: 'something',
        },
      });

      controller.getResetPasswordForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        redirect: (route: string, props: ResetPasswordProps) => {
          expect(route).to.eql('/');
          (misc as any).enablePasswordRecovery = tmpRecovery;
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('getLoginForm', () => {

    it(`should get the login form with no message`, (done) => {
      const oneUser = allEntries[0];
      const tmpLogin = misc.enableLogin;

      (misc as any).enableLogin = true;

      const req = mockRequest({
        accepts: () => false,
        params: { },
      });

      controller.getLoginForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: LoginFormProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(route).to.eql('accounts/login');
          expect(props.wrongCredentials).to.be.false;
          expect(props.messageSignedUp).to.be.false;
          expect(props.messagePasswordReset).to.be.false;
          (misc as any).enableLogin = tmpLogin;
          done();
        },
      } as any, dummyNext);
    });

    it(`should get the login form with wrong credentials message`, (done) => {
      const oneUser = allEntries[0];
      const tmpLogin = misc.enableLogin;

      (misc as any).enableLogin = true;

      const req = mockRequest({
        accepts: () => false,
        params: {
          wrongCredentials: true,
        },
      });

      controller.getLoginForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: LoginFormProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(route).to.eql('accounts/login');
          expect(props.wrongCredentials).to.be.true;
          expect(props.messageSignedUp).to.be.false;
          expect(props.messagePasswordReset).to.be.false;
          (misc as any).enableLogin = tmpLogin;
          done();
        },
      } as any, dummyNext);
    });

    it(`should get the login form with signed up message`, (done) => {
      const oneUser = allEntries[0];
      const tmpLogin = misc.enableLogin;

      (misc as any).enableLogin = true;

      const req = mockRequest({
        accepts: () => false,
        params: {
          message: 'signedup',
        },
      });

      controller.getLoginForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: LoginFormProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(route).to.eql('accounts/login');
          expect(props.wrongCredentials).to.be.false;
          expect(props.messageSignedUp).to.be.true;
          expect(props.messagePasswordReset).to.be.false;
          (misc as any).enableLogin = tmpLogin;
          done();
        },
      } as any, dummyNext);
    });

    it(`should get the login form with password reset message`, (done) => {
      const oneUser = allEntries[0];
      const tmpLogin = misc.enableLogin;

      (misc as any).enableLogin = true;

      const req = mockRequest({
        accepts: () => false,
        params: {
          message: 'passwordreset',
        },
      });

      controller.getLoginForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: LoginFormProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(route).to.eql('accounts/login');
          expect(props.wrongCredentials).to.be.false;
          expect(props.messageSignedUp).to.be.false;
          expect(props.messagePasswordReset).to.be.true;
          (misc as any).enableLogin = tmpLogin;
          done();
        },
      } as any, dummyNext);
    });

    it(`should redirect to root if login not enabled`, (done) => {
      const oneUser = allEntries[0];
      const tmpLogin = misc.enableLogin;

      (misc as any).enableLogin = false;

      const req = mockRequest({
        accepts: () => false,
        params: { },
      });

      controller.getLoginForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        redirect: (route: string, props: ResetPasswordProps) => {
          expect(route).to.eql('/');
          (misc as any).enableLogin = tmpLogin;
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('getRecoveryForm', () => {

    it(`should get the password recovery form`, (done) => {
      const tmpRecovery = misc.enablePasswordRecovery;

      (misc as any).enablePasswordRecovery = true;

      const req = mockRequest({
        accepts: () => false,
        params: { },
      });

      controller.getRecoveryForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: PasswordRecoveryProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(route).to.eql('accounts/requestPwdRecovery');
          (misc as any).enablePasswordRecovery = tmpRecovery;
          done();
        },
      } as any, dummyNext);
    });

    it(`should redirect to root if password recovery not enabled`, (done) => {
      const tmpRecovery = misc.enablePasswordRecovery;

      (misc as any).enablePasswordRecovery = false;

      const req = mockRequest({
        accepts: () => false,
        params: { },
      });

      controller.getRecoveryForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        redirect: (route: string, props: PasswordRecoveryProps) => {
          expect(route).to.eql('/');
          (misc as any).enablePasswordRecovery = tmpRecovery;
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('getProfileEditForm', () => {

    it(`should get the profile edit form`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        user: oneUser,
        isAuthenticated: () => true,
      });

      controller.getProfileEditForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: ProfileEditFormProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(route).to.eql('accounts/changeProfile');
          expect(props.user).to.eql(oneUser);
          done();
        },
      } as any, dummyNext);
    });

    it(`should fail if not authenticated`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        isAuthenticated: () => false,
        user: oneUser,
      });

      controller.getProfileEditForm(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.UNAUTHORIZED);
          done();
        },
        render: (route: string, props: ProfileEditFormProps) => {
          done('Should not have rendered');
        },
      } as any, dummyNext);
    });

    it(`should fail if request does not have user`, (done) => {
      const req = mockRequest({
        accepts: () => false,
        isAuthenticated: () => true,
      });

      controller.getProfileEditForm(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.UNAUTHORIZED);
          done();
        },
        render: (route: string, props: ProfileEditFormProps) => {
          done('Should not have rendered');
        },
      } as any, dummyNext);
    });

  });

  describe('editForm', () => {

    it(`should get the edit form`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        params: {
          id: oneUser.id,
        },
      });

      controller.getEditForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: EditFormProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(route).to.eql('accounts/edit');
          expect(props.user).to.eql(oneUser);
          done();
        },
      } as any, dummyNext);
    });

    it(`should fail if parameters are illegal`, (done) => {
      const req = mockRequest({
        accepts: () => false,
        params: { },
      });

      controller.getEditForm(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: (route: string, props: EditFormProps) => {
          done('Should not have rendered');
        },
      } as any, dummyNext);
    });

    it(`should fail if id was not found`, (done) => {
      const req = mockRequest({
        accepts: () => false,
        params: {
          id: 999999,
        },
      });

      controller.getEditForm(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.NOT_FOUND);
          done();
        },
        render: (route: string, props: EditFormProps) => {
          done('Should not have rendered');
        },
      } as any, dummyNext);
    });

  });

  describe('getChangePasswordForm', () => {

    it(`should get the change password form`, (done) => {
      const tmpChange = misc.enablePasswordChange;

      (misc as any).enablePasswordChange = true;

      const req = mockRequest({
        accepts: () => false,
      });

      controller.getChangePasswordForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: ChangePasswordFormProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(route).to.eql('accounts/changePassword');
          (misc as any).enablePasswordChange = tmpChange;
          done();
        },
      } as any, dummyNext);
    });

    it(`should redirect to root if change password not enabled`, (done) => {
      const oneUser = allEntries[0];
      const tmpChange = misc.enablePasswordChange;

      (misc as any).enablePasswordChange = false;

      const req = mockRequest({
        accepts: () => false,
        params: {
          id: oneUser.id,
        },
      });

      controller.getChangePasswordForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        redirect: (route: string, props: ChangePasswordFormProps) => {
          expect(route).to.eql('/');
          (misc as any).enablePasswordChange = tmpChange;
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('deletePrompt', () => {

    it(`should get the delete prompt`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        params: {
          id: oneUser.id,
        },
      });

      controller.deletePrompt(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: DeletePromptProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(route).to.eql('accounts/deletePrompt');
          expect(props.user).to.eql(oneUser);
          done();
        },
      } as any, dummyNext);
    });

    it(`should fail if parameters are illegal`, (done) => {
      const req = mockRequest({
        accepts: () => false,
        params: { },
      });

      controller.deletePrompt(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: (route: string, props: DeletePromptProps) => {
          done('Should not have rendered');
        },
      } as any, dummyNext);
    });

    it(`should fail if id was not found`, (done) => {
      const req = mockRequest({
        accepts: () => false,
        params: {
          id: 999999,
        },
      });

      controller.deletePrompt(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.NOT_FOUND);
          done();
        },
        render: (route: string, props: DeletePromptProps) => {
          done('Should not have rendered');
        },
      } as any, dummyNext);
    });

  });

  describe('doLogout', () => {

    it(`should call logout and then redirect`, (done) => {
      let logoutCalled = false;

      const req = mockRequest({
        accepts: () => false,
        logOut: () => logoutCalled = true,
      });

      controller.doLogout(req, {
        redirect: (route: string, props: ChangePasswordFormProps) => {
          expect(logoutCalled).to.be.true;
          expect(route).to.eql('/');
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('doRecovery', () => {

    it(`should fail if params are invalid`, (done) => {
      const req = mockRequest({
        accepts: () => false,
        body: { },
      });

      controller.doRecovery(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: (route: string, props: DeletePromptProps) => {
          done('Should not have rendered');
        },
      } as any, dummyNext);
    });

    it(`should fail if recovery is disabled`, (done) => {
      const tmpRecover = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = false;

      const req = mockRequest({
        accepts: () => false,
        body: {
          email: 'anything@email.com',
        },
        emailer: {
          sendPasswordRecovery: () => {
            done('should not have used emailer');
          },
        },
      });

      controller.doRecovery(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.UNAUTHORIZED);
          (misc as any).enablePasswordRecovery = tmpRecover;
          done();
        },
        messageInfo: (status: number) => {
          (misc as any).enablePasswordRecovery = tmpRecover;
          done('should not have succeeded');
        },
      } as any, dummyNext);
    });

    it(`should return OK even if if email was not found, but should not send emails`, (done) => {
      const tmpRecover = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      const req = mockRequest({
        accepts: () => false,
        body: {
          email: 'anything@email.com',
        },
        emailer: {
          sendPasswordRecovery: () => {
            done('should not have used emailer');
          },
        },
      });

      controller.doRecovery(req, {
        error: (code: number, error?: string) => {
          (misc as any).enablePasswordRecovery = tmpRecover;
          done('should not have failed');
        },
        messageInfo: (status: number) => {
          expect(status).to.eql(HttpErrors.OK);
          (misc as any).enablePasswordRecovery = tmpRecover;
          done();
        },
      } as any, dummyNext);
    });

    it(`should return INTERNAL SERVER ERROR if an error happens`, (done) => {
      const tmpRecover = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      const req = mockRequest({
        accepts: () => false,
        body: {
          email: 'anything@email.com',
        },
        emailer: {
          sendPasswordRecovery: () => {
            done('should not have used emailer');
          },
        },
      });

      controller.doRecovery(req, {
        error: (code: number, error?: string) => {
          expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
          done();
        },
        messageInfo: (status: number) => {
          expect(status).to.eql(HttpErrors.OK);
          (misc as any).enablePasswordRecovery = tmpRecover;
          throw new Error('oops!');
        },
      } as any, dummyNext);
    });

    it(`should return INTERNAL SEVER ERROR if emailer is not setup`, (done) => {
      const oneUser = allEntries[1];
      const tmpRecover = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      const req = mockRequest({
        accepts: () => false,
        body: {
          email: oneUser.email,
        },
      });

      controller.doRecovery(req, {
        error: (code: number, error?: string) => {
          (misc as any).enablePasswordRecovery = tmpRecover;
          done();
        },
      } as any, dummyNext);
    });

    it(`should send a password recovery email with the new token (> 10 chars) and respond with 200`, (done) => {
      const oneUser = allEntries[1];
      const tmpRecover = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      let passwordSent = false;

      const req = mockRequest({
        accepts: () => false,
        body: {
          email: oneUser.email,
        },
        emailer: {
          sendPasswordRecovery: (email: string, token: string) => {
            expect(email).to.eql(oneUser.email);
            expect(typeof token).to.eql('string');
            expect(token.length).to.gt(10);
            passwordSent = true;
          },
        },
      });

      controller.doRecovery(req, {
        error: (code: number, error?: string) => {
          (misc as any).enablePasswordRecovery = tmpRecover;
          done('should not have failed');
        },
        messageInfo: (code: number) => {
          (misc as any).enablePasswordRecovery = tmpRecover;
          expect(code).to.eql(HttpErrors.OK);
          expect(passwordSent).to.be.true;
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('doProfileEdit', () => {

    it(`should fail to edit if body is invalid`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          id: oneUser.id,
        },
        params: {
          id: oneUser.id,
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doProfileEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.BAD_REQUEST);
            done();
          },
          render: () => {
            done('Should have failed!');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail to edit if parameters are invalid`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          displayName: 'my new name',
          id: oneUser.id,
        },
        params: {
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doProfileEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.BAD_REQUEST);
            done();
          },
          render: () => {
            done('Should have failed!');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail to edit if ids don't match`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          displayName: 'my new name',
          id: oneUser.id,
        },
        params: {
          id: oneUser.id + 1,
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doProfileEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.BAD_REQUEST);
            done();
          },
          render: () => {
            done('Should have failed!');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail to edit if user is not present in the request`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          displayName: 'my new name',
          id: oneUser.id,
        },
        params: {
          id: oneUser.id,
        },
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doProfileEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.UNAUTHORIZED);
            done();
          },
          render: () => {
            done('Should have failed!');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail to edit if user is not authenticated`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          displayName: 'my new name',
          id: oneUser.id,
        },
        params: {
          id: oneUser.id,
        },
        user: oneUser,
        isAuthenticated: () => false,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doProfileEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.UNAUTHORIZED);
            done();
          },
          render: () => {
            done('Should have failed!');
          },
        } as any, dummyNext);
      });
    });

    it(`should edit an entry successfully`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          displayName: 'my new name',
          id: oneUser.id,
        },
        params: {
          id: oneUser.id,
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doProfileEdit(req, {
          error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
          render: (route: string, props: ProfileEditFormProps) => {
            expect(typeof props).to.eql('object');
            expect((props.req as any).NAME).to.eql('mockRequest');
            expect(props.user.displayName).to.eql(req.body.displayName);
            const id = props.user.id;
            connection.manager.findOne(UserEntity, id).then((entry: any) => {
              expect(entry.display_name).to.eql(req.body.displayName);
              done();
            });
          },
        } as any, dummyNext);
      });
    });

  });

  describe('doChangePassword', () => {

    it(`should fail if parameters are invalid`, (done) => {
      const tmpChange = misc.enablePasswordChange;
      (misc as any).enablePasswordChange = true;

      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          pwd: 'mYpAssw0rd{}',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doChangePassword(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.BAD_REQUEST);
            (misc as any).enablePasswordChange = tmpChange;
            done();
          },
          render: (route: string, props: ChangePasswordFormProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if user is not authenticated`, (done) => {
      const tmpChange = misc.enablePasswordChange;
      (misc as any).enablePasswordChange = true;

      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          cpwd: 'password_1',
          pwd: 'mYpAssw0rd{}',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        user: oneUser,
        isAuthenticated: () => false,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doChangePassword(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.UNAUTHORIZED);
            (misc as any).enablePasswordChange = tmpChange;
            done();
          },
          render: (route: string, props: ChangePasswordFormProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if user is not present in request`, (done) => {
      const tmpChange = misc.enablePasswordChange;
      (misc as any).enablePasswordChange = true;

      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          cpwd: 'password_1',
          pwd: 'mYpAssw0rd{}',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doChangePassword(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.UNAUTHORIZED);
            (misc as any).enablePasswordChange = tmpChange;
            done();
          },
          render: (route: string, props: ChangePasswordFormProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if password change is not enabled`, (done) => {
      const tmpChange = misc.enablePasswordChange;
      (misc as any).enablePasswordChange = false;

      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          cpwd: 'password_1',
          pwd: 'mYpAssw0rd{}',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doChangePassword(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.UNAUTHORIZED);
            (misc as any).enablePasswordChange = tmpChange;
            done();
          },
          render: (route: string, props: ChangePasswordFormProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if auth tool was not provided`, (done) => {
      const tmpChange = misc.enablePasswordChange;
      (misc as any).enablePasswordChange = true;

      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          cpwd: 'password_1',
          pwd: 'mYpAssw0rd{}',
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doChangePassword(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
            (misc as any).enablePasswordChange = tmpChange;
            done();
          },
          render: (route: string, props: ChangePasswordFormProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should return internal server error if something throws`, (done) => {
      const tmpChange = misc.enablePasswordChange;
      (misc as any).enablePasswordChange = true;

      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          cpwd: 'password_1',
          pwd: 'mYpAssw0rd{}',
        },
        auth: {
          hash: (s: string) => { throw new Error('oh no!'); },
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doChangePassword(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
            (misc as any).enablePasswordChange = tmpChange;
            done();
          },
          render: (route: string, props: ChangePasswordFormProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should notify if password is incorrect`, (done) => {
      const tmpChange = misc.enablePasswordChange;
      (misc as any).enablePasswordChange = true;

      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          cpwd: 'password_2',
          pwd: 'mYpAssw0rd{}',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doChangePassword(req, {
          error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
          render: (route: string, props: ChangePasswordFormProps) => {
            expect(typeof props).to.eql('object');
            expect((props.req as any).NAME).to.eql('mockRequest');
            expect(props.passwordChanged).to.be.undefined;
            expect(props.passwordIncorrect).to.be.true;
            expect(props.lockForm).to.be.undefined;
            connection.manager.findOne(UserEntity, oneUser.id).then((entry: any) => {
              expect(entry.password).to.not.eql(req.body.pwd);
              (misc as any).enablePasswordChange = tmpChange;
              done();
            });
          },
        } as any, dummyNext);
      });
    });

    it(`should return internal server error if hash fails`, (done) => {
      const tmpChange = misc.enablePasswordChange;
      (misc as any).enablePasswordChange = true;

      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          cpwd: 'password_1',
          pwd: 'mYpAssw0rd{}',
        },
        auth: {
          hash: (s: string) => [false, s],
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doChangePassword(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
            (misc as any).enablePasswordChange = tmpChange;
            done();
          },
          render: (route: string, props: ChangePasswordFormProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should edit an entry successfully`, (done) => {
      const tmpChange = misc.enablePasswordChange;
      (misc as any).enablePasswordChange = true;

      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          cpwd: 'password_1',
          pwd: 'mYpAssw0rd{}',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doChangePassword(req, {
          error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
          render: (route: string, props: ChangePasswordFormProps) => {
            expect(typeof props).to.eql('object');
            expect((props.req as any).NAME).to.eql('mockRequest');
            expect(props.passwordChanged).to.be.true;
            expect(props.passwordIncorrect).to.be.undefined;
            expect(props.lockForm).to.be.true;
            connection.manager.findOne(UserEntity, oneUser.id).then((entry: any) => {
              expect(entry.password).to.eql(req.body.pwd);
              (misc as any).enablePasswordChange = tmpChange;
              done();
            });
          },
        } as any, dummyNext);
      });
    });

  });

  describe('doEdit', () => {

    it(`should fail if body is invalid`, (done) => {
      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        body: {
          id: otherUser.id,
          displayName: 'new display name',
        },
        params: {
          id: otherUser.id,
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.BAD_REQUEST);
            done();
          },
          render: (route: string, props: ViewOneProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if parameters are invalid`, (done) => {
      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        body: {
          id: otherUser.id,
          rank: Ranks.Super,
          displayName: 'new display name',
        },
        params: {
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.BAD_REQUEST);
            done();
          },
          render: (route: string, props: ViewOneProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if user is not authenticated`, (done) => {
      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        body: {
          id: otherUser.id,
          rank: Ranks.Super,
          displayName: 'new display name',
        },
        params: {
          id: otherUser.id,
        },
        user: oneUser,
        isAuthenticated: () => false,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.UNAUTHORIZED);
            done();
          },
          render: (route: string, props: ViewOneProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if user is not present in the request`, (done) => {
      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        body: {
          id: otherUser.id,
          rank: Ranks.Super,
          displayName: 'new display name',
        },
        params: {
          id: otherUser.id,
        },
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.UNAUTHORIZED);
            done();
          },
          render: (route: string, props: ViewOneProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if ids don't match`, (done) => {
      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        body: {
          id: otherUser.id,
          rank: Ranks.Super,
          displayName: 'new display name',
        },
        params: {
          id: otherUser.id + 1,
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.BAD_REQUEST);
            done();
          },
          render: (route: string, props: ViewOneProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if rank is not valid`, (done) => {
      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        body: {
          id: otherUser.id,
          rank: 99999,
          displayName: 'new display name',
        },
        params: {
          id: otherUser.id,
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.BAD_REQUEST);
            done();
          },
          render: (route: string, props: ViewOneProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should produce internal server error if user does not exist`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          id: 999,
          rank: Ranks.Super,
          displayName: 'new display name',
        },
        params: {
          id: 999,
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doEdit(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
            done();
          },
          render: (route: string, props: ViewOneProps) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should edit an entry successfully`, (done) => {
      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        body: {
          id: otherUser.id,
          rank: Ranks.Super,
          displayName: 'new display name',
        },
        params: {
          id: otherUser.id,
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doEdit(req, {
          error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
          render: (route: string, props: ViewOneProps) => {
            expect(typeof props).to.eql('object');
            expect((props.req as any).NAME).to.eql('mockRequest');
            expect(props.user.displayName).to.eql(req.body.displayName);
            expect(props.user.id).to.eql(req.body.id);
            expect(props.user.rank).to.eql(req.body.rank);
            connection.manager.findOne(UserEntity, otherUser.id).then((entry: any) => {
              expect(entry.display_name).to.eql(req.body.displayName);
              expect(entry.id).to.eql(req.body.id);
              expect(entry.rank).to.eql(req.body.rank);
              done();
            });
          },
        } as any, dummyNext);
      });
    });

  });

  describe('doSignup', () => {

    it(`should fail if parameters are invalid`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const req = mockRequest({
        body: {
          email: 'new_user@gmail.com',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        isAuthenticated: () => false,
      });

      controller.doSignup(req, {
        error: (code: number) => {
          expect(code).to.eql(HttpErrors.BAD_REQUEST);
          (misc as any).enableSignup = tmpEnableSignup;
          done();
        },
        render: (route: string, props: ViewOneProps) => {
          done('Should not have succeeded');
        },
      } as any, dummyNext);
    });

    it(`should fail if signup is not enabled`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = false;

      const req = mockRequest({
        body: {
          email: 'new_user@gmail.com',
          pwd: 'newUserPassword123{}',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        isAuthenticated: () => false,
      });

      controller.doSignup(req, {
        error: (code: number) => {
          expect(code).to.eql(HttpErrors.UNAUTHORIZED);
          (misc as any).enableSignup = tmpEnableSignup;
          done();
        },
        render: (route: string, props: ViewOneProps) => {
          done('Should not have succeeded');
        },
      } as any, dummyNext);
    });

    it(`should fail if user is not authenticated`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const req = mockRequest({
        body: {
          email: 'new_user@gmail.com',
          pwd: 'newUserPassword123{}',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        isAuthenticated: () => true,
      });

      controller.doSignup(req, {
        error: (code: number) => {
          expect(code).to.eql(HttpErrors.UNAUTHORIZED);
          (misc as any).enableSignup = tmpEnableSignup;
          done();
        },
        render: (route: string, props: ViewOneProps) => {
          done('Should not have succeeded');
        },
      } as any, dummyNext);
    });

    it(`should fail if user is present in the request`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const req = mockRequest({
        body: {
          email: 'new_user@gmail.com',
          pwd: 'newUserPassword123{}',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        user: allEntries[0],
        isAuthenticated: () => false,
      });

      controller.doSignup(req, {
        error: (code: number) => {
          expect(code).to.eql(HttpErrors.UNAUTHORIZED);
          (misc as any).enableSignup = tmpEnableSignup;
          done();
        },
        render: (route: string, props: ViewOneProps) => {
          done('Should not have succeeded');
        },
      } as any, dummyNext);
    });

    it(`should fail if auth tool is not present in the request`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const req = mockRequest({
        body: {
          email: 'new_user@gmail.com',
          pwd: 'newUserPassword123{}',
        },
        isAuthenticated: () => false,
      });

      controller.doSignup(req, {
        error: (code: number) => {
          expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
          (misc as any).enableSignup = tmpEnableSignup;
          done();
        },
        render: (route: string, props: ViewOneProps) => {
          done('Should not have succeeded');
        },
      } as any, dummyNext);
    });

    it(`should return internal server error if something throws`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const req = mockRequest({
        body: {
          email: 'new_user@gmail.com',
          pwd: 'newUserPassword123{}',
        },
        auth: {
          hash: (s: string) => { throw new Error('oh no'); },
        },
        isAuthenticated: () => false,
      });

      controller.doSignup(req, {
        error: (code: number) => {
          expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
          (misc as any).enableSignup = tmpEnableSignup;
          done();
        },
        render: (route: string, props: ViewOneProps) => {
          done('Should not have succeeded');
        },
      } as any, dummyNext);
    });

    it(`should notify if email already exists`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const req = mockRequest({
        body: {
          email: allEntries[0].email,
          pwd: 'newUserPassword123{}',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        isAuthenticated: () => false,
      });

      controller.doSignup(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: SignupFormProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(props.emailTaken).to.be.true;
          connection.manager.findOne(UserEntity, { email: req.body.email }).then((entry: any) => {
            expect(entry.password).to.not.eql(req.body.pwd);
            (misc as any).enableSignup = tmpEnableSignup;
            done();
          });
        },
      } as any, dummyNext);
    });

    it(`should return internal server error if hash fails`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const req = mockRequest({
        body: {
          email: 'new_user@gmail.com',
          pwd: 'newUserPassword123{}',
        },
        auth: {
          hash: (s: string) => [false, s],
        },
        isAuthenticated: () => false,
      });

      controller.doSignup(req, {
        error: (code: number) => {
          expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
          (misc as any).enableSignup = tmpEnableSignup;
          done();
        },
        render: (route: string, props: ViewOneProps) => {
          done('Should not have succeeded');
        },
      } as any, dummyNext);
    });

    it(`should create an entry successfully`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const req = mockRequest({
        body: {
          email: 'new_user@gmail.com',
          pwd: 'newUserPassword123{}',
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        isAuthenticated: () => false,
      });

      controller.doSignup(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: LoginFormProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(props.messageSignedUp).to.be.true;
          connection.manager.findOne(UserEntity, { email: req.body.email }).then((entry: any) => {
            expect(entry.email).to.eql(req.body.email);
            expect(entry.password).to.eql(req.body.pwd);
            expect(entry.rank).to.eql(Ranks.Regular);
            (misc as any).enableSignup = tmpEnableSignup;
            done();
          });
        },
      } as any, dummyNext);
    });

  });

  describe('doDelete', () => {

    it(`should fail if parameters are invalid`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        params: {
        },
        user: otherUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doDelete(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.BAD_REQUEST);
            (misc as any).enableSignup = tmpEnableSignup;
            done();
          },
          redirect: (route: string) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if signup is not enabled`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = false;

      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        params: {
          id: oneUser.id,
        },
        user: otherUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doDelete(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.UNAUTHORIZED);
            (misc as any).enableSignup = tmpEnableSignup;
            done();
          },
          redirect: (route: string) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if user is not authenticated`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        params: {
          id: oneUser.id,
        },
        user: otherUser,
        isAuthenticated: () => false,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doDelete(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.UNAUTHORIZED);
            (misc as any).enableSignup = tmpEnableSignup;
            done();
          },
          redirect: (route: string) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if user is not present in the request`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        params: {
          id: oneUser.id,
        },
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doDelete(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.UNAUTHORIZED);
            (misc as any).enableSignup = tmpEnableSignup;
            done();
          },
          redirect: (route: string) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should fail if user is trying to delete themselves`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        params: {
          id: oneUser.id,
        },
        user: oneUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doDelete(req, {
          error: (code: number) => {
            expect(code).to.eql(HttpErrors.BAD_REQUEST);
            (misc as any).enableSignup = tmpEnableSignup;
            done();
          },
          redirect: (route: string) => {
            done('Should not have succeeded');
          },
        } as any, dummyNext);
      });
    });

    it(`should delete an entry successfully`, (done) => {
      const tmpEnableSignup = misc.enableSignup;
      (misc as any).enableSignup = true;

      const oneUser = allEntries[0];
      const otherUser = allEntries[1];

      const req = mockRequest({
        params: {
          id: oneUser.id,
        },
        user: otherUser,
        isAuthenticated: () => true,
      });

      connection.manager.findOne(UserEntity, oneUser.id).then(() => {
        controller.doDelete(req, {
          error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
          redirect: (route: string) => {
            connection.manager.findOne(UserEntity, oneUser.id).then((entry: any) => {
              (misc as any).enableSignup = tmpEnableSignup;
              if (entry) {
                done('Should have deleted the entry');
              } else {
                done();
              }
            });
          },
        } as any, dummyNext);
      });
    });

  });

  describe('doResetPasswordEdit', () => {

    it(`should fail if invalid body is passed`, (done) => {
      const tmpEnableRecovery = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      const oneUser = allEntries[0];
      const token = 'token123';

      const req = mockRequest({
        body: {
          email: oneUser.email,
          token,
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        isAuthenticated: () => false,
      });

      const editedUser = new UserEntity();
      editedUser.password_token = token;
      editedUser.password_token_creation_date = (new Date()).toISOString();

      connection.manager.update(UserEntity, oneUser.id, editedUser).then(() => {
        connection.manager.findOne(UserEntity, oneUser.id).then(() => {
          controller.doResetPasswordEdit(req, {
            error: (code: number) => {
              expect(code).to.eql(HttpErrors.BAD_REQUEST);
              (misc as any).enablePasswordRecovery = tmpEnableRecovery;
              done();
            },
            render: (route: string) => {
              done('Should not have succeeded');
            },
          } as any, dummyNext);
        });
      });
    });

    it(`should fail if password recovery is not enabled`, (done) => {
      const tmpEnableRecovery = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = false;

      const oneUser = allEntries[0];
      const token = 'token123';

      const req = mockRequest({
        body: {
          email: oneUser.email,
          pwd: 'newPassword123{}',
          token,
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        isAuthenticated: () => false,
      });

      const editedUser = new UserEntity();
      editedUser.password_token = token;
      editedUser.password_token_creation_date = (new Date()).toISOString();

      connection.manager.update(UserEntity, oneUser.id, editedUser).then(() => {
        connection.manager.findOne(UserEntity, oneUser.id).then(() => {
          controller.doResetPasswordEdit(req, {
            error: (code: number) => {
              expect(code).to.eql(HttpErrors.UNAUTHORIZED);
              (misc as any).enablePasswordRecovery = tmpEnableRecovery;
              done();
            },
            render: (route: string) => {
              done('Should not have succeeded');
            },
          } as any, dummyNext);
        });
      });
    });

    it(`should fail if user is authenticated`, (done) => {
      const tmpEnableRecovery = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      const oneUser = allEntries[0];
      const token = 'token123';

      const req = mockRequest({
        body: {
          email: oneUser.email,
          pwd: 'newPassword123{}',
          token,
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        isAuthenticated: () => true,
      });

      const editedUser = new UserEntity();
      editedUser.password_token = token;
      editedUser.password_token_creation_date = (new Date()).toISOString();

      connection.manager.update(UserEntity, oneUser.id, editedUser).then(() => {
        connection.manager.findOne(UserEntity, oneUser.id).then(() => {
          controller.doResetPasswordEdit(req, {
            error: (code: number) => {
              expect(code).to.eql(HttpErrors.UNAUTHORIZED);
              (misc as any).enablePasswordRecovery = tmpEnableRecovery;
              done();
            },
            render: (route: string) => {
              done('Should not have succeeded');
            },
          } as any, dummyNext);
        });
      });
    });

    it(`should fail if user is present in the request`, (done) => {
      const tmpEnableRecovery = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      const oneUser = allEntries[0];
      const token = 'token123';

      const req = mockRequest({
        body: {
          email: oneUser.email,
          pwd: 'newPassword123{}',
          token,
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        user: oneUser,
        isAuthenticated: () => false,
      });

      const editedUser = new UserEntity();
      editedUser.password_token = token;
      editedUser.password_token_creation_date = (new Date()).toISOString();

      connection.manager.update(UserEntity, oneUser.id, editedUser).then(() => {
        connection.manager.findOne(UserEntity, oneUser.id).then(() => {
          controller.doResetPasswordEdit(req, {
            error: (code: number) => {
              expect(code).to.eql(HttpErrors.UNAUTHORIZED);
              (misc as any).enablePasswordRecovery = tmpEnableRecovery;
              done();
            },
            render: (route: string) => {
              done('Should not have succeeded');
            },
          } as any, dummyNext);
        });
      });
    });

    it(`should fail if auth tools are not present in the request`, (done) => {
      const tmpEnableRecovery = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      const oneUser = allEntries[0];
      const token = 'token123';

      const req = mockRequest({
        body: {
          email: oneUser.email,
          pwd: 'newPassword123{}',
          token,
        },
        isAuthenticated: () => false,
      });

      const editedUser = new UserEntity();
      editedUser.password_token = token;
      editedUser.password_token_creation_date = (new Date()).toISOString();

      connection.manager.update(UserEntity, oneUser.id, editedUser).then(() => {
        connection.manager.findOne(UserEntity, oneUser.id).then(() => {
          controller.doResetPasswordEdit(req, {
            error: (code: number) => {
              expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
              (misc as any).enablePasswordRecovery = tmpEnableRecovery;
              done();
            },
            render: (route: string) => {
              done('Should not have succeeded');
            },
          } as any, dummyNext);
        });
      });
    });

    it(`should return internal server error if something throws`, (done) => {
      const tmpEnableRecovery = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      const oneUser = allEntries[0];
      const token = 'token123';

      const req = mockRequest({
        body: {
          email: oneUser.email,
          pwd: 'newPassword123{}',
          token,
        },
        auth: {
          hash: (s: string) => { throw new Error('oh no'); },
        },
        isAuthenticated: () => false,
      });

      const editedUser = new UserEntity();
      editedUser.password_token = token;
      editedUser.password_token_creation_date = (new Date()).toISOString();

      connection.manager.update(UserEntity, oneUser.id, editedUser).then(() => {
        connection.manager.findOne(UserEntity, oneUser.id).then(() => {
          controller.doResetPasswordEdit(req, {
            error: (code: number) => {
              expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
              (misc as any).enablePasswordRecovery = tmpEnableRecovery;
              done();
            },
            render: (route: string) => {
              done('Should not have succeeded');
            },
          } as any, dummyNext);
        });
      });
    });

    it(`should return internal server error if hashing fails`, (done) => {
      const tmpEnableRecovery = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      const oneUser = allEntries[0];
      const token = 'token123';

      const req = mockRequest({
        body: {
          email: oneUser.email,
          pwd: 'newPassword123{}',
          token,
        },
        auth: {
          hash: (s: string) => [false, s],
        },
        isAuthenticated: () => false,
      });

      const editedUser = new UserEntity();
      editedUser.password_token = token;
      editedUser.password_token_creation_date = (new Date()).toISOString();

      connection.manager.update(UserEntity, oneUser.id, editedUser).then(() => {
        connection.manager.findOne(UserEntity, oneUser.id).then(() => {
          controller.doResetPasswordEdit(req, {
            error: (code: number) => {
              expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
              (misc as any).enablePasswordRecovery = tmpEnableRecovery;
              done();
            },
            render: (route: string) => {
              done('Should not have succeeded');
            },
          } as any, dummyNext);
        });
      });
    });

    it(`should return bad request if token is too old`, (done) => {
      const tmpEnableRecovery = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      const oneUser = allEntries[0];
      const token = 'token123';

      const req = mockRequest({
        body: {
          email: oneUser.email,
          pwd: 'newPassword123{}',
          token,
        },
        auth: {
          hash: (s: string) => [false, s],
        },
        isAuthenticated: () => false,
      });

      const editedUser = new UserEntity();
      editedUser.password_token = token;
      editedUser.password_token_creation_date = '2010-07-28T04:21:20.295Z';

      connection.manager.update(UserEntity, oneUser.id, editedUser).then(() => {
        connection.manager.findOne(UserEntity, oneUser.id).then(() => {
          controller.doResetPasswordEdit(req, {
            error: (code: number) => {
              expect(code).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
              (misc as any).enablePasswordRecovery = tmpEnableRecovery;
              done();
            },
            render: (route: string) => {
              done('Should not have succeeded');
            },
          } as any, dummyNext);
        });
      });
    });

    it(`should reset a password successfully`, (done) => {
      const tmpEnableRecovery = misc.enablePasswordRecovery;
      (misc as any).enablePasswordRecovery = true;

      const oneUser = allEntries[0];
      const token = 'token123';

      const req = mockRequest({
        body: {
          email: oneUser.email,
          pwd: 'newPassword123{}',
          token,
        },
        auth: {
          hash: (s: string) => [true, s],
        },
        isAuthenticated: () => false,
      });

      const editedUser = new UserEntity();
      editedUser.password_token = token;
      editedUser.password_token_creation_date = (new Date()).toISOString();

      connection.manager.update(UserEntity, oneUser.id, editedUser).then(() => {
        connection.manager.findOne(UserEntity, oneUser.id).then(() => {
          controller.doResetPasswordEdit(req, {
            error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
            render: (route: string, props: LoginFormProps) => {
              expect(typeof props).to.eql('object');
              expect((props.req as any).NAME).to.eql('mockRequest');
              expect(props.messagePasswordReset).to.be.true;
              connection.manager.findOne(UserEntity, oneUser.id).then((entry: any) => {
                expect(entry.password).to.eql(req.body.pwd);
                (misc as any).enablePasswordRecovery = tmpEnableRecovery;
                done();
              });
            },
          } as any, dummyNext);
        });
      });
    });

  });

});
