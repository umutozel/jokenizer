import tokenize from '../lib/parser';
import {
    ExpressionType, Expression,
    LiteralExpression, VariableExpression, UnaryExpression, GroupExpression,
    BinaryExpression, MemberExpression, CallExpression,
    FuncExpression, TernaryExpression
} from '../lib/types';

import { expect } from 'chai';
import 'mocha';

describe('Tokenizer', () => {

    it('should return null', () => {
        const exp = tokenize('');
        expect(exp).to.equal(null);
    });

    it('should return number LiteralExpression', () => {
        const e = tokenize('42');
        expect(e.type).to.equal(ExpressionType.Literal);

        const le = <LiteralExpression>e;
        expect(le.value).to.equal(42);
    });

    it('should return string LiteralExpression', () => {
        const e = tokenize('"4\'2"');
        expect(e.type).to.equal(ExpressionType.Literal);

        const le = <LiteralExpression>e;
        expect(le.value).to.equal("4'2");
    });

    it('should return VariableExpression', () => {
        const e = tokenize('Variable');
        expect(e.type).to.equal(ExpressionType.Variable);
    });

    it('should return UnaryExpression', () => {
        const e = tokenize('!Variable');
        expect(e.type).to.equal(ExpressionType.Unary);
    });

    it('should return BinaryExpression', () => {
        const e = tokenize('v1 > v2');
        expect(e.type).to.equal(ExpressionType.Binary);
    });

    it('should return FuncExpression', () => {
        const e = tokenize('(a, b) => a < b');
        expect(e.type).to.equal(ExpressionType.Func);
    });
});