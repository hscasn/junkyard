import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { SimpleLayout as Layout } from '../../layouts/simple';

export interface Props {
  readonly req: Request;
  readonly emailTaken?: boolean;
  readonly lockForm?: boolean;
}

export default function Signup(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle} - Sign up`} req={props.req}>
      <div>
        <form id='signup-form' method='post' action={`/accounts/signup`}>
          <div id='alert-password-match' style={{ display: 'none' }}>
            The passwords typed do not match
          </div>
          <div id='alert-password-invalid' style={{ display: 'none' }}>
            The password must have at least 8 characters, composed of letters and numbers
          </div>
          <div id='alert-email-invalid' style={{ display: 'none' }}>
            The email typed is invalid
          </div>
          <div id='alert-email-used' style={{ display: (props.emailTaken ? 'block' : 'none') }}>
            The email is already being used
          </div>
          <div>
            <label>Email:</label>
            <input type='text' id='email' name='email' disabled={props.lockForm} autoFocus required />
          </div>
          <div>
            <label>Password:</label>
            <input type='password' id='pwd1' name='pwd' maxLength={40} disabled={props.lockForm} required />
          </div>
          <div>
            <label>Confirm your password:</label>
            <input type='password' id='pwd2' maxLength={40} disabled={props.lockForm} required />
          </div>
          <br />
          <br />
          <div>
            <button type='submit' id='signup-button' disabled={props.lockForm}>Sign up</button>
          </div>
          <br />
          <br />
          <div><a href='/accounts/requestPwdRecovery'>I forgot my password</a></div>
          <div><a href='/accounts/login'>Login</a></div>
        </form>
        <script src='/public/js/signupValidation.js'></script>
      </div>
    </Layout>
  );
}
