import 'reflect-metadata';

import * as Express from 'express';
import * as http from 'http';
import * as RateLimit from 'express-rate-limit';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';
import * as helmet from 'helmet';
import * as nodemailer from 'nodemailer';
import session = require('cookie-session');
import * as compression from 'compression';
import * as multer from 'multer';
import * as bodyParser from 'body-parser';
import * as Bunyan from 'bunyan';
import * as fs from 'fs';
import * as reactViews from 'express-react-views';

// Configuration and other settings
import * as config from './config';

import { Middleware } from './interfaces';

// Libraries
import * as env from './lib/env';
import * as controllerResponses from './lib/controllerResponses';
import { Logger, makeLogger } from './lib/logger';
import { makeAuth } from './lib/auth';
import { setupPassport } from './lib/setupPassport';
import { attachDbPool } from './lib/dbPooling';
import { makeEmailer } from './lib/emailer';
import { setupRoutes } from './lib/setupRoutes';
import { bindRankCheck } from './lib/userRanks';
import { ErrorCodes } from './lib/errorCodes';
import { initializeDb } from './lib/dbInitializer';

// Setting up tools
// @todo fill user in context
const app = Express();
const logger: Logger = makeLogger(fs, Bunyan.createLogger, config.logger);
const rateLimit: Middleware = new RateLimit(config.rateLimit);
const auth = makeAuth(logger, config.server.loginDisabled, '/');
const emailer = makeEmailer(nodemailer.createTransport(config.emailer), logger);
const multipart = multer({ dest: config.misc.uploadDirectory });

// Catching uncaught exceptions: log it and let it crash
process.on('uncaughtException', (err: any) => {
  if (err === null || err === undefined) {
    return;
  }
  const e = (err && err.toString && err.toString()) || '-no error message-';
  const stack = (err && err.stack && err.stack.toString && err.stack.toString()) || '-no stack-';
  logger.fatal(`Uncaught exception: ${e} ${stack}`, ErrorCodes.UncaughtException);
});

// Setting up render engine
app.set('views', `${__dirname}/views/routes`);
app.set('view engine', 'js');
app.engine('js', reactViews.createEngine());

attachDbPool(app).then((connection) => {
  setupPassport(passport, connection);

  // Setting up middlewares for Express
  app.use(logger.visitRecorder())
    .use(logger.middleware.bind(logger))
    .use(session(config.session))
    .use(cookieParser())
    .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())
    .use(passport.initialize())
    .use(passport.session())
    .use(controllerResponses.attach())
    .use('/public', Express.static(`${__dirname}/public`))
    .use(compression())
    .use(rateLimit)
    .use(helmet())
    .use(bindRankCheck);

  // Setting up routes and sending tools to the middlewares
  setupRoutes(app, Object.freeze({
    passport,
    multipart,
    authorize: auth.authorize.bind(auth), // The BIND is important here
    auth: auth.middleware.bind(auth), // The BIND is important here
    emailer: emailer.middleware.bind(emailer), // The BIND is important here
  }));

  logger.info(`Using configuration ${config.getPrintableConfig(config)}`);

  // Initializing database
  initializeDb(connection, config.database, logger, auth.hash)
    .then(() => {
      http.createServer(app)
        .listen(config.server.httpPort, (): void => {
          logger.info(`Server HTTP started at port ${config.server.httpPort} in ${env.getModeString().toUpperCase()}`);
        });
    })
    .catch((err) => {
      if (err) {
        logger.fatal(`Could not initialize the database: ${err}`);
        return;
      }
    });
  });
