import * as HttpCode from 'http-status-codes';
import { Application } from 'express-serve-static-core';
import { PassportStatic } from 'passport';
import * as multer from 'multer';

import { Middleware } from '../../interfaces';

import { Props as HttpErrorProps } from '../../views/routes/httpError';

// Routes
import { controller as IndexController } from '../../controllers';
import { controller as ExamplesController } from '../../controllers/examples';
import { controller as AccountsController } from '../../controllers/accounts';

// APIs
import { controller as ClientLoggerApi } from '../../controllers/api/clientLogger';

import { Ranks } from '../userRanks';

/**
 * Initializes the router object: registers the routes
 * @param router
 * @param tools
 */
export function setupRoutes(app: Application, tools: {
  passport:     PassportStatic,
  multipart:    multer.Instance,
  authorize:    ((requiredRanks: number[]) => Middleware),
  auth:         Middleware,
  emailer:      Middleware,
}): void {

  // RESOURCE EXAMPLES
  // ==================================================================================================================
  app.get('/examples',
    tools.authorize([Ranks.S_Registered]),
    ExamplesController.viewAll,
  );
  app.get('/examples/add',
    tools.authorize([Ranks.S_Registered]),
    ExamplesController.addForm,
  );
  app.get('/examples/:id',
    tools.authorize([Ranks.S_Registered]),
    ExamplesController.viewOne,
  );
  app.get('/examples/:id/edit',
    tools.authorize([Ranks.S_Registered]),
    ExamplesController.editForm,
  );
  app.get('/examples/:id/delete',
    tools.authorize([Ranks.S_Registered]),
    ExamplesController.deletePrompt,
  );
  app.post('/examples',
    tools.authorize([Ranks.S_Registered]),
    tools.multipart.single('thumbnail'),
    ExamplesController.doAdd,
  );
  app.post('/examples/:id',
    tools.authorize([Ranks.S_Registered]),
    ExamplesController.doEdit,
  );
  app.post('/examples/:id/delete',
    tools.authorize([Ranks.S_Registered]),
    ExamplesController.doDelete,
  );

  // MISC
  // ==================================================================================================================

  // ACCOUNTS
  // ==================================================================================================================
  app.get('/accounts/login',
    tools.authorize([Ranks.S_NotRegistered]),
    AccountsController.getLoginForm,
  );
  app.post('/accounts/login',
    tools.authorize([Ranks.S_NotRegistered]),
    tools.passport.authenticate('local-login', {
      successRedirect: '/',
      failureRedirect: '/accounts/login?wrongCredentials=true',
    }),
  );
  app.post('/accounts/logout',
    tools.authorize([Ranks.S_Any]),
    AccountsController.doLogout,
  );
  app.get('/accounts/signup',
    tools.authorize([Ranks.S_NotRegistered]),
    AccountsController.getSignupForm,
  );
  app.get('/accounts/requestPwdRecovery',
    tools.authorize([Ranks.S_NotRegistered]),
    AccountsController.getRecoveryForm,
  );
  app.post('/accounts/requestPwdRecovery',
    tools.emailer,
    tools.authorize([Ranks.S_NotRegistered]),
    AccountsController.doRecovery,
  );
  app.get('/accounts/resetPassword',
    tools.authorize([Ranks.S_NotRegistered]),
    AccountsController.getResetPasswordForm,
  );
  app.post('/accounts/resetPassword',
    tools.auth,
    tools.authorize([Ranks.S_NotRegistered]),
    AccountsController.doResetPasswordEdit,
  );
  app.get('/accounts/changePassword',
    tools.authorize([Ranks.S_Registered]),
    AccountsController.getChangePasswordForm,
  );
  app.get('/accounts/changeProfile',
    tools.authorize([Ranks.S_Registered]),
    AccountsController.getProfileEditForm,
  );
  app.post('/accounts/changeProfile/:id',
    tools.authorize([Ranks.S_Registered]),
    AccountsController.doProfileEdit,
  );
  app.post('/accounts/signup',
    tools.auth,
    tools.authorize([Ranks.S_NotRegistered]),
    AccountsController.doSignup,
  );
  app.post('/accounts/changePassword',
    tools.auth,
    tools.authorize([Ranks.S_Registered]),
    AccountsController.doChangePassword,
  );
  app.get('/accounts/logout',
    tools.authorize([Ranks.S_Registered]),
    async (req, res, next) => {
      req.logout();
      res.redirect('/');
    },
  );
  app.get('/accounts/self',
    tools.authorize([Ranks.S_Registered]),
    AccountsController.viewSelf,
  );

  // Administrators only
  app.get('/accounts/users/:id',
    tools.authorize([Ranks.Admin]),
    AccountsController.viewOne,
  );
  app.get('/accounts/users',
    tools.authorize([Ranks.Admin]),
    AccountsController.viewAll,
  );
  app.get('/accounts/users/:id/delete',
    tools.authorize([Ranks.Admin]),
    AccountsController.deletePrompt,
  );
  app.post('/accounts/users/:id/delete',
    tools.authorize([Ranks.Admin]),
    AccountsController.doDelete,
  );
  app.get('/accounts/users/:id/edit',
    tools.authorize([Ranks.Admin]),
    AccountsController.getEditForm,
  );
  app.post('/accounts/users/:id',
    tools.authorize([Ranks.Admin]),
    AccountsController.doEdit,
  );

  // API
  // ==================================================================================================================
  app.post('/api/clientLog/:level',
    ClientLoggerApi.get,
  );

  // DEFAULT ROUTES
  // ==================================================================================================================
  app.get('/',
    tools.authorize([Ranks.S_Any]),
    IndexController.get,
  );
  app.get('*',
    async (req, res, next) => {
      const p: HttpErrorProps = {
        req,
        httpCode: HttpCode.NOT_FOUND,
        message: '',
      };
      res.render('httpError', p);
    },
  );

}
