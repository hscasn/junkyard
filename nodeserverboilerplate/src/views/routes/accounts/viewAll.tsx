import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { CompositeLayout as Layout } from '../../layouts/composite';
import { UserModel } from '../../../models/User';
import { Links } from '../../elements/menu';
import * as userRanks from '../../../lib/userRanks';

export interface Props {
  readonly req: Request;
  readonly userList: UserModel[];
}

export default function UserViewAll(props: Props) {
  const isAdmin = userRanks.isAdmin(props.req);

  if (!props.req.user) {
    return null;
  }

  const ownId = props.req.user.id;

  return(
    <Layout title={`${misc.websiteTitle} - User list`}
            sectionTitle={'User list'}
            activeLinks={[Links.UserList]}
            req={props.req}>
      <table className='u-full-width'>
        <thead>
          <tr>
            <th style={{ width: '200px' }} className='col-centered'>Email</th>
            <th>Name</th>
            <th style={{ width: '250px' }} className='col-centered'>Rank</th>
            {isAdmin ? (
              <th />
            ) : null}
          </tr>
        </thead>
        <tbody>
          {props.userList.map((user, i: number) => (
            <tr key={i}>
              <td className='col-centered'><a href={`/accounts/users/${user.id}`}>{user.email}</a></td>
              <td>{user.displayName}</td>
              <td className='col-centered'>{user.rankName}</td>
              {isAdmin && user.id !== ownId ? (
                <td className='col-centered'>
                  <a href={`/accounts/users/${user.id}/edit`}>Edit</a>
                  <span> | </span>
                  <a href={`/accounts/users/${user.id}/delete`}>Delete</a>
                </td>
              ) : isAdmin ? (
                <td className='col-centered' />
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
