import tokenize from '../lib/parser';
import {
    ExpressionType, Expression,
    LiteralExpression, VariableExpression, UnaryExpression, GroupExpression,
    BinaryExpression, MemberExpression, CallExpression,
    FuncExpression, TernaryExpression
} from '../lib/types';

import { expect, should } from 'chai';
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

    it('should return decimal number LiteralExpression', () => {
        const e = tokenize('42.4242');
        expect(e.type).to.equal(ExpressionType.Literal);

        const le = <LiteralExpression>e;
        expect(le.value).to.equal(42.4242);
    });

    it('should return string LiteralExpression', () => {
        const e = tokenize('"4\'2"');
        expect(e.type).to.equal(ExpressionType.Literal);

        const le = <LiteralExpression>e;
        expect(le.value).to.equal("4'2");
    });

    it('should return VariableExpression', () => {
        const e = tokenize('Name');
        expect(e.type).to.equal(ExpressionType.Variable);

        const ve = <VariableExpression>e;
        expect(ve.name).to.equal('Name');
    });

    it('should return UnaryExpression', () => {
        const e = tokenize('!IsActive');
        expect(e.type).to.equal(ExpressionType.Unary);

        const ue = <UnaryExpression>e;
        expect(ue.operator).to.equal('!');

        expect(ue.target.type).to.equal(ExpressionType.Variable);
        const te = <VariableExpression>ue.target;
        expect(te.name).to.equal('IsActive');
    });

    it('should return GroupExpression', () => {
        const e = tokenize('(a, b)');
        expect(e.type).to.equal(ExpressionType.Group);

        const ge = <GroupExpression>e;
        expect(ge.expressions).to.have.length(2);
    });

    it('should return BinaryExpression', () => {
        const e = tokenize('v1 > v2');
        expect(e.type).to.equal(ExpressionType.Binary);

        const be = <BinaryExpression>e;
        expect(be.operator).to.equal('>');

        expect(be.left.type).to.equal(ExpressionType.Variable);
        const le = <VariableExpression>be.left;
        expect(le.name).to.equal('v1');

        expect(be.right.type).to.equal(ExpressionType.Variable);
        const re = <VariableExpression>be.right;
        expect(re.name).to.equal('v2');
    });

    it('should return FuncExpression', () => {
        const e = tokenize('(a, b) => a < b');
        expect(e.type).to.equal(ExpressionType.Func);

        const fe = <FuncExpression>e;
        expect(fe.parameters.length).to.equal(2);
        expect(fe.parameters).to.have.members(['a', 'b']);
        expect(fe.body.type).to.equal(ExpressionType.Binary);

        const be = <BinaryExpression>fe.body;
        expect(be.operator).to.equal('<');

        expect(be.left.type).to.equal(ExpressionType.Variable);
        const le = <VariableExpression>be.left;
        expect(le.name).to.equal('a');

        expect(be.right.type).to.equal(ExpressionType.Variable);
        const re = <VariableExpression>be.right;
        expect(re.name).to.equal('b');
    });
});