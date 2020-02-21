import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { CompositeLayout as Layout } from '../../layouts/composite';
import { Links } from '../../elements/menu';
import { PromptBox } from '../../elements/promptBox';
import { ExampleModel } from '../../../models/Example';

export interface Props {
  readonly req: Request;
  readonly item: ExampleModel;
}

export default function ExamplesDeletePrompt(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle} - ${props.item.property}`}
            sectionTitle={`Delete resource ${props.item.property}`}
            activeLinks={[Links.Examples]}
            req={props.req}>

      <PromptBox message={`Are you sure you want to delete ${props.item.property}?`}
                 cancelLink={`/examples`}
                 method='post'
                 confirmAction={`/examples/${props.item.id}/delete`} />

    </Layout>
  );
}
