import { Logger } from '../logger';
import { Middleware } from '../../interfaces';
import { Transporter } from 'nodemailer';
import { misc } from '../../config/misc';

export interface Emailer {
  NAME: string;
  sendPasswordRecovery: (email: string, token: string) => void;
  middleware: Middleware;
}

function makeEmailer(transport: Transporter, logger: Logger): Emailer {

  const that: Emailer = {
    NAME: 'emailer',

    /**
     * Sends an email for password recovery
     */
    sendPasswordRecovery: (email: string, token: string) => {
      const link = `${misc.websiteAddress}/accounts/resetPassword?token=${token}&email=${email}`;

      const options: {
        from: string,
        to: string,
        subject: string,
        text: string,
      } = {
        from: `Do not reply - ${misc.websiteTitle}`,
        to: email,
        subject: 'Password recovery',
        text: `A password reset was requested for this email address\n` +
              `If you did not make this request, you can safely ignore this email.\n` +
              `If you do want to reset your password, visit this link:\n ${link}`,
      };

      transport.sendMail(options, (err) => {
        if (err) {
          logger.error(`Error while sending password recovery email: ${err.message} ${err.stack}`);
        }
      });
    },

    /**
     * Attaches the emailer to the context of a route
     */
    middleware: async (req, res, next) => {
      req.emailer = that;
      next();
    },
  };

  return that;

}

export { makeEmailer };
