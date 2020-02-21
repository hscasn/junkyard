import * as HttpCodes from 'http-status-codes';
import * as inspector from 'schema-inspector';

import { ControllerMethod } from '../interfaces';
import { makeExamplesManager } from '../managers/example';
import { Props as ViewAllProps } from '../views/routes/examples/viewAll';
import { Props as ViewOneProps } from '../views/routes/examples/viewOne';
import { Props as AddFormProps } from '../views/routes/examples/add';
import { Props as EditFormProps } from '../views/routes/examples/edit';
import { Props as DeletePromptProps } from '../views/routes/examples/deletePrompt';
import { acceptsImage } from '../lib/controllerResponses';
import { makeExampleAddModel, makeExampleEditModel } from '../models/Example';
import { MAX_STR_LEN } from '../models/partials/constants';
import * as multerSchema from '../models/sharedSchemas/multer';

export namespace Input {
  export namespace DoAdd {
    export interface Body {
      property: string;
    }
    export type File = Express.Multer.File;
  }

  export namespace DoEdit {
    export interface Params {
      id: number;
    }
    export interface Body {
      id: number;
      property: string;
    }
  }

  export interface EditForm {
    id: number;
  }

  export interface ViewOne {
    id: number;
  }

  export interface DeletePrompt {
    id: number;
  }

  export interface DoDelete {
    id: number;
  }
}

const inputSchema = {
  DoAdd: {
    Body: {
      sanitization: {
        type: 'object',
        strict: true,
        properties: {
          property: { type: 'string', maxLength: MAX_STR_LEN },
        },
      },
      validation: {
        strict: true,
        properties: {
          property: { type: 'string', optional: false },
        },
      },
    },
    File: {
      sanitization: multerSchema.sanitization,
      validation: multerSchema.validation,
    },
  },
  DoEdit: {
    Params: {
      sanitization: {
        type: 'object',
        strict: true,
        properties: {
          id: { type: 'integer' },
        },
      },
      validation: {
        strict: true,
        properties: {
          id: { type: 'integer', gt: 0, optional: false },
        },
      },
    },
    Body: {
      sanitization: {
        type: 'object',
        strict: true,
        properties: {
          id: { type: 'integer' },
          property: { type: 'string', maxLength: MAX_STR_LEN },
        },
      },
      validation: {
        strict: true,
        properties: {
          id: { type: 'integer', gt: 0, optional: false },
          property: { type: 'string', optional: false },
        },
      },
    },
  },
  EditForm: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        id: { type: 'integer' },
      },
    },
    validation: {
      strict: true,
      properties: {
        id: { type: 'integer', gt: 0, optional: false },
      },
    },
  },
  ViewOne: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        id: { type: 'integer' },
      },
    },
    validation: {
      strict: true,
      properties: {
        id: { type: 'integer', gt: 0, optional: false },
      },
    },
  },
  DeletePrompt: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        id: { type: 'integer' },
      },
    },
    validation: {
      strict: true,
      properties: {
        id: { type: 'integer', gt: 0, optional: false },
      },
    },
  },
  DoDelete: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        id: { type: 'integer' },
      },
    },
    validation: {
      strict: true,
      properties: {
        id: { type: 'integer', gt: 0, optional: false },
      },
    },
  },
};

