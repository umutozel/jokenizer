import { tokenize } from '../lib/tokenizer';
import {
    ExpressionType,
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

        const le = e as LiteralExpression;
        expect(le.value).to.equal(42);
    });

    it('should return decimal number LiteralExpression', () => {
        const e = tokenize('42.4242');
        expect(e.type).to.equal(ExpressionType.Literal);

        const le = e as LiteralExpression;
        expect(le.value).to.equal(42.4242);
    });

    it('should return string LiteralExpression', () => {
        const e = tokenize('"4\'2"');
        expect(e.type).to.equal(ExpressionType.Literal);

        const le = e as LiteralExpression;
        expect(le.value).to.equal("4'2");
    });

    it('should return LiteralExpression for known variables', () => {
        const e1 = tokenize('true');
        expect(e1.type).to.equal(ExpressionType.Literal);

        const le1 = e1 as LiteralExpression;
        expect(le1.value).to.equal(true);

        const e2 = tokenize('false');
        expect(e2.type).to.equal(ExpressionType.Literal);

        const le2 = e2 as LiteralExpression;
        expect(le2.value).to.equal(false);

        const e3 = tokenize('null');
        expect(e3.type).to.equal(ExpressionType.Literal);

        const le3 = e3 as LiteralExpression;
        expect(le3.value).to.equal(null);
    });

    it('should return VariableExpression', () => {
        const e = tokenize('Name');
        expect(e.type).to.equal(ExpressionType.Variable);

        const ve = e as VariableExpression;
        expect(ve.name).to.equal('Name');
    });

    it('should return UnaryExpression', () => {
        const e = tokenize('!IsActive');
        expect(e.type).to.equal(ExpressionType.Unary);

        const ue = e as UnaryExpression;
        expect(ue.operator).to.equal('!');
        expect(ue.target.type).to.equal(ExpressionType.Variable);

        const te = ue.target as VariableExpression;
        expect(te.name).to.equal('IsActive');
    });

    it('should return GroupExpression', () => {
        const e = tokenize('(a, b)');
        expect(e.type).to.equal(ExpressionType.Group);

        const ge = e as GroupExpression;
        expect(ge.expressions).to.have.length(2);
        expect(ge.expressions[0].type).to.equal(ExpressionType.Variable);
        expect(ge.expressions[1].type).to.equal(ExpressionType.Variable);

        const v1 = ge.expressions[0] as VariableExpression;
        expect(v1.name).to.equal('a');

        const v2 = ge.expressions[1] as VariableExpression;
        expect(v2.name).to.equal('b');

        expect(() => tokenize('()')).to.throw;
    });

    it('should return GroupExpression for sequence', () => {
        const e = tokenize('a, b');
        expect(e.type).to.equal(ExpressionType.Group);

        const ge = e as GroupExpression;
        expect(ge.expressions).to.have.length(2);
        expect(ge.expressions[0].type).to.equal(ExpressionType.Variable);
        expect(ge.expressions[1].type).to.equal(ExpressionType.Variable);

        const v1 = ge.expressions[0] as VariableExpression;
        expect(v1.name).to.equal('a');

        const v2 = ge.expressions[1] as VariableExpression;
        expect(v2.name).to.equal('b');
    });

    it('should return ObjectExpression', () => {
        const e = tokenize('{ a: v1, b }');
        expect(e.type).to.equal(ExpressionType.Object);

        const oe = e as ObjectExpression;
        expect(oe.members).to.have.length(2);
        expect(oe.members[0].type).to.equal(ExpressionType.Assign);
        expect(oe.members[1].type).to.equal(ExpressionType.Variable);

        const ae = oe.members[0] as AssignExpression;
        expect(ae.right.type).to.equal(ExpressionType.Variable);

        const ve = ae.right as VariableExpression;
        expect(ve.name).to.equal('v1');

        const ve1 = oe.members[1] as VariableExpression;
        expect(ve1.name).to.equal('b');
    });

    it('should return ArrayExpression', () => {
        const e = tokenize('[ a, 1 ]');
        expect(e.type).to.equal(ExpressionType.Array);

        const ae = e as ArrayExpression;
        expect(ae.items).to.have.length(2);
        expect(ae.items[0].type).to.equal(ExpressionType.Variable);
        expect(ae.items[1].type).to.equal(ExpressionType.Literal);

        const ve = ae.items[0] as VariableExpression;
        expect(ve.name).to.equal('a');

        const le = ae.items[1] as LiteralExpression;
        expect(le.value).to.equal(1);
    });

    it('should return BinaryExpression', () => {
        const e = tokenize('v1 > v2');
        expect(e.type).to.equal(ExpressionType.Binary);

        const be = e as BinaryExpression;
        expect(be.operator).to.equal('>');
        expect(be.left.type).to.equal(ExpressionType.Variable);
        expect(be.right.type).to.equal(ExpressionType.Variable);

        const le = be.left as VariableExpression;
        expect(le.name).to.equal('v1');

        const re = be.right as VariableExpression;
        expect(re.name).to.equal('v2');
    });

    it('should return BinaryExpression with correct precedence', () => {
        const e = tokenize('1 + 2 * 3');
        expect(e.type).to.equal(ExpressionType.Binary);

        const be = e as BinaryExpression;
        expect(be.operator).to.equal('+');
        expect(be.left.type).to.equal(ExpressionType.Literal);
        expect(be.right.type).to.equal(ExpressionType.Binary);

        const le = be.left as LiteralExpression;
        expect(le.value).to.equal(1);

        const re = be.right as BinaryExpression;
        expect(re.operator).to.equal('*');
        expect(re.left.type).to.equal(ExpressionType.Literal);
        expect(re.right.type).to.equal(ExpressionType.Literal);

        const le2 = re.left as LiteralExpression;
        expect(le2.value).to.equal(2);

        const le3 = re.right as LiteralExpression;
        expect(le3.value).to.equal(3);
    });

    it('should return MemberExpression', () => {
        const e = tokenize('Company.Name');
        expect(e.type).to.equal(ExpressionType.Member);

        const me = e as MemberExpression;
        expect(me.owner.type).to.equal(ExpressionType.Variable);
        expect(me.member.type).to.equal(ExpressionType.Variable);

        const ve = me.owner as VariableExpression;
        expect(ve.name).to.equal('Company');

        const ve2 = me.member as VariableExpression;
        expect(ve2.name).to.equal('Name');
    });

    it('should return FuncExpression for lambda', () => {
        const e = tokenize('(a, b) => a < b');
        expect(e.type).to.equal(ExpressionType.Func);

        const fe = e as FuncExpression;
        expect(fe.parameters.length).to.equal(2);
        expect(fe.parameters).to.have.members(['a', 'b']);
        expect(fe.body.type).to.equal(ExpressionType.Binary);

        const be = fe.body as BinaryExpression;
        expect(be.operator).to.equal('<');
        expect(be.left.type).to.equal(ExpressionType.Variable);
        expect(be.right.type).to.equal(ExpressionType.Variable);

        const le = be.left as VariableExpression;
        expect(le.name).to.equal('a');

        const re = be.right as VariableExpression;
        expect(re.name).to.equal('b');
    });

    it('should return FuncExpression for function', () => {
        const e = tokenize('function(a, b) { return a < b; }');
        expect(e.type).to.equal(ExpressionType.Func);

        const fe = e as FuncExpression;
        expect(fe.parameters.length).to.equal(2);
        expect(fe.parameters).to.have.members(['a', 'b']);
        expect(fe.body.type).to.equal(ExpressionType.Binary);

        const be = fe.body as BinaryExpression;
        expect(be.operator).to.equal('<');

        expect(be.left.type).to.equal(ExpressionType.Variable);
        const le = be.left as VariableExpression;
        expect(le.name).to.equal('a');

        expect(be.right.type).to.equal(ExpressionType.Variable);
        const re = be.right as VariableExpression;
        expect(re.name).to.equal('b');
    });

    it('should return CallExpression', () => {
        const e = tokenize('Test(42, a)');
        expect(e.type).to.equal(ExpressionType.Call);

        const ce = e as CallExpression;
        expect(ce.callee.type).to.equal(ExpressionType.Variable);
        expect(ce.args.length).to.equal(2);
        expect(ce.args[0].type).to.equal(ExpressionType.Literal);
        expect(ce.args[1].type).to.equal(ExpressionType.Variable);

        const le = ce.args[0] as LiteralExpression;
        expect(le.value).to.equal(42);

        const ve = ce.args[1] as VariableExpression;
        expect(ve.name).to.equal('a');
    });

    it('should return TernaryExpression', () => {
        const e = tokenize('check ? 42 : 21');
        expect(e.type).to.equal(ExpressionType.Ternary);

        const te = e as TernaryExpression;
        expect(te.predicate.type).to.equal(ExpressionType.Variable);
        expect(te.whenTrue.type).to.equal(ExpressionType.Literal);
        expect(te.whenFalse.type).to.equal(ExpressionType.Literal);

        const pe = te.predicate as VariableExpression;
        expect(pe.name).to.equal('check');

        const wt = te.whenTrue as LiteralExpression;
        expect(wt.value).to.equal(42);

        const wf = te.whenFalse as LiteralExpression;
        expect(wf.value).to.equal(21);
    });
});