import { ControllerMethod } from '../interfaces';
import * as inspector from 'schema-inspector';
import * as HttpCodes from 'http-status-codes';
import * as uuid from 'uuid';

import { misc } from '../config/misc';

import { Props as ViewAllProps } from '../views/routes/accounts/viewAll';
import { Props as ViewOneProps } from '../views/routes/accounts/viewOne';
import { Props as SignupProps } from '../views/routes/accounts/signup';
import { Props as ResetPasswordProps } from '../views/routes/accounts/resetPassword';
import { Props as ChangePasswordProps } from '../views/routes/accounts/changePassword';
import { Props as ChangeProfileProps } from '../views/routes/accounts/changeProfile';
import { Props as LoginProps } from '../views/routes/accounts/login';
import { Props as DeletePromptProps } from '../views/routes/accounts/deletePrompt';
import { Props as EditFormProps } from '../views/routes/accounts/edit';
import { Props as RequestPwdRecoveryProps } from '../views/routes/accounts/requestPwdRecovery';
import { makeUsersManager } from '../managers/user';
import {
  UserModel,
  makeUserEditModel,
  makeAdminUserEditModel,
  makeUserAddModel,
} from '../models/User';
import { isValidPassword, isEmail, inspectorWrapper } from '../lib/validation';
import { Ranks } from '../lib/userRanks';
import { MAX_STR_LEN } from '../models/partials/constants';

export namespace Input {
  export interface GetResetPasswordForm {
    email: string;
    token: string;
  }

  export interface ViewOne {
    id: number;
  }

  export interface DoResetPasswordEdit {
    email: string;
    pwd: string;
    token: string;
  }

  export interface GetLoginForm {
    wrongCredentials: boolean;
    message: string;
  }

  export interface DoRecovery {
    email: string;
  }

  export namespace DoProfileEdit {
    export interface Params {
      id: number;
    }

    export interface Body {
      displayName: string;
      id: number;
    }
  }

  export interface DoSignup {
    email: string;
    pwd: string;
  }

  export interface DeletePrompt {
    id: number;
  }

  export interface DoDelete {
    id: number;
  }

  export interface DoChangePassword {
    cpwd: string;
    pwd: string;
  }

  export namespace DoEdit {
    export interface Params {
      id: number;
    }
    export interface Body {
      id: number;
      rank: Ranks;
      displayName: string;
    }
  }

  export interface GetEditForm {
    id: number;
  }
}

