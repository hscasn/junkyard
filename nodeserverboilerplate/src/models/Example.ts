import * as inspector from 'schema-inspector';

import { MAX_STR_LEN } from './partials/constants';
import { id, NAME } from './partials/primitives';
import { ExampleEntity } from '../entities/Example';

const schemaPartials = {
  property: {
    sanitization: {type: 'string', rules: ['trim', 'lower'], maxLength: MAX_STR_LEN},
    validation: {type: 'string', optional: false},
  },
  thumbnail: {
    sanitization: {type: 'string', rules: ['trim']},
    validation: {type: 'string', optional: false},
  },
  thumbnailMediaType: {
    sanitization: {type: 'string', rules: ['trim', 'lower']},
    validation: {type: 'string', optional: false},
  },
};

const schema = {
  ExampleModel: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        NAME:     NAME.sanitization,
        id:       id.sanitization,
        property: schemaPartials.property.sanitization,
      },
    },
    validation: {
      type: 'object',
      strict: true,
      properties: {
        NAME:     NAME.validation,
        id:       id.validation,
        property: schemaPartials.property.validation,
      },
    },
  },

  ExampleAddModel: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        NAME:               NAME.sanitization,
        property:           schemaPartials.property.sanitization,
        thumbnail:          schemaPartials.thumbnail.sanitization,
        thumbnailMediaType: schemaPartials.thumbnailMediaType.sanitization,
      },
    },
    validation: {
      type: 'object',
      strict: true,
      properties: {
        NAME:               NAME.validation,
        property:           schemaPartials.property.validation,
        thumbnail:          schemaPartials.thumbnail.validation,
        thumbnailMediaType: schemaPartials.thumbnailMediaType.validation,
      },
    },
  },

  ExampleEditModel: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        NAME:     NAME.sanitization,
        id:       id.sanitization,
        property: schemaPartials.property.sanitization,
      },
    },
    validation: {
      type: 'object',
      strict: true,
      properties: {
        NAME:     NAME.validation,
        id:       id.validation,
        property: schemaPartials.property.validation,
      },
    },
  },
};

export { schema };

export interface ExampleModel {
  NAME: string;
  id: number;
  property: string;
}

export interface ExampleAddModel {
  NAME: string;
  property: string;
  thumbnail: string;
  thumbnailMediaType: string;
}

export interface ExampleEditModel {
  NAME: string;
  id: number;
  property: string;
}

export function makeExampleModel(p: ExampleEntity): ExampleModel {
  const that: ExampleModel = {
    NAME: 'ExampleModel',
    id: p.id,
    property: p.property,
  };

  inspector.sanitize(schema.ExampleModel.sanitization, that);
  const vResult = inspector.validate(schema.ExampleModel.validation, that);
  if (!vResult.valid) {
    throw new Error(vResult.format());
  }

  return that;
}

export function makeExampleAddModel(p: { property: string, thumbnail: string,
  thumbnailMediaType: string}): ExampleAddModel {

  const that: ExampleAddModel = {
    NAME: 'ExampleAddModel',
    ...p,
  };

  inspector.sanitize(schema.ExampleAddModel.sanitization, that);
  const vResult = inspector.validate(schema.ExampleAddModel.validation, that);
  if (!vResult.valid) {
    throw new Error(vResult.format());
  }

  return that;
}

export function makeExampleEditModel(p: { id: number, property: string }): ExampleEditModel {
  const that: ExampleEditModel = {
    NAME: 'ExampleEditModel',
    ...p,
  };

  inspector.sanitize(schema.ExampleEditModel.sanitization, that);
  const vResult = inspector.validate(schema.ExampleEditModel.validation, that);
  if (!vResult.valid) {
    throw new Error(vResult.format());
  }

  return that;
}
