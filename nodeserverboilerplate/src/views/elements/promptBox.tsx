import * as React from 'react';

export interface Props {
  readonly message: string;
  readonly cancelLink: string;
  readonly confirmAction: string;
  readonly method: string;
}

export function PromptBox(props: Props) {
  return(
    <div className='delete-prompt'>
      <form method={props.method} action={props.confirmAction}>
        <div>{props.message}</div>
        <span><a href={props.cancelLink}>Cancel</a></span>
        <button type='submit'>Confirm</button>
      </form>
    </div>
  );
}
