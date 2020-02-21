import * as React from 'react';

export interface Props {
  readonly messages: (string | undefined)[];
}

export function MessageBox(props: Props) {
  const filteredMessages = props.messages.filter((m) => !!m);

  if (filteredMessages.length < 1) return null;

  return(
    <div className='container'>
      {filteredMessages.map((m, i: number) => (
        <div key={i} className='message'>
          {m}
        </div>
      ))}
    </div>
  );
}
