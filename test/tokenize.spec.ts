import tokenize from '../lib/parser';
import {
    ExpressionType, Expression,
    LiteralExpression, VariableExpression, UnaryExpression,
    GroupExpression, AssignExpression, ObjectExpression, ArrayExpression,
    BinaryExpression, MemberExpression, FuncExpression,
    CallExpression, TernaryExpression
} from '../lib/types';

import { expect } from 'chai';
import 'mocha';

describe('Tokenizer simple call to check ExpressionType', () => {

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

    it('should return GroupExpression for sequence', () => {
        const e = tokenize('a, b ');
        expect(e.type).to.equal(ExpressionType.Group);

        const ge = <GroupExpression>e;
        expect(ge.expressions).to.have.length(2);
    });

    it('should return ObjectExpression', () => {
        const e = tokenize('{ a: v1, b }');
        expect(e.type).to.equal(ExpressionType.Object);

        const oe = <ObjectExpression>e;
        expect(oe.members).to.have.length(2);
        expect(oe.members[0].type).to.equal(ExpressionType.Assign);
        expect(oe.members[1].type).to.equal(ExpressionType.Variable);

        const ae = <AssignExpression>oe.members[0];
        expect(ae.right.type).to.equal(ExpressionType.Variable);

        const ve = <VariableExpression>ae.right;
        expect(ve.name).to.equal('v1');

        const ve1 = <VariableExpression>oe.members[1];
        expect(ve1.name).to.equal('b');
    });

    it('should return ArrayExpression', () => {
        const e = tokenize('[ a, 1 ]');
        expect(e.type).to.equal(ExpressionType.Array);

        const ae = <ArrayExpression>e;
        expect(ae.items).to.have.length(2);
        expect(ae.items[0].type).to.equal(ExpressionType.Variable);
        expect(ae.items[1].type).to.equal(ExpressionType.Literal);

        const ve = <VariableExpression>ae.items[0];
        expect(ve.name).to.equal('a');

        const le = <LiteralExpression>ae.items[1];
        expect(le.value).to.equal(1);
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

    it('should return MemberExpression', () => {
        const e = tokenize('Company.Name');
        expect(e.type).to.equal(ExpressionType.Member);

        const me = <MemberExpression>e;
        expect(me.owner.type).to.equal(ExpressionType.Variable);
        expect(me.member.type).to.equal(ExpressionType.Variable);

        const ve = <VariableExpression>me.owner;
        expect(ve.name).to.equal('Company');
        
        const ve2 = <VariableExpression>me.member;
        expect(ve2.name).to.equal('Name');
    });

    it('should return FuncExpression for lambda', () => {
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

    it('should return FuncExpression for function', () => {
        const e = tokenize('function(a, b) { return a < b; }');
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

    it('should return CallExpression', () => {
        const e = tokenize('Test(42, a)');
        expect(e.type).to.equal(ExpressionType.Call);

        const ce = <CallExpression>e;
        expect(ce.callee.type).to.equal(ExpressionType.Variable);
        expect(ce.args.length).to.equal(2);
        expect(ce.args[0].type).to.equal(ExpressionType.Literal);
        expect(ce.args[1].type).to.equal(ExpressionType.Variable);
        
        const le = <LiteralExpression>ce.args[0];
        expect(le.value).to.equal(42);

        const ve = <VariableExpression>ce.args[1];
        expect(ve.name).to.equal('a');
    });

    it('should return TernaryExpression', () => {
        const e = tokenize('check ? 42 : 21');
        expect(e.type).to.equal(ExpressionType.Ternary);

        const te = <TernaryExpression>e;
        expect(te.predicate.type).to.equal(ExpressionType.Variable);
        expect(te.whenTrue.type).to.equal(ExpressionType.Literal);
        expect(te.whenFalse.type).to.equal(ExpressionType.Literal);

        const pe = <VariableExpression>te.predicate;
        expect(pe.name).to.equal('check');

        const wt = <LiteralExpression>te.whenTrue;
        expect(wt.value).to.equal(42);

        const wf = <LiteralExpression>te.whenFalse;
        expect(wf.value).to.equal(21);
    });
});