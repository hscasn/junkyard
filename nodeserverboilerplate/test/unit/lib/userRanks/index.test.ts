// tslint:disable:no-unused-expression
import { Ranks, is, getRankName, isAdmin, bindRankCheck } from '../../../../src/lib/userRanks';
import { expect } from 'chai';

describe(`lib/userRanks unit tests`, () => {

  describe('is', () => {
    const scenarios: [any, any, boolean][] = [
      // I am     | Accessing an area for | Should I be allowed?
      [Ranks.Admin, Ranks.Admin,           true],
      [Ranks.Admin, Ranks.Regular,         false],
      [Ranks.Admin, Ranks.Super,           false],
      [Ranks.Admin, Ranks.S_NotRegistered, false],
      [Ranks.Admin, Ranks.S_Any,           true],
      [Ranks.Admin, Ranks.S_Registered,    true],

      [Ranks.Super, Ranks.Admin,           false],
      [Ranks.Super, Ranks.Regular,         false],
      [Ranks.Super, Ranks.Super,           true],
      [Ranks.Super, Ranks.S_NotRegistered, false],
      [Ranks.Super, Ranks.S_Any,           true],
      [Ranks.Super, Ranks.S_Registered,    true],

      [Ranks.Regular, Ranks.Admin,           false],
      [Ranks.Regular, Ranks.Regular,         true],
      [Ranks.Regular, Ranks.Super,           false],
      [Ranks.Regular, Ranks.S_NotRegistered, false],
      [Ranks.Regular, Ranks.S_Any,           true],
      [Ranks.Regular, Ranks.S_Registered,    true],

      [Ranks.S_NotRegistered, Ranks.Admin,           false],
      [Ranks.S_NotRegistered, Ranks.Regular,         false],
      [Ranks.S_NotRegistered, Ranks.Super,           false],
      [Ranks.S_NotRegistered, Ranks.S_NotRegistered, true],
      [Ranks.S_NotRegistered, Ranks.S_Any,           true],
      [Ranks.S_NotRegistered, Ranks.S_Registered,    false],

      [Ranks.S_Registered, Ranks.Admin,           false],
      [Ranks.S_Registered, Ranks.Regular,         false], // Just because you are registered,
                                                          // doesn't mean you are "regular"
      [Ranks.S_Registered, Ranks.Super,           false],
      [Ranks.S_Registered, Ranks.S_NotRegistered, false],
      [Ranks.S_Registered, Ranks.S_Any,           true],
      [Ranks.S_Registered, Ranks.S_Registered,    true],

      [Ranks.S_Any, Ranks.Admin,           false],
      [Ranks.S_Any, Ranks.Regular,         false],
      [Ranks.S_Any, Ranks.Super,           false],
      [Ranks.S_Any, Ranks.S_NotRegistered, false],
      [Ranks.S_Any, Ranks.S_Any,           true],
      [Ranks.S_Any, Ranks.S_Registered,    false],
    ];

    scenarios.forEach(([current, required, expected]) => {
      it(
        `should return ${expected.toString()} for ${Ranks[current]} accessing as ${Ranks[required]}`, () => {
          expect(is(current, [required])).to.eql(expected);
        },
      );
    });

  });

  describe('getRankName', () => {
    Object.keys(Ranks).filter((n) => isNaN(n as any)).forEach((rank) => {
      it(
        `should return string for ${rank}: ${getRankName(Ranks[rank as any] as any)}`, () => {
          expect(getRankName(rank as any)).to.be.string;
        },
      );
    });

    it('should return same as S_Any for unknown rank', () => {
      expect(getRankName(null as any)).to.eql(getRankName(Ranks.S_Any));
    });
  });

  describe('isAdmin', () => {
    it('should return false for bad request object', () => {
      [
        null,
        {},
        { user: null },
        { user: {}},
        { user: { rank: null}},
      ].forEach((req) => {
        it(
          `should return false for ${JSON.stringify(req)}`, () => {
            expect(isAdmin(req as any)).to.be.false;
          },
        );
      });
    });

    Object.keys(Ranks).filter((n) => isNaN(n as any) && n !== Ranks.Admin.toString()).forEach((rank) => {
      it(
        `should return false ${rank}`, () => {
          expect(isAdmin(rank as any)).to.be.false;
        },
      );
    });

    it('should return true for admin', () => {
      expect(isAdmin({user: {rank: Ranks.Admin}} as any)).to.be.true;
    });
  });

  describe('bindRankCheck', () => {
    it('should bind userRankIs to request and call next if provided', (done) => {
      expect(() => bindRankCheck({} as any, {} as any)).not.to.throw();
      const req: any = {};
      bindRankCheck(req, {} as any, () => {
        expect(req.userRankIs).to.exist;
        done();
      });
    });

    it('should return false for bad request', () => {
      const req: any = {};
      bindRankCheck(req, {} as any);
      expect(req.userRankIs([Ranks.Admin, Ranks.Super, Ranks.Regular])).to.be.false;
    });

    it('should return false for different rank', () => {
      const req: any = {user: {rank: Ranks.Regular}, isAuthenticated: () => true};
      bindRankCheck(req, {} as any);
      expect(req.userRankIs([Ranks.Admin])).to.be.false;
    });

    it('should return true for same rank', () => {
      const req: any = {user: {rank: Ranks.Regular}, isAuthenticated: () => true};
      bindRankCheck(req, {} as any);
      expect(req.userRankIs([Ranks.Admin, Ranks.Super, Ranks.Regular])).to.be.true;
    });
  });
});
