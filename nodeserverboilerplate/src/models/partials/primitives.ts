import { MAX_STR_LEN } from './constants';

const id = {
  sanitization: {
    type: 'integer',
  },
  validation: {
    type: 'integer',
    optional: false,
    rules: {
      min: 1,
      max: 9223372036854775807,
    },
  },
};

const NAME = {
  sanitization: {
    type: 'string',
  },
  validation: {
    type: 'string',
    optional: false,
    rules: ['trim'],
    maxLength: MAX_STR_LEN,
  },
};

export {
  id,
  NAME,
};
