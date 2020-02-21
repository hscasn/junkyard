import * as React from 'react';

export interface Props {
  readonly activeLinks: Links[];
  readonly isAdmin: boolean;
  readonly isAuthenticated: boolean;
}

export enum Links {
  Home,
  ChangeProfile,
  ChangePassword,
  UserList,
  Logout,

  Examples,
}

export function Menu(props: Props) {
  function classFor(link: Links) {
    if (props.activeLinks.includes(link)) return 'link-active';
    return '';
  }

  const userManagement = [
    <label>Manage users</label>,
    <li><a href='/accounts/users' className={classFor(Links.UserList)}>User list</a></li>,
  ];

  return(
    <nav className='menu'>
      <ul>
        <li><a href='/' className={classFor(Links.Home)}>Home</a></li>

        {props.isAuthenticated ? ([
          <li key='chPrf'>
            <a href='/accounts/changeProfile' className={classFor(Links.ChangeProfile)}>Change profile</a>
          </li>,
          <li key='chPwd'>
            <a href='/accounts/changePassword' className={classFor(Links.ChangePassword)}>Change password</a>
          </li>,
          <li key='logout'><a href='/accounts/logout' className={classFor(Links.Logout)}>Logout</a></li>,
        ]) : ([
          <li key='login'><a href='/accounts/login'>Login</a></li>,
          <li key='register'><a href='/accounts/signup'>Register</a></li>,
        ])}

        {props.isAdmin ? userManagement : null}

        {props.isAuthenticated ? ([
          <label key='rmLabel'>Examples</label>,
          <li key='rml1'><a href='/examples' className={classFor(Links.Examples)}>Sample model</a></li>,
        ]) : null}
      </ul>
    </nav>
  );
}