const controller: {
  viewAll: ControllerMethod,
  viewOne: ControllerMethod,
  addForm: ControllerMethod,
  editForm: ControllerMethod,
  deletePrompt: ControllerMethod,
  doAdd: ControllerMethod,
  doEdit: ControllerMethod,
  doDelete: ControllerMethod,
} = {

  /**
   * View list of all items
   */
  viewAll: async (req, res, next) => {
    const m = makeExamplesManager(req);

    const props: ViewAllProps = {
      req,
      items: await m.getAll(),
    };

    res.render('examples/viewAll', props);
  },

  /**
   * View one item
   */
  viewOne: async (req, res, next) => {
    const params: Input.ViewOne = req.params;
    inspector.sanitize(inputSchema.ViewOne.sanitization, params);
    const vResult = inspector.validate(inputSchema.ViewOne.validation, params);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    const m = makeExamplesManager(req);

    if (acceptsImage(req)) {
      const item = await m.getThumbnail(params.id);

      if (!item) {
        res.error(HttpCodes.NOT_FOUND);
        return;
      } else {
        res.image(item.type, item.content);
      }

    } else {
      const item = await m.getOne(params.id);

      if (!item) {
        res.error(HttpCodes.NOT_FOUND);
        return;
      } else {
        const props: ViewOneProps = {
          req,
          item,
        };
        res.render('examples/viewOne', props);
      }
    }
  },

  /**
   * Form to add one item
   */
  addForm: async (req, res, next) => {
    const props: AddFormProps = {
      req,
    };

    res.render('examples/add', props);
  },

  /**
   * Form to edit one item
   */
  editForm: async (req, res, next) => {
    const params: Input.EditForm = req.params;
    inspector.sanitize(inputSchema.EditForm.sanitization, params);
    const vResult = inspector.validate(inputSchema.EditForm.validation, params);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    const m = makeExamplesManager(req);

    const item = await m.getOne(params.id);

    if (!item) {
      res.error(HttpCodes.NOT_FOUND);
      return;
    } else {
      const props: EditFormProps = {
        req,
        item,
      };
      res.render('examples/edit', props);
    }
  },

  /**
   * Prompt for confirmation to delete an item
   */
  deletePrompt: async (req, res, next) => {
    const params: Input.DeletePrompt = req.params;
    inspector.sanitize(inputSchema.DeletePrompt.sanitization, params);
    const vResult = inspector.validate(inputSchema.DeletePrompt.validation, params);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    const m = makeExamplesManager(req);

    const item = await m.getOne(params.id);

    if (!item) {
      res.error(HttpCodes.NOT_FOUND);
      return;
    } else {
      const props: DeletePromptProps = {
        req,
        item,
      };
      res.render('examples/deletePrompt', props);
    }
  },

  /**
   * Adds an item
   */
  doAdd: async (req, res, next) => {
    const body: Input.DoAdd.Body = req.body;
    inspector.sanitize(inputSchema.DoAdd.Body.sanitization, body);
    const vBodyResult = inspector.validate(inputSchema.DoAdd.Body.validation, body);
    if (!vBodyResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vBodyResult.format());
      return;
    }

    const file: Input.DoAdd.File = req.file;
    inspector.sanitize(inputSchema.DoAdd.File.sanitization, file);
    const vFilesResult = inspector.validate(inputSchema.DoAdd.File.validation, file);
    if (!vFilesResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vFilesResult.format());
      return;
    }

    const m = makeExamplesManager(req);

    const property = body.property;

    const thumbnailFile = file;
    const thumbnailMediaType: string = thumbnailFile ? thumbnailFile.mimetype : '';
    const thumbnail: string = (thumbnailFile && thumbnailFile.size > 0)
      ? '\\x' + thumbnailFile.buffer.toString('hex')
      : '';

    const inserted = await m.addNew(makeExampleAddModel({ property, thumbnail, thumbnailMediaType }));

    if (!inserted) {
      res.error(HttpCodes.INTERNAL_SERVER_ERROR);
      return;
    } else {
      const p: ViewOneProps = {
        req,
        item: inserted,
      };
      res.render('examples/viewOne', p);
    }
  },

  /**
   * Edits an item
   */
  doEdit: async (req, res, next) => {
    const params: Input.DoEdit.Params = req.params;
    inspector.sanitize(inputSchema.DoEdit.Params.sanitization, params);
    const vParamsResult = inspector.validate(inputSchema.DoEdit.Params.validation, params);
    if (!vParamsResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vParamsResult.format());
      return;
    }

    const body: Input.DoEdit.Body = req.body;
    inspector.sanitize(inputSchema.DoEdit.Body.sanitization, body);
    const vBodyResult = inspector.validate(inputSchema.DoEdit.Body.validation, body);
    if (!vBodyResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vBodyResult.format());
      return;
    }

    if (body.id !== params.id) {
      res.error(HttpCodes.BAD_REQUEST);
      return;
    }

    const m = makeExamplesManager(req);

    const edited = await m.editExisting(makeExampleEditModel({ id: body.id, property: body.property }));

    if (!edited) {
      res.error(HttpCodes.INTERNAL_SERVER_ERROR);
      return;
    } else {
      const p: ViewOneProps = {
        req,
        item: edited,
      };
      res.render('examples/viewOne', p);
    }
  },

  /**
   * Deletes an item
   */
  doDelete: async (req, res, next) => {
    const params: Input.DoDelete = req.params;
    inspector.sanitize(inputSchema.DoDelete.sanitization, params);
    const vResult = inspector.validate(inputSchema.DoDelete.validation, params);
    if (!vResult.valid) {
      res.error(HttpCodes.BAD_REQUEST, vResult.format());
      return;
    }

    const m = makeExamplesManager(req);

    await m.remove(params.id);
    res.redirect('/examples');
  },

};

export { controller };
