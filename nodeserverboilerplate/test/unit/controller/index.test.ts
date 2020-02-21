// tslint:disable:no-unused-expression
import { Request, Response } from 'express';
import { expect } from 'chai';
import { controller } from '../../../src/controllers/index';

describe(`controllers/index unit tests`, () => {

  before(async () => {
  });

  afterEach(async () => {
  });

  describe('get', () => {

    it('should render the page with the correct props', (done) => {
      const req: Request = {} as any;

      const render = (route: string, props: any) => {
        expect(typeof props).to.eql('object');
        expect(props.req).to.eql(req);
        done();
      };

      const res: Response = {
        render,
      } as any;

      controller.get(req, res, () => { /* */ });
    });

  });

});
