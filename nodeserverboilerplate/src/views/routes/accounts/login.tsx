import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { SimpleLayout as Layout } from '../../layouts/simple';

export interface Props {
  readonly req: Request;
  readonly wrongCredentials?: boolean;
  readonly messageSignedUp?: boolean;
  readonly messagePasswordReset?: boolean;
}

export default function Login(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle} - Login`} req={props.req}>
      <div>
        <form id='login-form' action='/accounts/login' method='post'>
          <div id='alert-email-invalid' style={{ display: 'none' }}>Please type a valid email</div>
          <div id='alert-password-invalid' style={{ display: 'none' }}>Please type a valid password</div>
          {props.wrongCredentials ? (
            <div>Wrong email or password</div>
          ) : (null)}
          {props.messageSignedUp ? (
            <div>You are now signed up! Please enter your credentials to log in</div>
          ) : (null)}
          {props.messagePasswordReset ? (
            <div>Your password was reset! Please enter your credentials to log in</div>
          ) : (null)}
          <div>
            <label>Email:</label>
            <input type='text' name='email' id='login-email' maxLength={60} required autoFocus />
          </div>
          <div>
            <label>Password:</label>
            <input type='password' name='password' id='login-password' maxLength={40} required />
          </div>
          <br />
          <br />
          <div>
            <button type='submit'>Log In</button>
          </div>
          <br />
          <br />
          <div><a href='/accounts/requestPwdRecovery'>I forgot my password</a></div>
          <div><a href='/accounts/signup'>Sign up</a></div>
        </form>
        <script src='/public/js/loginValidation.js'></script>
      </div>
    </Layout>
  );
}
