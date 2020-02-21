import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../../config/misc';

import { CompositeLayout as Layout } from '../../layouts/composite';
import { Links } from '../../elements/menu';
import { ExampleModel } from '../../../models/Example';
import * as userRanks from '../../../lib/userRanks';

export interface Props {
  readonly req: Request;
  readonly items: ExampleModel[];
}

export default function ExamplesViewAll(props: Props) {
  const isAdmin = userRanks.isAdmin(props.req);

  return(
    <Layout title={`${misc.websiteTitle} - Resources`}
            sectionTitle={'Resources'}
            activeLinks={[Links.Examples]}
            req={props.req}>

      {isAdmin ? (
        <div className='main-nav-button'>
          <a href='/examples/add'>Add</a>
        </div>
      ) : null}

      <table className='u-full-width'>
        <thead>
          <tr>
            <th style={{ width: '100px' }} className='col-centered'>ID</th>
            <th>Property</th>
            {isAdmin ? (
              <th style={{ width: '200px' }} className='col-centered' />
            ) : null}
          </tr>
        </thead>
        <tbody>
          {props.items.map((r, i: number) => (
            <tr key={i}>
              <td className='col-centered'>{r.id}</td>
              <td><a href={`/examples/${r.id}`}>{r.property}</a></td>
              {isAdmin ? (
                <td className='col-centered'>
                  <a href={`/examples/${r.id}/edit`}>Edit</a> | <a href={`/examples/${r.id}/delete`}>Delete</a>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
