import { Request } from 'express';
import * as R from 'ramda';
import { ExampleModel, ExampleAddModel, ExampleEditModel, makeExampleModel } from '../models/Example';
import { ExampleEntity } from '../entities/Example';

export interface ExamplesManager {
  getOne:       (id: number) => Promise<ExampleModel | undefined>;
  getThumbnail: (id: number) => Promise<{ content: string, type: string } | undefined>;
  getAll:       () => Promise<ExampleModel[]>;
  editExisting: (r: ExampleEditModel) => Promise<ExampleModel | undefined>;
  addNew:       (r: ExampleAddModel) => Promise<ExampleModel | undefined>;
  remove:       (id: number) => Promise<boolean>;
}

export function makeExamplesManager(req: Request) {

  const that: ExamplesManager = {

    /**
     * Gets one resource
     * @returns {Promise<Model | undefined>}
     */
    getOne: async (id: number): Promise<ExampleModel | undefined> => {
      const example = await req.db.manager.findOne(ExampleEntity, id);

      return (example) ? makeExampleModel(example) : undefined;
    },

    /**
     * Gets the thumbnail of a resource
     * @returns {Promise<{ type: string, content: string }|undefined>}
     */
    getThumbnail: async (id: number): Promise<{ content: string, type: string } | undefined> => {
      const example = await req.db.manager.findOne(ExampleEntity, id);

      return (example) ? { content: example.thumbnail, type: example.thumbnail_media_type } : undefined;
    },

    /**
     * Gets all models
     * @returns {Promise<Array<ExampleModel>>}
     */
    getAll: async (): Promise<ExampleModel[]> => {
      const examples = await req.db.manager.find(ExampleEntity);

      return R.map(makeExampleModel, examples);
    },

    /**
     * Edits a resource
     * @returns {Promise<ExampleModel | undefined>}
     */
    editExisting: async (exampleEdit: ExampleEditModel): Promise<ExampleModel | undefined> => {
      try {
        const example = await req.db.manager.findOne(ExampleEntity, exampleEdit.id);

        if (!example)
          return undefined;

        example.property = exampleEdit.property;

        const savedExample = await req.db.manager.save(example);

        return makeExampleModel(savedExample);
      } catch (e) {
        req.logger.error(e);
        return undefined;
      }
    },

    /**
     * Adds a resource
     * @returns {Promise<ExampleModel | undefined>}
     */
    addNew: async (exampleAdd: ExampleAddModel): Promise<ExampleModel | undefined> => {
      try {
        const example = new ExampleEntity();
        example.property = exampleAdd.property;
        example.thumbnail = exampleAdd.thumbnail;
        example.thumbnail_media_type = exampleAdd.thumbnailMediaType;

        const savedExample = await req.db.manager.save(example);

        return makeExampleModel(savedExample);
      } catch (e) {
        req.logger.error(e);
        return undefined;
      }
    },

    /**
     * Removes a resource
     * @returns {Promise<boolean>}
     */
    remove: async (id: number): Promise<boolean> => {
      try {
        const example = await req.db.manager.findOne(ExampleEntity, id);
        return !!(example) && !!(await req.db.manager.remove(example));
      } catch (e) {
        req.logger.error(e);
        return false;
      }
    },

  };

  return that;
}
