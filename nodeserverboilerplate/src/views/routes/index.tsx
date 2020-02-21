import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../config/misc';

import { CompositeLayout as Layout } from '../layouts/composite';
import { Links } from '../elements/menu';

export interface Props {
  readonly req: Request;
}

export default function Index(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle}`}
            sectionTitle={'Home'}
            activeLinks={[Links.Home]}
            req={props.req}>
      Index
    </Layout>
  );
}
