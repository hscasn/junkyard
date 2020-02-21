import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { SimpleLayout as Layout } from '../../layouts/simple';

export interface Props {
  readonly req: Request;
  readonly email: string;
  readonly token: string;
}

export default function ResetPassword(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle} - Reset password`} req={props.req}>
      <div>
        <form id='pwdReset-form' method='post' action='/accounts/resetPassword'>
          <div id='alert-password-match' style={{ display: 'none' }}>The passwords typed do not match</div>
          <div id='alert-password-invalid' style={{ display: 'none' }}>
            The password must have at least 8 characters, composed of letters and numbers
          </div>
          <div id='alert-token-invalid' style={{ display: 'none' }}>
            This token is no longer valid, please request a new one
          </div>
          <div id='alert-email-invalid' style={{ display: 'none' }}>
            There was a problem while trying to validate your token, please request a new one
          </div>
          <div id='alert-unknown-error' style={{ display: 'none' }}>
            An unknown error happened. Please contact the administrator
          </div>
          <input type='hidden' id='pwdReset-email' name='email' value={props.email} />
          <input type='hidden' id='pwdReset-token' name='token' value={props.token} />
          <div>
            <label>Password:</label>
            <input type='password' id='pwd1' name='pwd' maxLength={40} autoFocus required />
          </div>
          <div>
            <label>Confirm your password:</label>
            <input type='password' id='pwd2' maxLength={40} required />
          </div>
          <br />
          <br />
          <div>
            <button type='submit' id='pwdReset-button'>Reset password</button>
          </div>
          <br />
          <br />
          <div><a href='/accounts/signup'>Sign up</a></div>
          <div><a href='/accounts/login'>Login</a></div>
        </form>
        <script src='/public/js/passwordReset.js'></script>
      </div>
    </Layout>
  );
}
