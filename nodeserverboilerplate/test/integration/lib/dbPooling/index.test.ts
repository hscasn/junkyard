// tslint:disable:no-unused-expression
import { attachDbPool } from '../../../../src/lib/dbPooling';
import { expect } from 'chai';
import { Middleware } from '../../../../src/interfaces';

describe(`lib/dbPooling`, function (this: any) {
  this.timeout(20000);

  describe('attachDbPool integration tests', () => {

    it(`should create a successful connection and attach it to the app requests`, (done) => {
      let attachedConnection: boolean = false;

      const app: any = {
        use: (mid: Middleware) => {
          const req: any = {};
          mid(req, {} as any, () => {
            expect(req.db.isConnected).to.be.true;
            attachedConnection = true;
          });
        },
      };

      attachDbPool(app).then((con) => {
        expect(con.isConnected).to.be.true;
        expect(attachedConnection).to.be.true;
        done();
      });
    });
  });

});
