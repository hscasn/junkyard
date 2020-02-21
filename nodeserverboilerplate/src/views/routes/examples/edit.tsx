import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { CompositeLayout as Layout } from '../../layouts/composite';
import { Links } from '../../elements/menu';
import { ExampleModel } from '../../../models/Example';

export interface Props {
  readonly req: Request;
  readonly item: ExampleModel;
}

export default function ExamplesEdit(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle} - Edit Resource ${props.item.property}`}
            sectionTitle={`Edit resource ${props.item.property}`}
            activeLinks={[Links.Examples]}
            req={props.req}>

      <div className='main-nav-button'>
        <a href='/examples'>Back</a>
      </div>

      <form action={`/examples/${props.item.id}`} id='resource-form' method='post'>
        <div id='alert-property-invalid' style={{ display: 'none' }}>Please type a valid property</div>
        <input type='hidden' name='id' value={props.item.id} />
        <div>
          <label>Property:</label>
          <input type='text' name='property' id='resource-property'
                 value={props.item.property} maxLength={60} required />
        </div>
        <br />
        <br />
        <div>
          <button type='submit' id='resource-submit'>Edit</button>
        </div>
      </form>
      <script src='/public/js/editModelValidation.js'></script>
    </Layout>
  );
}
