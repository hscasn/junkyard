import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { SimpleLayout as Layout } from '../../layouts/simple';

export interface Props {
  readonly req: Request;
}

export default function RequestPwdRecover(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle} - Password recovery`} req={props.req}>
      <div>
        <form id='pwdRecovery-form' method='post' action='/accounts/requestPwdRecovery'>
          <div id='alert-email-invalid' style={{ display: 'none' }}>Please type a valid email</div>
          <div>
            <label>Email:</label>
            <input type='text' id='email' name='email' maxLength={60} autoFocus required />
          </div>
          <br />
          <br />
          <div>
            <button type='submit' id='pwdRecovery-button'>Send password recovery email</button>
          </div>
          <br />
          <br />
          <div><a href='/accounts/signup'>Sign up</a></div>
          <div><a href='/accounts/login'>Login</a></div>
        </form>
        <script src='/public/js/passwordRecovery.js'></script>
      </div>
    </Layout>
  );
}
