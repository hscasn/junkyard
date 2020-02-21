import * as HttpCodes from 'http-status-codes';
import * as inspector from 'schema-inspector';

import { data as responseData } from '../../../lib/apiResponses';
import { ControllerMethod } from '../../../interfaces';
import { MAX_STR_LEN } from '../../../models/partials/constants';

export namespace Input {
  export namespace Get {
    export interface Body {
      error: {
        message?: string,
        stack?: string,
      };
    }
    export interface Params {
      level: string;
    }
  }
}

export namespace Output {
  export interface Get {
    message: string;
  }
}

const inputSchema = {
  Get: {
    Params: {
      sanitization: {
        type: 'object',
        strict: true,
        properties: {
          level: { type: 'string', maxLength: MAX_STR_LEN },
        },
      },
      validation: {
        type: 'object',
        strict: true,
        properties: {
          level: { type: 'string', optional: false },
        },
      },
    },
    Body: {
      sanitization: {
        type: 'object',
        strict: true,
        properties: {
          error: {
            type: 'object',
            strict: false,
            properties: {
              message: { type: 'string', optional: true },
              stack: { type: 'string', optional: true },
            },
          },
        },
      },
      validation: {
        type: 'object',
        strict: true,
        properties: {
          error: {
            type: 'object',
            strict: false,
            properties: {
              message: { type: 'string', optional: true },
              stack: { type: 'string', optional: true },
            },
          },
        },
      },
    },
  },
};

const controller: {
  get: ControllerMethod,
} = {

  /**
   * GET
   */
  get: async (req, res, next) => {
    const params: Input.Get.Params = req.params;
    inspector.sanitize(inputSchema.Get.Params.sanitization, params);
    const vParamsResult = inspector.validate(inputSchema.Get.Params.validation, params);
    if (!vParamsResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vParamsResult.format());
      return;
    }

    const body: Input.Get.Body = req.body;
    inspector.sanitize(inputSchema.Get.Body.sanitization, body);
    const vBodyResult = inspector.validate(inputSchema.Get.Body.validation, body);
    if (!vBodyResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vBodyResult.format());
      return;
    }

    if (!['error', 'warn', 'info', 'debug', 'trace'].includes(params.level)) {
      res.error(HttpCodes.BAD_REQUEST, `Invalid level used at ${req.originalUrl}: '${params.level}'`);
      return;
    }

    const error = body.error;
    let message = `Client error: ${error.message}`;

    // We have a stack
    if (error.stack) {
      message += ` Stack: ${error.stack}`;
    }

    switch (params.level) {
      case 'error': req.logger.clientError(message); break;
      case 'warn': req.logger.clientWarn(message); break;
      case 'info': req.logger.clientInfo(message); break;
      case 'debug': req.logger.clientDebug(message); break;
      case 'trace': req.logger.clientTrace(message); break;
    }

    const response: Output.Get = { message };

    res.json(responseData<Output.Get>(response));
  },

};

export { controller };
