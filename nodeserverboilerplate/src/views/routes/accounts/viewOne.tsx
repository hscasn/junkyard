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

export default function UserViewOne(props: Props) {
  const isAdmin = userRanks.isAdmin(props.req);

  return(
    <Layout title={`${misc.websiteTitle} - ${props.user.displayName || props.user.email}`}
            sectionTitle={`User ${props.user.displayName || props.user.email}`}
            activeLinks={[Links.UserList]}
            req={props.req}>

      {isAdmin ? (
        <div className='main-nav-button'>
          <a href='/accounts/users'>Back</a>
          <a href={`/accounts/users/${props.user.id}/edit`}>Edit</a>
          <a href={`/accounts/users/${props.user.id}/delete`}>Delete</a>
        </div>
      ) : null}

      <div className='table'>
        <div className='row'>
          <div className='two columns'>Email</div>
          <div className='ten columns'>{props.user.email}</div>
        </div>
        <div className='row'>
          <div className='two columns'>Display name</div>
          <div className='ten columns'>{props.user.displayName}</div>
        </div>
        <div className='row'>
          <div className='two columns'>Rank</div>
          <div className='ten columns'>{props.user.rankName}</div>
        </div>
      </div>

    </Layout>
  );
}
