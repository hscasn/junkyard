import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { CompositeLayout as Layout } from '../../layouts/composite';
import { Links } from '../../elements/menu';

export interface Props {
  readonly req: Request;
  readonly passwordChanged?: boolean;
  readonly passwordIncorrect?: boolean;
  readonly lockForm?: boolean;
}

export default function ChangePassword(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle} - Change Password`}
            req={props.req}
            sectionTitle={'Change password'}
            activeLinks={[Links.ChangePassword]}>
      <div>
        <form id='changePwd-form' method='post' action={`/accounts/changePassword`}>
          <div id='alert-password-match' style={{ display: 'none' }}>The passwords typed do not match</div>
          <div id='alert-password-invalid' style={{ display: 'none' }}>
            The password must have at least 8 characters, composed of letters and numbers
          </div>
          <div id='alert-cpassword-invalid' style={{ display: 'none' }}>
            The current password must have at least 8 characters, composed of letters and numbers
          </div>
          <div id='alert-password-incorrect' style={{ display: props.passwordIncorrect ? 'block' : 'none' }}>
            The current password is incorrect
          </div>
          <div id='alert-password-changed' style={{ display: props.passwordChanged ? 'block' : 'none' }}>
            Your password was changed
          </div>
          <div>
            <label>Current password:</label>
            <input type='password' id='cpwd' name='cpwd' maxLength={40}  disabled={props.lockForm} autoFocus required/>
          </div>
          <div>
            <label>Password:</label>
            <input type='password' id='pwd1' name='pwd' maxLength={40}  disabled={props.lockForm} required />
          </div>
          <div>
            <label>Confirm your password:</label>
            <input type='password' id='pwd2' maxLength={40} disabled={props.lockForm} required />
          </div>
          <br />
          <br />
          <div>
            <button type='submit' id='changePwd-button' disabled={props.lockForm}>Change password</button>
          </div>
        </form>
        <script src='/public/js/changePwdValidation.js'></script>
      </div>
    </Layout>
  );
}
