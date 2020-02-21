import * as React from 'react';
import { UserModel } from '../../models/User';

export interface Props {
  readonly currentUser: UserModel | undefined;
}

export function Header(props: Props) {
  let headerLink: any = null;

  if (props.currentUser) {
    headerLink = (
      <a href={`/accounts/self`}>
        {`${props.currentUser.displayName || props.currentUser.email} (${props.currentUser.rankName})`}
      </a>
    );
  }

  return(
    <header>
      <div className='six columns'>
        <h1>Header</h1>
      </div>
      <div className='six columns' style={{ textAlign: 'right' }}>
        {headerLink}
      </div>
    </header>
  );
}
