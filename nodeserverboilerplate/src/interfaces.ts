import { LoggerOptions } from 'bunyan';
import { SmtpOptions } from 'nodemailer-smtp-transport';
import { RequestHandler } from 'express';

/**
 * Describes a middleware
 */
export interface Middleware extends RequestHandler {}

/**
 * Describes a method of a controller
 */
export interface ControllerMethod extends Middleware {}

/**
 * Possible outputs for API
 */
export interface ApiResponse<T> {
  error:      number | null;
  errorTitle: string | null;
  message:    string | null;
  data:       T;
}

/**
 * Configuration
 */
export interface Config {
  /**
   * Interface for the server configuration file
   */
  server: {
    readonly httpPort: number,
    readonly loginDisabled: boolean,
  };

  /**
   * Interface for the logger configuration file
   */
  logger: {
    readonly [ id: string]: LoggerOptions,
    readonly requests:      LoggerOptions,
    readonly messages:      LoggerOptions,
    readonly client:        LoggerOptions,
  };

  /**
   * Interface for misc configuration
   */
  misc: {
    readonly websiteAddress:          string,
    readonly websiteTitle:            string,
    readonly saltRounds:              number,
    readonly passwordTokenExpireTime: number,
    readonly enableSignup:            boolean,
    readonly enableLogin:             boolean,
    readonly enablePasswordRecovery:  boolean,
    readonly enablePasswordChange:    boolean,
    readonly uploadDirectory?:        string,
  };

  /**
   * Interface for database configuration
   */
  database: {
    readonly type:             string,
    readonly user:             string,
    readonly password:         string,
    readonly database:         string,
    readonly host:             string,
    readonly port:             number,
    readonly synchronize:      boolean,
    readonly logging:          boolean,
    readonly createDefAdmin:   boolean,
    readonly defAdminEmail:    string,
    readonly defAdminPassword: string,
  };

  /**
   * Interface for emailer configuration
   */
  emailer: SmtpOptions;
}
