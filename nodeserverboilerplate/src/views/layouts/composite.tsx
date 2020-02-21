import * as React from 'react';
import { Request } from 'express';

import { Menu, Links } from '../elements/menu';
import { Header } from '../elements/header';
import { ContentWrapper } from '../elements/contentWrapper';
import { Ranks } from '../../lib/userRanks';

export interface Props {
  readonly req: Request;
  readonly title: string;
  readonly activeLinks: Links[];
  readonly sectionTitle: string;
  readonly children: any;
}

export function CompositeLayout(props: Props) {
  const userIsAdmin = props.req.userRankIs([Ranks.Admin]);
  const userIsAuthenticated = props.req.isAuthenticated();

  return(
    <html>
      <head>
        <title>{props.title}</title>
        <link rel='stylesheet' href='/public/css/normalize.css' type='text/css' />
        <link rel='stylesheet' href='/public/css/skeleton.css' type='text/css' />
        <link rel='stylesheet' href='/public/css/theme.css' type='text/css' />
      </head>
      <body>
        <div className='row'>
          <Header currentUser={props.req.user} />
        </div>
        <div className='row'>
          <div className='two columns'>
            <Menu activeLinks={props.activeLinks} isAdmin={userIsAdmin} isAuthenticated={userIsAuthenticated} />
          </div>
          <div className='ten columns'>
            <ContentWrapper sectionTitle={props.sectionTitle}>
              {props.children}
            </ContentWrapper>
          </div>
        </div>
      </body>
    </html>
  );
}