const inputSchema = {
  GetResetPasswordForm: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        email: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim', 'lower'] },
        token: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim'] },
      },
    },
    validation: {
      strict: true,
      properties: {
        email: { type: 'string', optional: false, exec: inspectorWrapper(isEmail) },
        token: { type: 'string', optional: false },
      },
    },
  },
  ViewOne: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        id: { type: 'integer' },
      },
    },
    validation: {
      strict: true,
      properties: {
        id: { type: 'integer', gt: 0, optional: false },
      },
    },
  },
  DoResetPasswordEdit: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        email: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim', 'lower'] },
        pwd: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim'] },
        token: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim'] },
      },
    },
    validation: {
      strict: true,
      properties: {
        email: { type: 'string', optional: false, exec: inspectorWrapper(isEmail) },
        pwd: { type: 'string', optional: false, exec: inspectorWrapper(isValidPassword) },
        token: { type: 'string', optional: false },
      },
    },
  },
  GetLoginForm: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        wrongCredentials: { type: 'boolean', def: false, optional: false },
        message: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim'], def: '', optional: false },
      },
    },
    validation: {
      strict: true,
      properties: {
        wrongCredentials: { type: 'boolean', optional: false },
        message: { type: 'string', optional: false },
      },
    },
  },
  DoRecovery: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        email: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim', 'lower'] },
      },
    },
    validation: {
      strict: true,
      properties: {
        email: { type: 'string', optional: false, exec: inspectorWrapper(isEmail) },
      },
    },
  },
  DoProfileEdit: {
    Params: {
      sanitization: {
        type: 'object',
        strict: true,
        properties: {
          id: { type: 'integer' },
        },
      },
      validation: {
        strict: true,
        properties: {
          id: { type: 'integer', gt: 0, optional: false },
        },
      },
    },
    Body: {
      sanitization: {
        type: 'object',
        strict: true,
        properties: {
          id: { type: 'integer' },
          displayName: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim'] },
        },
      },
      validation: {
        strict: true,
        properties: {
          id: { type: 'integer', gt: 0, optional: false },
          displayName: { type: 'string', optional: false },
        },
      },
    },
  },
  DoSignup: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        email: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim', 'lower'] },
        pwd: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim'] },
      },
    },
    validation: {
      strict: true,
      properties: {
        email: { type: 'string', optional: false, exec: inspectorWrapper(isEmail) },
        pwd: { type: 'string', optional: false, exec: inspectorWrapper(isValidPassword) },
      },
    },
  },
  DeletePrompt: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        id: { type: 'integer' },
      },
    },
    validation: {
      strict: true,
      properties: {
        id: { type: 'integer', gt: 0, optional: false },
      },
    },
  },
  DoDelete: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        id: { type: 'integer' },
      },
    },
    validation: {
      strict: true,
      properties: {
        id: { type: 'integer', gt: 0, optional: false },
      },
    },
  },
  DoChangePassword: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        pwd: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim'] },
        cpwd: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim'] },
      },
    },
    validation: {
      strict: true,
      properties: {
        pwd: { type: 'string', optional: false, exec: inspectorWrapper(isValidPassword) },
        cpwd: { type: 'string', optional: false, exec: inspectorWrapper(isValidPassword) },
      },
    },
  },
  DoEdit: {
    Params: {
      sanitization: {
        type: 'object',
        strict: true,
        properties: {
          id: { type: 'integer' },
        },
      },
      validation: {
        strict: true,
        properties: {
          id: { type: 'integer', gt: 0, optional: false },
        },
      },
    },
    Body: {
      sanitization: {
        type: 'object',
        strict: true,
        properties: {
          id: { type: 'integer' },
          rank: { type: 'integer' },
          displayName: { type: 'string', maxLength: MAX_STR_LEN, rules: ['trim'] },
        },
      },
      validation: {
        strict: true,
        properties: {
          id: { type: 'integer', gt: 0, optional: false },
          rank: { type: 'integer', optional: false },
          displayName: { type: 'string', optional: false },
        },
      },
    },
  },
  GetEditForm: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        id: { type: 'integer' },
      },
    },
    validation: {
      strict: true,
      properties: {
        id: { type: 'integer', gt: 0 },
      },
    },
  },
};

