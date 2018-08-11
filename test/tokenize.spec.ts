import tokenize from '../lib/parser';
import { ExpressionType } from '../lib/types';

import { expect } from 'chai';
import 'mocha';

describe('Tokenize function', () => {

    it('should return null', () => {
        const exp = tokenize('');
        expect(exp).to.equal(null);
    });

    it('should return VariableExpression', () => {
        const exp = tokenize('Variable');
        expect(exp.type).to.equal(ExpressionType.Variable);
    });

    it('should return UnaryExpression', () => {
        const exp = tokenize('!Variable');
        expect(exp.type).to.equal(ExpressionType.Unary);
    });

    it('should return BinaryExpression', () => {
        const exp = tokenize('3 > 2');
        expect(exp.type).to.equal(ExpressionType.Binary);
    });
});