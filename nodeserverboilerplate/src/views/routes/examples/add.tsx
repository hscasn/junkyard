import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { CompositeLayout as Layout } from '../../layouts/composite';
import { Links } from '../../elements/menu';

export interface Props {
  readonly req: Request;
}

export default function ExamplesAdd(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle} - Add Resource`}
            sectionTitle={'Add resource'}
            activeLinks={[Links.Examples]}
            req={props.req}>

      <div className='main-nav-button'>
        <a href='/models'>Back</a>
      </div>

      <form action='/examples' id='resource-form' method='post' encType='multipart/form-data'>
        <div id='alert-property-invalid' style={{ display: 'none' }}>Please type a valid property</div>
        <div>
          <label>Property:</label>
          <input type='text' name='property' id='resource-property' maxLength={60} autoFocus required />
        </div>
        <div>
          <label>Thumbnail:</label>
          <input type='file' name='thumbnail' id='resource-thumbnail' />
        </div>
        <br />
        <br />
        <div>
          <button type='submit' id='resource-submit'>Add</button>
        </div>
      </form>
      <script src='/public/js/addModelValidation.js'></script>
    </Layout>
  );
}
