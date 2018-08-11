import tokenize from '../lib/parser';
import { ExpressionType } from '../lib/types';

import { expect } from 'chai';
import 'mocha';

describe('Tokenize function', () => {

    it('should return null', () => {
        const result = tokenize('');
        expect(result).to.equal(null);
    });

    it('should return BinaryExpression', () => {
        const result = tokenize('3 > 2');
        expect(result.type).to.equal(ExpressionType.Binary);
    });
});