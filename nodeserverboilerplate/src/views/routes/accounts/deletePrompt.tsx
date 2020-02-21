import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { CompositeLayout as Layout } from '../../layouts/composite';
import { Links } from '../../elements/menu';
import { PromptBox } from '../../elements/promptBox';
import { UserModel } from '../../../models/User';

export interface Props {
  readonly req: Request;
  readonly user: UserModel;
}

export default function UserDeletePrompt(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle} - ${props.user.displayName || props.user.email}`}
            sectionTitle={`Delete resource ${props.user.displayName || props.user.email}`}
            activeLinks={[Links.UserList]}
            req={props.req}>

      <PromptBox message={`Are you sure you want to delete ${props.user.displayName || props.user.email}?`}
                 cancelLink={`/accounts/users`}
                 method='post'
                 confirmAction={`/accounts/users/${props.user.id}/delete`} />

    </Layout>
  );
}
