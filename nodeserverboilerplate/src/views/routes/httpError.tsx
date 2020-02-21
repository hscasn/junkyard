import * as React from 'react';
import { Request } from 'express';
import * as HttpCodes from 'http-status-codes';

import { misc } from '../../config/misc';

import { SimpleLayout as Layout } from '../layouts/simple';

export interface Props {
  readonly req: Request;
  readonly message: string;
  readonly httpCode: number;
}

export default function HttpError(props: Props) {
  let error: string = `Error ${props.httpCode} - `;
  switch (props.httpCode) {
    case HttpCodes.BAD_REQUEST:           error += 'Bad Request'; break;
    case HttpCodes.NOT_FOUND:             error += 'Not Found'; break;
    case HttpCodes.INTERNAL_SERVER_ERROR: error += 'Internal Error'; break;
    case HttpCodes.UNAUTHORIZED:          error += 'Unauthorized'; break;
  }

  return(
    <Layout title={`${misc.websiteTitle} - ${error}`} req={props.req}>
      {error}
      <br />
      {props.message}
    </Layout>
  );
}
