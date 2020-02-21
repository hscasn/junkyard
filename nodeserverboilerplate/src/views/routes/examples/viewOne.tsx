import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { CompositeLayout as Layout } from '../../layouts/composite';
import { Links } from '../../elements/menu';
import { ExampleModel } from '../../../models/Example';
import * as userRanks from '../../../lib/userRanks';

export interface Props {
  readonly req: Request;
  readonly item: ExampleModel;
}

export default function ExamplesViewOne(props: Props) {
  const isAdmin = userRanks.isAdmin(props.req);

  return(
    <Layout title={`${misc.websiteTitle} - ${props.item.property}`}
            sectionTitle={`Resource ${props.item.property}`}
            activeLinks={[Links.Examples]}
            req={props.req}>

        <div className='main-nav-button'>
          <a href='/examples'>Back</a>
          {isAdmin ? ([
            <a href={`/examples/${props.item.id}/edit`}>Edit</a>,
            <a href={`/examples/${props.item.id}/delete`}>Delete</a>,
          ]) : null}
        </div>

      <img src={`/examples/${props.item.id}`} style={{ maxWidth: '50%' }} />

    </Layout>
  );
}
