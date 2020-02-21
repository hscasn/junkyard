import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { CompositeLayout as Layout } from '../../layouts/composite';
import { Links } from '../../elements/menu';
import { UserModel } from '../../../models/User';
import * as userRanks from '../../../lib/userRanks';

export interface Props {
  readonly req: Request;
  readonly user: UserModel;
}

export default function ModelsEdit(props: Props) {
  const options: any[] = [];
  for (const n in userRanks.Ranks) {
    if (userRanks.Ranks[(n as keyof typeof userRanks.Ranks)] >= 0) {
      options.push(<option value={userRanks.Ranks[n]}
                           selected={props.user.rank === (userRanks.Ranks[n] as any)}>{n}</option>);
    }
  }

  return(
    <Layout title={`${misc.websiteTitle} - Edit user ${props.user.displayName || props.user.email}`}
            sectionTitle={`Edit user ${props.user.displayName || props.user.email}`}
            activeLinks={[Links.UserList]}
            req={props.req}>

      <div className='main-nav-button'>
        <a href='/accounts/users'>Back</a>
      </div>

      <form action={`/accounts/users/${props.user.id}`} id='user-form' method='post'>
        <input type='hidden' name='id' value={props.user.id} />
        <div>
          <label>Display name:</label>
          <input type='text' name='displayName' id='user-displayName'
                 value={props.user.displayName} maxLength={60} autoFocus />
        </div>
        <div>
          <label>Rank:</label>
          <select name='rank' id='user-rank'>
            {options}
          </select>
        </div>
        <br />
        <br />
        <div>
          <button type='submit' id='user-submit'>Edit</button>
        </div>
      </form>
      <script src='/public/js/editUserValidation.js'></script>
    </Layout>
  );
}
