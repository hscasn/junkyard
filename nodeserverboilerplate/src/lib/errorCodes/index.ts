export enum ErrorCodes {
  BadSSHKeyFile = 100,
  BadSSHCertFile = 101,
  BadLogDir = 102,
  BadLogFile = 103,
  UncaughtException = 104,

  // ===========
  // API Errors
  // ===========

  // Sign up
  SignupEmailTaken = 1001,
  SignupPasswordInvalid = 1002,
  SignupEmailInvalid = 1004,

  // Password change
  PwdChangePasswordInvalid = 2001,
  PwdChangeCurrPasswordIncorrect = 2002,

  // Special
  UnknownError = -1,
}
