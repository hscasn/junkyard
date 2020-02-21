import * as React from 'react';

export interface Props {
  readonly sectionTitle: string;
  readonly children: any;
}

export function ContentWrapper(props: Props) {
  return(
    <main>
      <h4>{props.sectionTitle}</h4>
      <div className='main-content-body'>
        {props.children}
      </div>
    </main>
  );
}
