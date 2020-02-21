import * as React from 'react';
import { Request } from 'express';

import { misc } from '../../config/misc';

import { SimpleLayout as Layout } from '../layouts/simple';

export enum MessageType {
  Error,
  Warn,
  Info,
  Success,
}

export interface Props {
  readonly req:         Request;
  readonly message:     string;
  readonly messageType: MessageType;
  readonly httpCode:    number;
}

export default function Message(props: Props) {
  return(
    <Layout title={`${misc.websiteTitle}`} req={props.req}>
      {props.message}
    </Layout>
  );
}
