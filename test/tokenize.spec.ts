import tokenize from '../lib/index';
import { expect } from 'chai';
import 'mocha';

describe('Tokenize function', () => {

    it('should return null', () => {
        const result = tokenize('');
        expect(result).to.equal(null);
    });
});