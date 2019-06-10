import { expect } from 'chai';
import 'mocha';

import './shim';
import {
    tokenize,
    ExpressionType,
    LiteralExpression, VariableExpression, UnaryExpression,
    ObjectExpression, ArrayExpression,
    BinaryExpression, MemberExpression, IndexerExpression, 
    FuncExpression, CallExpression, TernaryExpression
} from '../index';

describe('Tokenizer simple call to check ExpressionType', () => {

    it('should return null', () => {
        const exp = tokenize('');
        expect(exp).to.be.null;
    });

    it('should not be able to parse', () => {
        expect(() => tokenize('#')).to.throw();
    });

    it('should return number LiteralExpression', () => {
        const e = tokenize<LiteralExpression>('42');
        expect(e.type).to.equal(ExpressionType.Literal);
        expect(e.value).to.equal(42);
    });

    it('should return decimal number LiteralExpression', () => {
        const e = tokenize<LiteralExpression>('42.4242');
        expect(e.type).to.equal(ExpressionType.Literal);
        expect(e.value).to.equal(42.4242);
    });

    it('should return string LiteralExpression', () => {
        const e = tokenize<LiteralExpression>('"4\'2"');
        expect(e.type).to.equal(ExpressionType.Literal);
        expect(e.value).to.equal("4'2");

        expect(() => tokenize('"blow')).to.throw();

        const esc = tokenize<LiteralExpression>('"\\z\\b\\f\\n\\r\\t\\v\\0\\\'\\\"\\\\"');
        expect(esc.type).to.equal(ExpressionType.Literal);
        expect(esc.value).to.equal('\\z\b\f\n\r\t\v\0\'\"\\');
    });

    it('should return LiteralExpression for known variables', () => {
        const e1 = tokenize<LiteralExpression>('true');
        expect(e1.type).to.equal(ExpressionType.Literal);
        expect(e1.value).to.be.true;

        const e2 = tokenize<LiteralExpression>('false');
        expect(e2.type).to.equal(ExpressionType.Literal);
        expect(e2.value).to.be.false;

        const e3 = tokenize<LiteralExpression>('null');
        expect(e3.type).to.equal(ExpressionType.Literal);
        expect(e3.value).to.be.null;
    });

    it('should return VariableExpression', () => {
        const e = tokenize<VariableExpression>('Name');
        expect(e.type).to.equal(ExpressionType.Variable);
        expect(e.name).to.equal('Name');

        expect(() => tokenize('42d')).to.throw();
    });

    it('should return UnaryExpression', () => {
        const e = tokenize<UnaryExpression>('!IsActive');
        expect(e.type).to.equal(ExpressionType.Unary);
        expect(e.operator).to.equal('!');
        expect(e.target.type).to.equal(ExpressionType.Variable);

        const te = e.target as VariableExpression;
        expect(te.name).to.equal('IsActive');
    });

    it('should return ObjectExpression', () => {
        const e = tokenize<ObjectExpression>('{ a : v1, b.c }');
        expect(e.type).to.equal(ExpressionType.Object);
        expect(e.members).to.have.length(2);
        expect(e.members[0].name).to.equal('a');
        expect(e.members[1].name).to.equal('c');

        expect(() => tokenize('{ a: 4 ')).to.throw();
        expect(() => tokenize('{ 4: 4 }')).to.throw();
        expect(() => tokenize('{ a.b: 4 }')).to.throw();
    });

    it('should return ArrayExpression', () => {
        const e = tokenize<ArrayExpression>('[ a, 1 ]');
        expect(e.type).to.equal(ExpressionType.Array);

        expect(e.items).to.have.length(2);
        expect(e.items[0].type).to.equal(ExpressionType.Variable);
        expect(e.items[1].type).to.equal(ExpressionType.Literal);

        const ve = e.items[0] as VariableExpression;
        expect(ve.name).to.equal('a');

        const le = e.items[1] as LiteralExpression;
        expect(le.value).to.equal(1);
    });

    it('should return MemberExpression', () => {
        const e = tokenize<MemberExpression>('Company.Name');
        expect(e.type).to.equal(ExpressionType.Member);
        expect(e.owner.type).to.equal(ExpressionType.Variable);
        expect(e.name).to.equal('Name');

        const ve = e.owner as VariableExpression;
        expect(ve.name).to.equal('Company');

        expect(() => tokenize('Company.5')).to.throw();
    });

    it('should return IndexerExpression', () => {
        const e = tokenize<IndexerExpression>('Company["Name"]');
        expect(e.type).to.equal(ExpressionType.Indexer);
        expect(e.owner.type).to.equal(ExpressionType.Variable);
        expect(e.key.type).to.equal(ExpressionType.Literal);

        const ve = e.owner as VariableExpression;
        expect(ve.name).to.equal('Company');

        const ve2 = e.key as LiteralExpression;
        expect(ve2.value).to.equal('Name');

        expect(() => tokenize('Company[]')).to.throw();
    });

    it('should return FuncExpression for lambda', () => {
        const e = tokenize<FuncExpression>('(a, b) => a < b');
        expect(e.type).to.equal(ExpressionType.Func);
        expect(e.parameters.length).to.equal(2);
        expect(e.parameters).to.have.members(['a', 'b']);
        expect(e.body.type).to.equal(ExpressionType.Binary);

        const be = e.body as BinaryExpression;
        expect(be.operator).to.equal('<');
        expect(be.left.type).to.equal(ExpressionType.Variable);
        expect(be.right.type).to.equal(ExpressionType.Variable);

        const le = be.left as VariableExpression;
        expect(le.name).to.equal('a');

        const re = be.right as VariableExpression;
        expect(re.name).to.equal('b');

        expect(() => tokenize('(a, 4) => a < b')).to.throw();
        expect(() => tokenize('2 => a < b')).to.throw();
    });

    it('should return FuncExpression for function', () => {
        const e = tokenize<FuncExpression>('function(a, b) { return a < b; }');
        expect(e.type).to.equal(ExpressionType.Func);
        expect(e.parameters.length).to.equal(2);
        expect(e.parameters).to.have.members(['a', 'b']);
        expect(e.body.type).to.equal(ExpressionType.Binary);

        const be = e.body as BinaryExpression;
        expect(be.operator).to.equal('<');

        expect(be.left.type).to.equal(ExpressionType.Variable);
        const le = be.left as VariableExpression;
        expect(le.name).to.equal('a');

        expect(be.right.type).to.equal(ExpressionType.Variable);
        const re = be.right as VariableExpression;
        expect(re.name).to.equal('b');
    });

    it('should return CallExpression', () => {
        const e = tokenize<CallExpression>('Test(42, a)');
        expect(e.type).to.equal(ExpressionType.Call);
        expect(e.callee.type).to.equal(ExpressionType.Variable);
        expect(e.args.length).to.equal(2);
        expect(e.args[0].type).to.equal(ExpressionType.Literal);
        expect(e.args[1].type).to.equal(ExpressionType.Variable);

        const le = e.args[0] as LiteralExpression;
        expect(le.value).to.equal(42);

        const ve = e.args[1] as VariableExpression;
        expect(ve.name).to.equal('a');
    });

    it('should return TernaryExpression', () => {
        const e = tokenize<TernaryExpression>('check ? 42 : 21');
        expect(e.type).to.equal(ExpressionType.Ternary);
        expect(e.predicate.type).to.equal(ExpressionType.Variable);
        expect(e.whenTrue.type).to.equal(ExpressionType.Literal);
        expect(e.whenFalse.type).to.equal(ExpressionType.Literal);

        const pe = e.predicate as VariableExpression;
        expect(pe.name).to.equal('check');

        const wt = e.whenTrue as LiteralExpression;
        expect(wt.value).to.equal(42);

        const wf = e.whenFalse as LiteralExpression;
        expect(wf.value).to.equal(21);
    });

    it('should return BinaryExpression', () => {
        const e = tokenize<BinaryExpression>('v1 > v2');
        expect(e.type).to.equal(ExpressionType.Binary);
        expect(e.operator).to.equal('>');
        expect(e.left.type).to.equal(ExpressionType.Variable);
        expect(e.right.type).to.equal(ExpressionType.Variable);

        const le = e.left as VariableExpression;
        expect(le.name).to.equal('v1');

        const re = e.right as VariableExpression;
        expect(re.name).to.equal('v2');

        const ie1 = tokenize("`don't ${w}, 42`");
        expect(ie1.type).to.equal(ExpressionType.Binary);

        const bie = ie1 as BinaryExpression;
        expect(bie.operator).to.equal('+');
        expect(bie.left.type).to.equal(ExpressionType.Binary);
        expect(bie.right.type).to.equal(ExpressionType.Literal);

        const ie2 = tokenize("`don't ${w}`");
        expect(ie2.type).to.equal(ExpressionType.Binary);

        const ie3 = tokenize("`${w} panic`");
        expect(ie3.type).to.equal(ExpressionType.Binary);

        expect(() => tokenize("`don't ${w, 42`")).to.throw();
    });

    it('should return BinaryExpression with correct precedence', () => {
        const e = tokenize<BinaryExpression>('1 + 2 * 3');
        expect(e.type).to.equal(ExpressionType.Binary);
        expect(e.operator).to.equal('+');
        expect(e.left.type).to.equal(ExpressionType.Literal);
        expect(e.right.type).to.equal(ExpressionType.Binary);

        const le = e.left as LiteralExpression;
        expect(le.value).to.equal(1);

        const re = e.right as BinaryExpression;
        expect(re.operator).to.equal('*');
        expect(re.left.type).to.equal(ExpressionType.Literal);
        expect(re.right.type).to.equal(ExpressionType.Literal);

        const le2 = re.left as LiteralExpression;
        expect(le2.value).to.equal(2);

        const le3 = re.right as LiteralExpression;
        expect(le3.value).to.equal(3);
    });
});
