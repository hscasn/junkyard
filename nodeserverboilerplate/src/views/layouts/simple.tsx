import * as React from 'react';
import { Request } from 'express';

export interface Props {
  readonly req: Request;
  readonly title: string;
  readonly children: any;
}

export function SimpleLayout(props: Props) {
  return(
    <html>
      <head>
        <title>{props.title}</title>
        <link rel='stylesheet' href='/public/css/normalize.css' type='text/css' />
        <link rel='stylesheet' href='/public/css/skeleton.css' type='text/css' />
        <link rel='stylesheet' href='/public/css/theme.css' type='text/css' />
      </head>
      <body>
        <div className='container container-simple-layout'>
          {props.children}
        </div>
      </body>
    </html>
  );
}
