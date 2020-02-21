import { Request } from 'express';
import * as React from 'react';

import { misc } from '../../../config/misc';

import { CompositeLayout as Layout } from '../../layouts/composite';
import { Links } from '../../elements/menu';
import { UserModel } from '../../../models/User';
import { MessageBox } from '../../elements/messageBox';

export interface Props {
  readonly req: Request;
  readonly user: UserModel;
  readonly message?: string;
  readonly lockForm?: boolean;
}

export default function ChangeProfile(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle} - Change profile`}
            req={props.req}
            sectionTitle={'Change profile'}
            activeLinks={[Links.ChangeProfile]}>
      <MessageBox messages={[props.message]} />
      <div>
        <form id='changeProfile-form' method='post' action={`/accounts/changeProfile/${props.user.id}`}>
          <input type='hidden' name='id' value={props.user.id} />
          <div>
            <label>Display name:</label>
            <input type='text'
                   id='displayName'
                   name='displayName'
                   disabled={props.lockForm}
                   maxLength={40}
                   autoFocus
                   value={props.user.displayName} />
          </div>
          <br />
          <br />
          <div>
            <button type='submit'
                    disabled={props.lockForm}
                    id='changeProfile-button'>Change profile</button>
          </div>
        </form>
        <script src='/public/js/changeProfileValidation.js'></script>
      </div>
    </Layout>
  );
}
