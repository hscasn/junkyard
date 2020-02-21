// tslint:disable:no-unused-expression
import { toFormattedNumber } from '../../../../src/lib/formatting';
import { expect } from 'chai';

describe(`lib/formatting unit tests`, () => {

  describe('toFormattedNumber', () => {

    it(`should produce the correct output`, () => {
      ([
        [ 1.23456,          undefined,  '1.23'],
        [ 0.23456,          undefined,  '0.23'],
        [-0.23456,          undefined, '-0.23'],
        [-1.23456,          undefined, '-1.23'],
        [ 1,                undefined,  '1'],
        [ 0,                undefined,  '0'],
        [-0,                undefined,  '0'],
        [-1,                undefined, '-1'],
        [ 1.23456,          1,          '1.2'],
        [ 0.23456,          1,          '0.2'],
        [-0.23456,          1,         '-0.2'],
        [-1.23456,          1,         '-1.2'],
        [ 1.23456,          7,          '1.2345600'],
        [ 0.23456,          7,          '0.2345600'],
        [-0.23456,          7,         '-0.2345600'],
        [-1.23456,          7,         '-1.2345600'],
        [ 1,                4,          '1.0000'],
        [ 0,                4,          '0.0000'],
        [-0,                4,          '0.0000'],
        [-1,                4,         '-1.0000'],
        [ 1001001001.23456, 1,          '1,001,001,001.2'],
        [    1001001.23456, 1,          '1,001,001.2'],
        [   -1001001.23456, 1,         '-1,001,001.2'],
        [-1001001001.23456, 1,         '-1,001,001,001.2'],
      ] as [number, number | undefined, string][]).forEach(([n, d, e]) => {
        expect(toFormattedNumber(n, d)).to.eql(e);
      });
    });

  });

});
