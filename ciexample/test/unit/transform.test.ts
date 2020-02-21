import { transform } from '../../src/transform';
import { expect } from 'chai';

describe('transform', () => {

    it('should fail if non-array is passed', () => {
        expect(() => transform('Bad input!' as any)).to.throw();
    });

    it('should return 0', () => {
        const result = transform([1, -1, 2, -2]);
        expect(result).to.eql(0);
    });

    it('should return 1', () => {
        const result = transform([1, -1, 2, -2, 3]);
        expect(result).to.eql(1);
    });

    it('should return -1', () => {
        const result = transform([1, -1, 2, -2, -3]);
        expect(result).to.eql(-1);
    });

});