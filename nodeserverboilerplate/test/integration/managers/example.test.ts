// tslint:disable:no-unused-expression
import * as R from 'ramda';
import { Request } from 'express';
import { makeExamplesManager } from '../../../src/managers/example';
import { expect } from 'chai';
import { makeConnection, clearAll } from '../../utils/testingDatabase';
import { Connection } from 'typeorm';
import { ExampleEntity } from '../../../src/entities';
import { makeRequestMocker, mockExample } from '../../utils/managerUtils';
import { ExampleAddModel, makeExampleAddModel, makeExampleModel,
         makeExampleEditModel } from '../../../src/models/Example';

describe(`managers/example integration tests`, function (this: any) {
  this.timeout(20000);

  let connection: Connection = null as any;
  let makeMockedReq: (p?: object) => Request = null as any;

  before(async () => {
    connection = await makeConnection();
    await clearAll(connection);
    makeMockedReq = makeRequestMocker(connection);
  });

  afterEach(async () => {
    await clearAll(connection);
  });

  describe('getOne', () => {

    it(`should return undefined for not existing entry`, async () => {
      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      const example = await manager.getOne(1);

      expect(example).to.be.undefined;
    });

    it(`should get one entry`, async () => {
      let chosenId = 0;
      let chosenProperty: string = null as any;

      for (const id of R.range(1, 5)) {
        const u = mockExample();
        await connection.manager.save(ExampleEntity, u);
        if (u.id > chosenId) {
          chosenId = u.id;
          chosenProperty = u.property;
        }
      }

      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      const example = await manager.getOne(chosenId);

      expect(example && example.property).to.eql(chosenProperty);
    });

  });

  describe('getAll', () => {

    it(`should return an empty array if there are no entries`, async () => {
      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      const user = await manager.getOne(1);

      expect(user).to.be.undefined;
    });

    it(`should get all entries`, async () => {
      const propertiesList = [];

      for (const id of R.range(1, 5)) {
        const u = mockExample();
        await connection.manager.save(ExampleEntity, u);
        propertiesList.push(u.property);
      }

      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      const examples = await manager.getAll();

      expect(examples.length).to.eql(4);
      expect(R.map((e) => e.property, examples)).to.eql(propertiesList);
    });

  });

  describe('getThumbnail', () => {

    it(`should return undefined for not existing entry`, async () => {
      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      const example = await manager.getThumbnail(1);

      expect(example).to.be.undefined;
    });

    it(`should get one entry`, async () => {
      let chosenId = 0;
      let chosenContent: string = null as any;
      let chosenType: string = null as any;

      for (const id of R.range(1, 5)) {
        const u = mockExample();
        await connection.manager.save(ExampleEntity, u);
        if (u.id > chosenId) {
          chosenId = u.id;
          chosenContent = u.thumbnail;
          chosenType = u.thumbnail_media_type;
        }
      }

      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      const example = await manager.getThumbnail(chosenId);

      expect(example && example.content.toString()).to.eql(chosenContent);
      expect(example && example.type).to.eql(chosenType);
    });

  });

  describe('addNew', () => {

    it(`should add a new entry`, async () => {
      const input = {
        property: 'a',
        thumbnail: 'b',
        thumbnailMediaType: 'c',
      };

      const u: ExampleAddModel = makeExampleAddModel(input);

      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      const example = await manager.addNew(u);

      const expectedEntity = new ExampleEntity();
      expectedEntity.id = (example && example.id) as any;
      expectedEntity.property = input.property;
      expectedEntity.thumbnail = input.thumbnail;
      expectedEntity.thumbnail_media_type = input.thumbnailMediaType;

      expect(example).to.eql(makeExampleModel(expectedEntity));
    });

    it(`should return undefined if error happens`, async () => {
      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      const r = await manager.addNew(null as any);
      const s = await manager.addNew({} as any);

      expect(r).to.be.undefined;
      expect(s).to.be.undefined;
    });

  });

  describe('editExisting', () => {

    it(`should edit an entry`, async () => {
      const insertedExample = await connection.manager.save(ExampleEntity, mockExample());

      const editExample = makeExampleEditModel({
        id: insertedExample.id,
        property: 'new property',
      });

      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      await manager.editExisting(editExample);

      const inDb = await connection.manager.findOne(ExampleEntity, insertedExample.id);

      expect(inDb && inDb.property).to.eql('new property');
    });

    it(`should return undefined if the entry does not exist`, async () => {
      const editExample = makeExampleEditModel({
        id: 100,
        property: 'new property',
      });

      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      const result = await manager.editExisting(editExample);

      expect(result).to.be.undefined;
    });

    it(`should return undefined if error happens`, async () => {
      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      const r = await manager.editExisting(null as any);
      const s = await manager.editExisting({} as any);

      expect(r).to.be.undefined;
      expect(s).to.be.undefined;
    });

  });

  describe('remove', () => {

    it(`should remove an entry`, async () => {
      let chosenId = 0;

      for (const id of R.range(1, 5)) {
        const u = mockExample();
        await connection.manager.save(ExampleEntity, u);
        if (u.id > chosenId) {
          chosenId = u.id;
        }
      }

      const req = makeMockedReq({});
      const manager = makeExamplesManager(req);

      const inDb1 = await connection.manager.find(ExampleEntity);
      expect(inDb1.length).to.eql(4);

      const result = await manager.remove(chosenId);
      expect(result).to.be.true;

      const inDb2 = await connection.manager.find(ExampleEntity);
      expect(inDb2.length).to.eql(3);

      const entryIsInDb = !!R.find(R.propEq('id', chosenId), inDb2);
      expect(entryIsInDb).to.be.false;
    });

    it(`should return false if error happens`, async () => {
      const req = makeMockedReq({});

      const manager = makeExamplesManager(req);

      const r = await manager.remove(null as any);
      const s = await manager.remove({} as any);
      const t = await manager.remove(1 as any);

      expect(r).to.be.false;
      expect(s).to.be.false;
      expect(t).to.be.false;
    });

    it(`should return false if the db throws`, async () => {
      let chosenId = 0;

      for (const id of R.range(1, 5)) {
        const u = mockExample();
        await connection.manager.save(ExampleEntity, u);
        if (u.id > chosenId) {
          chosenId = u.id;
        }
      }

      const req = makeMockedReq({});

      const oldRemove = (req as any).db.manager.remove;
      (req as any).db.manager.remove = () => { throw new Error(); };

      const manager = makeExamplesManager(req);

      const t = await manager.remove(chosenId);

      (req as any).db.manager.remove = oldRemove;

      expect(t).to.be.false;
    });

  });

});
