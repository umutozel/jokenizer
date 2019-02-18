import { expect } from 'chai';
import 'mocha';
import { 
    tokenize, evaluate,
    ObjectExpression, UnaryExpression, BinaryExpression, 
    GroupExpression, ExpressionType 
} from '..';

describe('Evaluation tests', () => {

    it('should evaluate number with string', () => {
        const v = evaluate('42');
        expect(v).to.equal(42);
    });

    it('should evaluate number', () => {
        const v = evaluate(tokenize('42'));
        expect(v).to.equal(42);
    });

    it('should evaluate decimal number', () => {
        const v = evaluate(tokenize('42.4242'));
        expect(v).to.equal(42.4242);
    });

    it('should evaluate string', () => {
        const v = evaluate(tokenize('"4\'2"'));
        expect(v).to.equal("4'2");
    });

    it('should evaluate interpolated string', () => {
        const v1 = evaluate(tokenize("`don't ${w}, 42`"), { w: 'panic' });
        expect(v1).to.equal("don't panic, 42");

        const v2 = evaluate(tokenize("`don't ${w}`"), { w: 'panic' });
        expect(v2).to.equal("don't panic");

        const v3 = evaluate(tokenize("`${w} panic`"), { w: "don't" });
        expect(v3).to.equal("don't panic");
    });

    it('should evaluate reserved constants for known variables', () => {
        const v1 = evaluate(tokenize('true'));
        expect(v1).to.be.true;

        const v2 = evaluate(tokenize('false'));
        expect(v2).to.be.false;

        const v3 = evaluate(tokenize('null'));
        expect(v3).to.be.null;
    });

    it('should evaluate variable', () => {
        const v = evaluate(tokenize('Name'), { Name: 'Alan' });
        expect(v).to.equal('Alan');
    });

    it('should evaluate unary', () => {
        const v1 = evaluate(tokenize('-Str'), { Str: '5' });
        expect(v1).to.equal(-5);

        const v2 = evaluate(tokenize('+Str'), { Str: '5' });
        expect(v2).to.equal(5);

        const v3 = evaluate(tokenize('!IsActive'), { IsActive: false });
        expect(v3).to.be.true;

        const t4 = tokenize<UnaryExpression>('~index');
        const v4 = evaluate(t4, { index: -1 });
        expect(v4).to.equal(0);

        const t5 = <UnaryExpression>{ operator: 'None', target: t4.target, type: t4.type };
        expect(() => evaluate(t5, { index: -1 })).to.throw();
    });

    it('should evaluate object', () => {
        const t = tokenize<ObjectExpression>('{ a: v1, b.c }');
        const v = evaluate(t, { v1: 3, b: { c: 5 } });
        expect(v).to.deep.equal({ a: 3, c: 5 });
    });

    it('should evaluate array', () => {
        const v = evaluate(tokenize('[ a, 1 ]'), { a: 0 });
        expect(v).to.deep.equal([0, 1]);
    });

    it('should evaluate member', () => {
        const v1 = evaluate(tokenize('Company.Name'), { Company: { Name: 'Netflix' } });
        expect(v1).to.equal('Netflix');

        const v2 = evaluate(tokenize('Company.Name'), null);
        expect(v2).to.be.undefined;
    });

    it('should evaluate indexer', () => {
        const v1 = evaluate(tokenize('Company["Name"]'), { Company: { Name: 'Netflix' } });
        expect(v1).to.equal('Netflix');

        const v2 = evaluate(tokenize('Company[key]'), { Company: { Name: 'Netflix' }, key: 'Name' });
        expect(v2).to.equal('Netflix');

        const v3 = evaluate(tokenize('Company["Name"]'), null);
        expect(v3).to.be.null;
    });

    it('should evaluate function for lambda', () => {
        const v = evaluate(tokenize('(a, b) => a < b'));
        expect(v(2, 1)).to.be.false;
    });

    it('should evaluate function', () => {
        const v = evaluate(tokenize('function(a, b) { return a < b; }'));
        expect(v(2, 1)).to.be.false;
    });

    it('should evaluate function call', () => {
        const v1 = evaluate(tokenize('test()'), { test: () => 42 });
        expect(v1).to.equal(42);

        const v2 = evaluate(tokenize('test(42, a)'), { test: (a, b) => a * b }, { a: 2 });
        expect(v2).to.equal(84);

        const v3 = evaluate(tokenize('find(i => i > 2)'), [1, 2, 3, 4, 5]);
        expect(v3).to.equal(3);
    });

    it('should evaluate ternary', () => {
        const v1 = evaluate(tokenize('check ? 42 : 21'), { check: true });
        expect(v1).to.equal(42);

        const v2 = evaluate(tokenize('check ? 42 : 21'), { check: false });
        expect(v2).to.equal(21);
    });

    it('should evaluate binary', () => {
        const v1 = evaluate(tokenize('v1 == v2'), { v1: 5, v2: 3 });
        expect(v1).to.be.false;

        const v2 = evaluate(tokenize('v1 != v2'), { v1: 5, v2: 3 });
        expect(v2).to.be.true;

        const v3 = evaluate(tokenize('v1 < v2'), { v1: 5, v2: 3 });
        expect(v3).to.be.false;

        const v4 = evaluate(tokenize('v1 > v2'), { v1: 5, v2: 3 });
        expect(v4).to.be.true;

        const v5 = evaluate(tokenize('v1 <= v2'), { v1: 5, v2: 3 });
        expect(v5).to.be.false;

        const v6 = evaluate(tokenize('v1 >= v2'), { v1: 5, v2: 3 });
        expect(v6).to.be.true

        const v7 = evaluate(tokenize('v1 === v2'), { v1: 5, v2: 3 });
        expect(v7).to.be.false;

        const v8 = evaluate(tokenize('v1 !== v2'), { v1: 5, v2: 3 });
        expect(v8).to.be.true;

        const v9 = evaluate(tokenize('v1 % v2'), { v1: 5, v2: 3 });
        expect(v9).to.equal(2);

        const v10 = evaluate(tokenize('v1 + v2'), { v1: 5, v2: 3 });
        expect(v10).to.equal(8);

        const v11 = evaluate(tokenize('v1 - v2'), { v1: 5, v2: 3 });
        expect(v11).to.equal(2);

        const v12 = evaluate(tokenize('v1 * v2'), { v1: 5, v2: 3 });
        expect(v12).to.equal(15);

        const v13 = evaluate(tokenize('v1 / v2'), { v1: 6, v2: 3 });
        expect(v13).to.equal(2);

        const v14 = evaluate(tokenize('v1 ^ v2'), { v1: 5, v2: 3 });
        expect(v14).to.equal(6);

        const v15 = evaluate(tokenize('v1 | v2'), { v1: 5, v2: 3 });
        expect(v15).to.equal(7);

        const t = tokenize('v1 << v2');
        const v16 = evaluate(t, { v1: 5, v2: 3 });
        expect(v16).to.equal(40);

        const v17 = evaluate(tokenize('v1 >> v2'), { v1: 128, v2: 3 });
        expect(v17).to.equal(16);

        const v18 = evaluate(tokenize('v1 >>> v2'), { v1: 16, v2: 3 });
        expect(v18).to.equal(2);

        const v19 = evaluate(tokenize('v1 && v2'), { v1: true, v2: false });
        expect(v19).to.be.false;

        const t20 = tokenize<BinaryExpression>('v1 || v2');
        const v20 = evaluate(t20, { v1: false, v2: true });
        expect(v20).to.be.true;

        const t21 = <BinaryExpression>{ operator: 'None', left: t20.left, right: t20.right, type: t20.type };
        expect(() => evaluate(t21, { v1: false, v2: true })).to.throw();

        var date = new Date();
        const v22 = evaluate(tokenize('v1 == v2'), { v1: date, v2: date.getTime() });
        expect(v22).to.be.true;

        const v23 = evaluate(tokenize('v1 == v2'), { v1: date, v2: date.toISOString() });
        expect(v23).to.be.true;
    });

    it('should fix precedence', () => {
        const v1 = evaluate(tokenize('(1 + 2 * 3)'));
        expect(v1).to.equal(7);

        const v2 = evaluate(tokenize('(1 * 2 + 3)'));
        expect(v2).to.equal(5);
    })

    it('should throw for unknown token', () => {
        expect(() => evaluate(<any>{ type: 'NONE' })).to.throw();
    })

    it('should throw for invalid token', () => {
        const objExp = tokenize<ObjectExpression>('{ a: b }');
        expect(() => evaluate(objExp.members[0])).to.throw();

        const groupExp = <GroupExpression>{ expressions: [], type: ExpressionType.Group };
        expect(() => evaluate(groupExp)).to.throw();

        expect(() => evaluate(tokenize('a < b => b*2'))).to.throw();
    })
});