const controller: {
  viewAll: ControllerMethod,
  viewOne: ControllerMethod,
  viewSelf: ControllerMethod,
  getSignupForm: ControllerMethod,
  getResetPasswordForm: ControllerMethod,
  doResetPasswordEdit: ControllerMethod,
  doLogout: ControllerMethod,
  getLoginForm: ControllerMethod,
  getRecoveryForm: ControllerMethod,
  doRecovery: ControllerMethod,
  getProfileEditForm: ControllerMethod,
  doProfileEdit: ControllerMethod,
  getChangePasswordForm: ControllerMethod,
  doSignup: ControllerMethod,
  doChangePassword: ControllerMethod,
  deletePrompt: ControllerMethod,
  doDelete: ControllerMethod,
  getEditForm: ControllerMethod,
  doEdit: ControllerMethod,
} = {

  /**
   * Shows all the users
   */
  viewAll: async (req, res, next) => {
    const m = makeUsersManager(req);

    const users: UserModel[] = await m.getAll();

    const props: ViewAllProps = {
      req,
      userList: users,
    };

    res.render('accounts/viewAll', props);
  },

  /**
   * Displays one user
   */
  viewOne: async (req, res, next) => {
    const params: Input.ViewOne = req.params;
    inspector.sanitize(inputSchema.ViewOne.sanitization, params);
    const vResult = inspector.validate(inputSchema.ViewOne.validation, params);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    const m = makeUsersManager(req);

    const user = await m.getOne(params.id);

    if (!user) {
      res.error(HttpCodes.NOT_FOUND);
      return;
    } else {
      const props: ViewOneProps = {
        req,
        user,
      };
      res.render('accounts/viewOne', props);
    }
  },

  /**
   * View own user
   */
  viewSelf: async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
      res.error(HttpCodes.UNAUTHORIZED, `Unauthorized access for unsigned user at viewSelf`);
      return;
    }

    const props: ViewOneProps = {
      req,
      user: req.user,
    };

    res.render('accounts/viewOne', props);
  },

  /**
   * Prompt for confirmation to delete a user
   */
  deletePrompt: async (req, res, next) => {
    const params: Input.DeletePrompt = req.params;
    inspector.sanitize(inputSchema.DeletePrompt.sanitization, params);
    const vResult = inspector.validate(inputSchema.DeletePrompt.validation, params);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    const m = makeUsersManager(req);

    const item = await m.getOne(params.id);

    if (!item) {
      res.error(HttpCodes.NOT_FOUND);
      return;
    } else {
      const props: DeletePromptProps = {
        req,
        user: item,
      };
      res.render('accounts/deletePrompt', props);
    }
  },

  /**
   * Deletes an item
   */
  doDelete: async (req, res, next) => {
    const params: Input.DoDelete = req.params;
    inspector.sanitize(inputSchema.DoDelete.sanitization, params);
    const vResult = inspector.validate(inputSchema.DoDelete.validation, params);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    if (!misc.enableSignup) {
      res.error(HttpCodes.UNAUTHORIZED, 'User tried to use disabled feature', 'Disabled feature');
      return;
    }

    if (!req.isAuthenticated() || !req.user) {
      res.error(HttpCodes.UNAUTHORIZED, `Unauthorized access for unsigned user at viewSelf`);
      return;
    }

    // A user can not delete themselves
    if (req.user.id === params.id) {
      res.error(HttpCodes.BAD_REQUEST);
      return;
    }

    const m = makeUsersManager(req);

    await m.remove(params.id);

    res.redirect('/accounts/users');
  },

  /**
   * Prints the form to signup
   */
  getSignupForm: async (req, res, next) => {
    if (!misc.enableSignup) {
      res.redirect('/');
      return;
    }

    const props: SignupProps = {
      req,
    };

    res.render('accounts/signup', props);
  },

  /**
   * Renders the form to reset password
   */
  getResetPasswordForm: async (req, res, next) => {
    const params: Input.GetResetPasswordForm = req.query;
    inspector.sanitize(inputSchema.GetResetPasswordForm.sanitization, params);
    const vResult = inspector.validate(inputSchema.GetResetPasswordForm.validation, params);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    if (!misc.enablePasswordRecovery) {
      res.redirect('/');
      return;
    }

    const props: ResetPasswordProps = {
      req,
      email: params.email,
      token: params.token,
    };

    res.render('accounts/resetPassword', props);
  },

  /**
   * Changes the password
   */
  doResetPasswordEdit: async (req, res, next) => {
    const body: Input.DoResetPasswordEdit = req.body;
    inspector.sanitize(inputSchema.DoResetPasswordEdit.sanitization, body);
    const vResult = inspector.validate(inputSchema.DoResetPasswordEdit.validation, body);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    if (!misc.enablePasswordRecovery) {
      res.error(HttpCodes.UNAUTHORIZED, 'User tried to use disabled feature', 'Disabled feature');
      return;
    }

    if (req.isAuthenticated() || req.user) {
      res.error(HttpCodes.UNAUTHORIZED);
      return;
    }

    const userManager = makeUsersManager(req);

    if (!req.auth) {
      res.error(HttpCodes.INTERNAL_SERVER_ERROR, `Middleware for password hash was not sent to controller`);
      return;
    }

    try {
      const limitDate = Date.now() + misc.passwordTokenExpireTime;

      // Checking if the token is valid
      if (!await userManager.isTokenValid(body.email, body.token, new Date(limitDate))) {
        res.error(HttpCodes.BAD_REQUEST, 'Your token is no longer valid, please request a makeone');
        return;
      }

      const [wasHashed, hashedPwd] = await req.auth.hash(body.pwd);

      if (wasHashed) {
        if (await userManager.changePassword(body.email, hashedPwd)) {
          const p: LoginProps = {
            req,
            messagePasswordReset: true,
          };
          res.render('accounts/login', p);
          return;
        } else {
          res.error(HttpCodes.INTERNAL_SERVER_ERROR,
            `An error happened while resetting the password token for the user ${body.email}`);
          return;
        }
      } else {
        res.error(HttpCodes.INTERNAL_SERVER_ERROR,
          `An error happened while resetting the password token for the user ${body.email}`);
        return;
      }
    } catch (e) {
      res.error(HttpCodes.INTERNAL_SERVER_ERROR, e);
      return;
    }
  },

  /**
   * Does the logout
   */
  doLogout: async (req, res, next) => {
    req.logOut();
    res.redirect('/');
  },

  /**
   * Login form
   */
  getLoginForm: async (req, res, next) => {
    const params: Input.GetLoginForm = req.params;
    inspector.sanitize(inputSchema.GetLoginForm.sanitization, params);
    const vResult = inspector.validate(inputSchema.GetLoginForm.validation, params);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    if (!misc.enableLogin) {
      res.redirect('/');
      return;
    }

    const props: LoginProps = {
      req,
      wrongCredentials: params.wrongCredentials,
      messageSignedUp: params.message === 'signedup',
      messagePasswordReset: params.message === 'passwordreset',
    };

    res.render('accounts/login', props);
  },

  /**
   * Gets the password recovery form
   */
  getRecoveryForm: async (req, res, next) => {
    if (!misc.enablePasswordRecovery) {
      res.redirect('/');
      return;
    }

    const props: RequestPwdRecoveryProps = {
      req,
    };

    res.render('accounts/requestPwdRecovery', props);
  },

  /**
   * Performs the password recovery
   */
  doRecovery: async (req, res, next) => {
    const body: Input.DoRecovery = req.body;
    inspector.sanitize(inputSchema.DoRecovery.sanitization, body);
    const vResult = inspector.validate(inputSchema.DoRecovery.validation, body);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    if (!misc.enablePasswordRecovery) {
      res.error(HttpCodes.UNAUTHORIZED, 'User tried to use disabled feature', 'Disabled feature');
      return;
    }

    const token: string = uuid();

    const userManager = makeUsersManager(req);

    try {

      // Checking if email exists
      if (!await userManager.emailExists(body.email)) {
        res.messageInfo(HttpCodes.OK,
          'An email with your password recovery link was sent, if it exists. Please check your inbox.');
        return;
      }

      if (await userManager.setPasswordToken(body.email, token)) {
        if (req.emailer) {
          req.emailer.sendPasswordRecovery(body.email, token);
          res.messageInfo(HttpCodes.OK,
            'An email with your password recovery link was sent, if it exists. Please check your inbox.');
          return;
        } else {
          res.error(HttpCodes.INTERNAL_SERVER_ERROR,
            `Email not configured for sending the password token to user ${body.email}`);
          return;
        }
      } else {
        res.error(HttpCodes.INTERNAL_SERVER_ERROR,
          `An error happened while setting the password token for the user ${body.email}`);
        return;
      }
    } catch (e) {
      res.error(HttpCodes.INTERNAL_SERVER_ERROR, e);
      return;
    }
  },

  /**
   * Renders the form to change the profile
   */
  getProfileEditForm: async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
      res.error(HttpCodes.UNAUTHORIZED, `Unauthorized access for unsigned user at getProfileEditForm`);
      return;
    }

    const props: ChangeProfileProps = {
      req,
      user: req.user,
    };

    res.render('accounts/changeProfile', props);
  },

  /**
   * Changes the user's profile
   */
  doProfileEdit: async (req, res, next) => {
    const params: Input.DoProfileEdit.Params = req.params;
    inspector.sanitize(inputSchema.DoProfileEdit.Params.sanitization, params);
    const vParamsResult = inspector.validate(inputSchema.DoProfileEdit.Params.validation, params);
    if (!vParamsResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vParamsResult.format());
      return;
    }

    const body: Input.DoProfileEdit.Body = req.body;
    inspector.sanitize(inputSchema.DoProfileEdit.Body.sanitization, body);
    const vBodyResult = inspector.validate(inputSchema.DoProfileEdit.Body.validation, body);
    if (!vBodyResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vBodyResult.format());
      return;
    }

    if (params.id !== body.id) {
      res.error(HttpCodes.BAD_REQUEST, `IDs provided do not match`);
      return;
    }

    if (!req.isAuthenticated() || !req.user) {
      res.error(HttpCodes.UNAUTHORIZED, `Unauthorized access for unsigned user at doProfileEdit`);
      return;
    }

    const m = makeUsersManager(req);

    const u = await m.editExisting(makeUserEditModel({ id: params.id, displayName: body.displayName }));

    if (!u) {
      req.logger.error(
        `Error while trying to update the profile for user ID ${params.id} from user ${req.user.id}`);
    }

    const message = u ? 'Profile updated' : 'There was an error while trying to update the profile';

    const props: ChangeProfileProps = {
      req,
      user: u || req.user,
      message,
      lockForm: true,
    };

    res.render('accounts/changeProfile', props);
  },

  /**
   * Renders the form
   */
  getChangePasswordForm: async (req, res, next) => {
    if (!misc.enablePasswordChange) {
      res.redirect('/');
      return;
    }

    const props: ChangePasswordProps = {
      req,
    };

    res.render('accounts/changePassword', props);
  },

  /**
   * Creates a user
   */
  doSignup: async (req, res, next) => {
    const body: Input.DoSignup = req.body;
    inspector.sanitize(inputSchema.DoSignup.sanitization, body);
    const vResult = inspector.validate(inputSchema.DoSignup.validation, body);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    if (!misc.enableSignup) {
      res.error(HttpCodes.UNAUTHORIZED, 'User tried to use disabled feature', 'Disabled feature');
      return;
    }

    if (req.isAuthenticated() || req.user) {
      res.error(HttpCodes.UNAUTHORIZED);
      return;
    }

    const userManager = makeUsersManager(req);

    if (!req.auth) {
      res.error(HttpCodes.INTERNAL_SERVER_ERROR, `Middleware for password hash was not sent to controller`);
      return;
    }

    try {

      // Checking if email is already taken
      if (await userManager.emailExists(body.email)) {
        const p: SignupProps = {
          req,
          emailTaken: true,
        };
        res.render('accounts/signup', p);
        return;
      }

      // Inserting in the database
      const [wasHashed, hashedPwd] = await req.auth.hash(body.pwd);

      if (wasHashed) {
        const user = makeUserAddModel({
          email: body.email,
          password: hashedPwd,
        });
        if (await userManager.insertUser(user)) {
          const p: LoginProps = {
            req,
            messageSignedUp: true,
          };
          res.render('accounts/login', p);
          return;
        } else {
          res.error(HttpCodes.INTERNAL_SERVER_ERROR);
          return;
        }
      } else {
        res.error(HttpCodes.INTERNAL_SERVER_ERROR);
        return;
      }
    } catch (e) {
      res.error(HttpCodes.INTERNAL_SERVER_ERROR, e);
    }
  },

  /**
   * Changes a user's password
   */
  doChangePassword: async (req, res, next) => {
    const body: Input.DoChangePassword = req.body;
    inspector.sanitize(inputSchema.DoChangePassword.sanitization, body);
    const vResult = inspector.validate(inputSchema.DoChangePassword.validation, body);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    if (!req.isAuthenticated() || !req.user) {
      res.error(HttpCodes.UNAUTHORIZED, `Unauthorized access for unsigned user at doChangePassword`);
      return;
    }

    if (!misc.enablePasswordChange) {
      res.error(HttpCodes.UNAUTHORIZED, 'User tried to use disabled feature', 'Disabled feature');
      return;
    }

    const userManager = makeUsersManager(req);

    const email = req.user.email;

    if (!req.auth) {
      res.error(
        HttpCodes.INTERNAL_SERVER_ERROR,
        `Middleware for password verification/hash was not sent to controller`);
      return;
    }

    try {

      const user = await userManager.verify(email, body.cpwd);

      if (!user) {
        const p: ChangePasswordProps = {
          req,
          passwordIncorrect: true,
        };
        res.render('accounts/changePassword', p);
        return;
      }

      const [wasHashed, hashedPwd] = await req.auth.hash(body.pwd);

      if (wasHashed) {
        if (await userManager.changePassword(email, hashedPwd)) {
          const p: ChangePasswordProps = {
            req,
            passwordChanged: true,
            lockForm: true,
          };
          res.render('accounts/changePassword', p);
          return;
        } else {
          res.error(HttpCodes.INTERNAL_SERVER_ERROR);
          return;
        }

      } else {
        res.error(HttpCodes.INTERNAL_SERVER_ERROR);
        return;
      }
    } catch (e) {
      res.error(HttpCodes.INTERNAL_SERVER_ERROR, e);
    }
  },

  /**
   * Form to edit one item
   */
  getEditForm: async (req, res, next) => {
    const params: Input.GetEditForm = req.params;
    inspector.sanitize(inputSchema.GetEditForm.sanitization, params);
    const vResult = inspector.validate(inputSchema.GetEditForm.validation, params);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    const m = makeUsersManager(req);

    const item = await m.getOne(params.id);

    if (!item) {
      res.error(HttpCodes.NOT_FOUND);
      return;
    } else {
      const props: EditFormProps = {
        req,
        user: item,
      };
      res.render('accounts/edit', props);
    }
  },

  /**
   * Edits an item
   */
  doEdit: async (req, res, next) => {
    const params: Input.DoEdit.Params = req.params;
    inspector.sanitize(inputSchema.DoEdit.Params.sanitization, params);
    const vParamsResult = inspector.validate(inputSchema.DoEdit.Params.validation, params);
    if (!vParamsResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vParamsResult.format());
      return;
    }

    const body: Input.DoEdit.Body = req.body;
    inspector.sanitize(inputSchema.DoEdit.Body.sanitization, body);
    const vBodyResult = inspector.validate(inputSchema.DoEdit.Body.validation, body);
    if (!vBodyResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vBodyResult.format());
      return;
    }

    if (!req.isAuthenticated() || !req.user) {
      res.error(HttpCodes.UNAUTHORIZED, `Unauthorized access for unsigned user at doEdit`);
      return;
    }

    if (body.id !== params.id) {
      res.error(HttpCodes.BAD_REQUEST, 'Body and params id do not match');
      return;
    }

    // Admin editing their own rank is not allowed
    if (body.id === req.user.id && body.rank !== req.user.rank) {
      res.error(HttpCodes.BAD_REQUEST);
      return;
    }

    const m = makeUsersManager(req);

    const isRankValid = Object.keys(Ranks).map((k) => Ranks[k as keyof typeof Ranks]).includes(body.rank);

    if (!isRankValid) {
      res.error(HttpCodes.BAD_REQUEST);
      return;
    }

    const edited = await m.adminEditExisting(makeAdminUserEditModel({
      id: body.id,
      displayName: body.displayName,
      rank: body.rank,
    }));

    if (!edited) {
      res.error(HttpCodes.INTERNAL_SERVER_ERROR);
      return;
    } else {
      const p: ViewOneProps = {
        req,
        user: edited,
      };
      res.render('accounts/viewOne', p);
    }
  },

};

export { controller };
