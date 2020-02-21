import { MAX_STR_LEN } from '../partials/constants';

const validation = {
  type: 'object',
  strict: true,
  properties: {
    originalname: {type: 'string',  optional: false},
    encoding:     {type: 'string',  optional: false},
    mimetype:     {type: 'string',  optional: false},
    destination:  {type: 'string',  optional: false},
    filename:     {type: 'string',  optional: false},
    path:         {type: 'string',  optional: false},
    size:         {type: 'integer', optional: false, gte: 0},
    buffer:       {type: Buffer,    optional: false},
  },
};

const sanitization = {
  type: 'object',
  strict: true,
  properties: {
    originalname: {type: 'string', maxLength: MAX_STR_LEN, def: ''},
    encoding:     {type: 'string', maxLength: MAX_STR_LEN, def: ''},
    mimetype:     {type: 'string', maxLength: MAX_STR_LEN, def: ''},
    destination:  {type: 'string', maxLength: MAX_STR_LEN, def: ''},
    filename:     {type: 'string', maxLength: MAX_STR_LEN, def: ''},
    path:         {type: 'string', maxLength: MAX_STR_LEN, def: ''},
    size:         {type: 'integer', def: 0},
    buffer:       {type: Buffer, def: Buffer.from('')},
  },
};

export { validation, sanitization };
