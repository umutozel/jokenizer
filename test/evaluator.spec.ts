import { tokenize } from '../lib/tokenizer';
import { evaluate } from '../lib/evaluator';

import { expect } from 'chai';
import 'mocha';

describe('Evaluation tests', () => {

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

    it('should evaluate reserved constants for known variables', () => {
        const v1 = evaluate(tokenize('true'));
        expect(v1).to.equal(true);

        const v2 = evaluate(tokenize('false'));
        expect(v2).to.equal(false);

        const v3 = evaluate(tokenize('null'));
        expect(v3).to.equal(null);
    });

    it('should evaluate variable', () => {
        const v = evaluate(tokenize('Name'), [{ Name: 'Alan' }]);
        expect(v).to.equal('Alan');
    });

    it('should evaluate unary', () => {
        const v1 = evaluate(tokenize('-Str'), [{ Str: '5' }]);
        expect(v1).to.equal(-5);

        const v2 = evaluate(tokenize('+Str'), [{ Str: '5' }]);
        expect(v2).to.equal(5);

        const v3 = evaluate(tokenize('!IsActive'), [{ IsActive: false }]);
        expect(v3).to.equal(true);

        const v4 = evaluate(tokenize('~index'), [{ index: -1 }]);
        expect(v4).to.equal(0);
    });

    it('should evaluate group', () => {
        const v = evaluate(tokenize('(a, b)'), [{ a: 4, b: 2 }]);
        expect(v).to.deep.equal([4, 2]);
    });

    it('should evaluate group for sequence', () => {
        const v = evaluate(tokenize('a, b'), [{ a: 4, b: 2 }]);
        expect(v).to.deep.equal([4, 2]);
    });

    it('should evaluate object', () => {
        const v = evaluate(tokenize('{ a: v1, b }'), [{ v1: 3, b: 5 }]);
        expect(v).to.deep.equal({ a: 3, b: 5 });
    });

    it('should evaluate array', () => {
        const v = evaluate(tokenize('[ a, 1 ]'), [{ a: 0 }]);
        expect(v).to.deep.equal([0, 1]);
    });

    it('should evaluate binary', () => {
        const v = evaluate(tokenize('v1 > v2'), [{ v1: 5, v2: 3 }]);
        expect(v).to.deep.equal(true);
    });

    it('should fix precedence', () => {
        const v = evaluate(tokenize('1 + 2 * 3'));
        expect(v).to.equal(7);
    })

    it('should evaluate member', () => {
        const v = evaluate(tokenize('Company.Name'), [{ Company: { Name: 'Netflix' } }]);
        expect(v).to.equal('Netflix');
    });

    it('should evaluate function for lambda', () => {
        const v = evaluate(tokenize('(a, b) => a < b'));
        expect(v(2, 1)).to.equal(false);
    });

    it('should evaluate function', () => {
        const v = evaluate(tokenize('function(a, b) { return a < b; }'));
        expect(v(2, 1)).to.equal(false);
    });

    it('should evaluate function call', () => {
        const v = evaluate(tokenize('Test(42, a)'), [{ Test: (a, b) => a * b }, { a: 2 }]);
        expect(v).to.equal(84);
    });

    it('should evaluate ternary', () => {
        const v = evaluate(tokenize('check ? 42 : 21'), [{ check: true }]);
        expect(v).to.equal(42);
    });
});