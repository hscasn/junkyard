// tslint:disable:no-unused-expression
import { Request } from 'express';
import * as HttpErrors from 'http-status-codes';
import * as R from 'ramda';
import { makeConnection, clearAll } from '../../utils/testingDatabase';
import { expect } from 'chai';
import { Connection } from 'typeorm';
import { ExampleEntity } from '../../../src/entities';
import { Props as ViewAllProps } from '../../../src/views/routes/examples/viewAll';
import { Props as ViewOneProps } from '../../../src/views/routes/examples/viewOne';
import { Props as EditFormProps } from '../../../src/views/routes/examples/edit';
import { Props as DeletePromptProps } from '../../../src/views/routes/examples/deletePrompt';
import { controller } from '../../../src/controllers/examples';
import { makeExamplesManager, ExamplesManager } from '../../../src/managers/example';
import { makeRequestMocker, mockExample } from '../../utils/managerUtils';
import { makeExampleAddModel } from '../../../src/models/Example';

describe(`controllers/examples integration tests`, function (this: any) {
  this.timeout(20000);

  let connection: Connection = null as any;
  const getConnection = () => Promise.resolve(connection);
  let mockRequest: (p?: any) => Request = null as any;
  const dummyNext = () => { /* */ };
  let examplesManager: ExamplesManager = null as any;
  let allProperties: string[] = [];
  let allEntries: ExampleEntity[] = [];

  before(async () => {
    connection = await makeConnection();
    await clearAll(connection);
  });

  beforeEach(async () => {
    mockRequest = makeRequestMocker(connection);

    examplesManager = makeExamplesManager(mockRequest());

    const inserts: Promise<any>[] = [];
    allProperties = [];
    for (let i = 1; i <= 10; i++) {
      const e = mockExample();
      const property = `property_${i}`;
      inserts.push(examplesManager.addNew(makeExampleAddModel({
        property,
        thumbnail: 'thumbnail',
        thumbnailMediaType: 'media type',
      })));
      allProperties.push(property);
    }
    allEntries = await Promise.all(inserts);
  });

  afterEach(async () => {
    await clearAll(connection);
  });

  describe('viewAll', () => {

    it(`should return all items`, (done) => {
      const req = mockRequest();

      controller.viewAll(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: ViewAllProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(props.items.length).to.eql(10);
          expect(R.map(i => i.property, props.items)).to.have.members(allProperties);
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('viewOne', () => {

    it(`should create an error if parameters are missing`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest();

      controller.viewOne(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should create an error if bad ID is passed`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        params: {
          id: 999999,
        },
      });

      controller.viewOne(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.NOT_FOUND);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should get one entry`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        params: {
          id: oneUser.id,
        },
      });

      controller.viewOne(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: ViewOneProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(props.item).to.eql(oneUser);
          done();
        },
      } as any, dummyNext);
    });

    it(`should get a thumbnail if accepting an image`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => true,
        params: {
          id: oneUser.id,
        },
      });

      controller.viewOne(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: () => done('should not have rendered a view'),
        image: (type: string, content: Buffer) => {
          expect(type).to.eql('media type');
          expect(content.toString()).to.eql('thumbnail');
          done();
        },
      } as any, dummyNext);
    });

    it(`should create an error if bad ID is passed to get an image`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => true,
        params: {
          id: 999999,
        },
      });

      controller.viewOne(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.NOT_FOUND);
          done();
        },
        render: () => done('should not have rendered a view'),
        image: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

  });

  describe('addForm', () => {

    it(`should render the view`, (done) => {
      const req = mockRequest();

      controller.addForm(req, {
        render: (route: string, props: ViewAllProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('editForm', () => {

    it(`should create an error if parameters are missing`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest();

      controller.editForm(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should create an error if bad ID is passed`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        params: {
          id: 999999,
        },
      });

      controller.editForm(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.NOT_FOUND);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should render the view`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        params: {
          id: oneUser.id,
        },
      });

      controller.editForm(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: EditFormProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(props.item).to.eql(oneUser);
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('deletePrompt', () => {

    it(`should create an error if parameters are missing`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest();

      controller.deletePrompt(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should create an error if bad ID is passed`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        params: {
          id: 999999,
        },
      });

      controller.deletePrompt(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.NOT_FOUND);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should render the view`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        accepts: () => false,
        params: {
          id: oneUser.id,
        },
      });

      controller.deletePrompt(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: DeletePromptProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(props.item).to.eql(oneUser);
          done();
        },
      } as any, dummyNext);
    });

  });

  describe('doAdd', () => {

    it(`should create an error if body is missing`, (done) => {
      const thumbnailContent = 'testtesttest';

      const req = mockRequest({
        file: {
          path: '/tmp/test',
          mimetype: 'text/json',
          buffer: Buffer.from(thumbnailContent),
          thumbnail: 'testtesttestthumbnail',
          size: 10,
          filename: 'file.txt',
          destination: 'something',
          encoding: 'utf8',
          originalname: 'somethingelse',
        },
      });

      controller.doAdd(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should create an error if file is missing`, (done) => {
      const req = mockRequest({
        body: {
          property: 'propertycontent',
        },
      });

      controller.doAdd(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should create an internal server error if db insert fails`, (done) => {
      const thumbnailContent = 'testtesttest';

      const req = mockRequest({
        body: {
          property: 'propertycontent',
        },
        file: {
          path: '/tmp/test',
          mimetype: 'text/json',
          buffer: Buffer.from(thumbnailContent),
          thumbnail: 'testtesttestthumbnail',
          size: 10,
          filename: 'file.txt',
          destination: 'something',
          encoding: 'utf8',
          originalname: 'somethingelse',
        },
      });

      (req as any).db = {
        manager: {
          save: () => { throw new Error('oh no!'); },
        },
      };

      controller.doAdd(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should insert an entry without image successfully`, (done) => {
      const req = mockRequest({
        body: {
          property: 'propertycontent',
        },
        file: {
          path: '',
          mimetype: '',
          buffer: Buffer.from(''),
          thumbnail: '',
          size: 0,
          filename: '',
          destination: '',
          encoding: '',
          originalname: '',
        },
      });

      controller.doAdd(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: ViewOneProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(props.item.property).to.eql(req.body.property);
          const id = props.item.id;
          connection.manager.findOne(ExampleEntity, id).then((entry: any) => {
            expect(entry.property).to.eql(req.body.property);
            expect(Buffer.from(entry.thumbnail).toString('hex')).to.eql('');
            expect(entry.thumbnail_media_type).to.eql(req.file.mimetype);
            done();
          });
        },
      } as any, dummyNext);
    });

    it(`should insert an entry with image successfully`, (done) => {
      const thumbnailContent = 'testtesttest';
      const thumbnailContentHex = Buffer.from(thumbnailContent).toString('hex');

      const req = mockRequest({
        body: {
          property: 'propertycontent',
        },
        file: {
          path: '/tmp/test',
          mimetype: 'text/json',
          buffer: Buffer.from(thumbnailContent),
          thumbnail: 'testtesttestthumbnail',
          size: 10,
          filename: 'file.txt',
          destination: 'something',
          encoding: 'utf8',
          originalname: 'somethingelse',
        },
      });

      controller.doAdd(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        render: (route: string, props: ViewOneProps) => {
          expect(typeof props).to.eql('object');
          expect((props.req as any).NAME).to.eql('mockRequest');
          expect(props.item.property).to.eql(req.body.property);
          const id = props.item.id;
          connection.manager.findOne(ExampleEntity, id).then((entry: any) => {
            expect(entry.property).to.eql(req.body.property);
            expect(Buffer.from(entry.thumbnail).toString('hex')).to.eql(thumbnailContentHex);
            expect(entry.thumbnail_media_type).to.eql(req.file.mimetype);
            done();
          });
        },
      } as any, dummyNext);
    });

  });

  describe('doEdit', () => {

    it(`should create an error if body is missing`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          id: oneUser.id,
          property: 'prop',
        },
      });

      controller.doEdit(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should create an error if file is missing`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        params: {
          id: oneUser.id,
        },
      });

      controller.doEdit(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should create an internal server error if db edit fails`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          id: oneUser.id,
          property: 'prop',
        },
        params: {
          id: oneUser.id,
        },
      });

      (req as any).db = {
        manager: {
          save: () => { throw new Error('oh no!'); },
        },
      };

      controller.doEdit(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.INTERNAL_SERVER_ERROR);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should create an error if ids in body and params do not match`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          id: oneUser.id,
          property: 'prop',
        },
        params: {
          id: oneUser.id + 1,
        },
      });

      connection.manager.findOne(ExampleEntity, oneUser.id).then((originalEntry: any) => {
        controller.doEdit(req, {
          error: (errorCode: number) => {
            expect(errorCode).to.eql(HttpErrors.BAD_REQUEST);
            done();
          },
          render: () => done('should not have succeeded'),
        } as any, dummyNext);
      });
    });

    it(`should edit an entry successfully`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        body: {
          id: oneUser.id,
          property: 'prop',
        },
        params: {
          id: oneUser.id,
        },
      });

      connection.manager.findOne(ExampleEntity, oneUser.id).then((originalEntry: any) => {
        controller.doEdit(req, {
          error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
          render: (route: string, props: ViewOneProps) => {
            expect(typeof props).to.eql('object');
            expect((props.req as any).NAME).to.eql('mockRequest');
            expect(props.item.property).to.eql(req.body.property);
            const id = props.item.id;
            connection.manager.findOne(ExampleEntity, id).then((entry: any) => {
              expect(entry.property).to.eql(req.body.property);
              expect(Buffer.from(entry.thumbnail).toString('hex')).to.eql(originalEntry.thumbnail.toString('hex'));
              done();
            });
          },
        } as any, dummyNext);
      });
    });

  });

  describe('doDelete', () => {

    it(`should create an error if parameters are missing`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest();

      controller.doDelete(req, {
        error: (errorCode: number) => {
          expect(errorCode).to.eql(HttpErrors.BAD_REQUEST);
          done();
        },
        render: () => done('should not have succeeded'),
      } as any, dummyNext);
    });

    it(`should NOT create an error if a bad ID is provided`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        params: {
          id: 999999,
        },
      });

      controller.doDelete(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        redirect: () => done(),
      } as any, dummyNext);
    });

    it(`should NOT create an error if a db error happens`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        params: {
          id: 999999,
        },
      });

      (req as any).db = {
        manager: {
          remove: () => { throw new Error('oh no!'); },
        },
      };

      controller.doDelete(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        redirect: () => done(),
      } as any, dummyNext);
    });

    it(`should remove an entry`, (done) => {
      const oneUser = allEntries[0];

      const req = mockRequest({
        params: {
          id: oneUser.id,
        },
      });

      controller.doDelete(req, {
        error: (code: number, error?: string) => done(`should not have failed: ${code} ${error}`),
        redirect: () => {
          connection.manager.find(ExampleEntity).then((entities) => {
            expect(entities.length).to.eql(9);
            expect(!!R.find(e => e.id === oneUser.id, entities)).to.be.false;
            done();
          });
        },
      } as any, dummyNext);
    });

  });

});
