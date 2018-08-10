import {
    ExpressionType, Expression, LiteralExpression, PropertyExpression,
    UnaryExpression, BinaryExpression, CallExpression, VariableExpression
} from './types';

export default function tokenize(exp: string): Expression {
    if (!exp) return null;

    const len = exp.length;
    let idx = 0;

    let c: number;
    let ch: string;
    curr();

    function getExp() {
        skip();

        let e: Expression = tryNumeric()
            || tryString()
            || tryUnary()
            || tryVar()
            || tryGroup();
        
        if (!exp) return null;
        
        if (ch === '.') return propertyExp(e, getExp());

        skip();

        if (ch === '(') {
            move();

            const args = [];
            do {
                args.push(getExp());
                skip();
            } while (eq(exp, idx, ','));

            to(')');

            return callExp(e, args);
        }

        const op = binary.find(b => eq(exp, idx, b));
        if (op) return getBinary(e, op);

        if (e.type === ExpressionType.Literal) {
            const le = <VariableExpression>e;
            if (le.name in knowns) return literalExp(knowns[le.name]);
        }

        return exp;
    }

    function tryNumeric() {
        let n = '';

        function x() {
            while (isNumber(c)) {
                n += ch;
                move();
            }
        }

        x();
        if (ch === separator) {
            n += ch;
            x();
        }

        if (isVariableStart(c)) throw new Error(`Unexpected character (${ch}) at index ${idx}`);
        
        return n ? literalExp(Number(n)) : null;
    }

    function tryString() {
    }

    function tryUnary() {
        const u = unary.find(u => eq(exp, idx, u));

        if (u) {
            move(u.length);
            return unaryExp(u, getExp());
        }

        return null;
    }

    function getVar() {
    }

    function tryVar() {
        let v = '';

        if (isVariableStart(c)) {
            while (stillVariable(c)) {
                v += ch;
                move();
            }
        }

        return v ? variableExp(v) : null;
    }

    function tryGroup() {
        if (ch !== '(') return null;

        move();
        const exp = getExp();
        to(')');

        return exp;
    }

    function getBinary(left: Expression, op: string) {
    }

    function code() {
        return exp.charCodeAt(idx);
    }

    function char() {
        return exp[idx]
    }

    function curr() {
        c = code();
        ch = char();
    }

    function move(count: number = 1) {
        idx += count;
        curr();
    }

    function skip() {
        while (isSpace(c)) move();
    }

    function to(c: string) {
        skip();
        if (!eq(exp, idx, c))
            throw new Error(`Expected ${c} at index ${idx}, found ${exp[idx]}`);
        
        move(c.length);
    }

    return <any>getExp();
}

function isSpace(c: Number) {
    return c === 32 || c === 9;
}

function isNumber(c: Number) {
    return (c >= 48 && c <= 57);
}

function eq(source: string, idx: number, target: string) {
    return source.substr(idx, target.length) === target;
}

function isVariableStart(c: Number) {
    return (c === 36) || (c === 95) || // `$`, `_`
        (c >= 65 && c <= 90) || // A...Z
        (c >= 97 && c <= 122); // a...z
}

function stillVariable(c: Number) {
    return isVariableStart(c) || isNumber(c);
}

const separator = (function () {
    let n = 1.1;
    return n.toLocaleString().substr(1, 1);
})();

const unary = ['-', '!', '~', '+'],
    binary = [
        '&&', '||',
        '|', '^', '&',
        '==', '!=', '===', '!==',
        '<', '>', '<=', '>=',
        '<<', '>>', '>>>',
        '+', '-',
        '*', '/', '%'],
    knowns = {
        'true': true,
        'false': false,
        'null': null
    };

function literalExp(value) {
    return <LiteralExpression>{ type: ExpressionType.Literal, value };
}

function variableExp(name: string) {
    return <VariableExpression>{ type: ExpressionType.Variable, name };
}

function propertyExp(owner: Expression, property: Expression) {
    return <PropertyExpression>{ type: ExpressionType.Property, owner, property };
}

function unaryExp(operator: string, target: Expression) {
    return <UnaryExpression>{ type: ExpressionType.Unary, target, operator }
}

function callExp(callee: Expression, args: Expression[]) {
    return <CallExpression>{ type: ExpressionType.Call, callee, args };
}