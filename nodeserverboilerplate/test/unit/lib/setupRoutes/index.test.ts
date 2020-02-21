// tslint:disable:no-unused-expression
import { setupRoutes } from '../../../../src/lib/setupRoutes';
import { expect } from 'chai';
import * as HttpCodes from 'http-status-codes';

describe(`lib/setupRoutes unit tests`, () => {

  const mockedTools: any = {
    passport:  { authenticate: () => null },
    multipart: { single: () => null },
    authorize: () => null,
    auth:      () => null,
    emailer:   () => null,
  };

  describe('setupRoutes', () => {

    it(`should set at least one get and post methods`, () => {
      let getCalled = 0;
      let postCalled = 0;

      const app: any = {
        get: () => getCalled++,
        post: () => postCalled++,
      };

      setupRoutes(app, mockedTools);

      expect(getCalled).to.gt(0);
      expect(postCalled).to.gt(0);
    });

    it(`should set a default 404 route with get("*") and render /httpError with HTTP Code "Not Found"`, (done) => {
      let routeSet = false;
      let routeHandler: any;

      const app: any = {
        get: (route: string, fn: any) => {
          if (route === '*') {
            routeSet = true;
            routeHandler = fn;
          }
        },
        post: () => null,
      };

      setupRoutes(app, mockedTools);

      expect(routeSet).to.be.true;
      expect(typeof routeHandler).to.eql('function');

      const req = {
        NAME: 'request',
      };
      const res = {
        render: (route: string, props: any) => {
          expect(route).to.eql('httpError');
          expect(typeof props).to.eql('object');
          expect(props.req.NAME).to.eql(req.NAME);
          expect(props.httpCode).to.eql(HttpCodes.NOT_FOUND);
          done();
        },
      };

      routeHandler(req, res);
    });

    it(`should have the logout route calling the logout method and redirecting to another page`, (done) => {
      let routeSet = false;
      let logoutCalled = false;
      let routeHandler: any;

      const app: any = {
        get: (route: string, _: any, fn: any) => {
          if (route === '/accounts/logout') {
            routeSet = true;
            routeHandler = fn;
          }
        },
        post: () => null,
      };

      setupRoutes(app, mockedTools);

      expect(routeSet).to.be.true;
      expect(typeof routeHandler).to.eql('function');

      const req = {
        logout: () => logoutCalled = true,
      };
      const res = {
        redirect: (route: string) => {
          expect(logoutCalled).to.be.true;
          expect(route).to.eql('/');
          done();
        },
      };

      routeHandler(req, res);
    });

  });

});
