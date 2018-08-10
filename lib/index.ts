export default function tokenize(exp: string): Expression {
    if (!exp) return null;

    const len = exp.length;
    let idx = 0;

    let c: number;
    let ch: string;
    curr();

    function getExp() {
        skip();

        let exp = getNumeric()
            || getString()
            || getUnary()
            || getVar()
            || getGroup();
        
        if (ch === '.') {
            return prop
        }
    }

    function getNumeric() {
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
        }
        x();

        if (!isSpace(c))
            throw new Error(`Unexpected character (${ch}) at index ${idx}`);
        
        return n ? literalExp(Number(n)) : null;
    }

    function getString() {
    }

    function getUnary() {
        const u = unary.find(u => eq(exp, idx, u));

        if (u) {
            move(u.length);
            return unaryExp(u, getExp());
        }

        return null;
    }

    function getVar() {
        let v = '';

        if (isVariable(c)) {
            v += ch;
            move();
        }

        while (stillVariable(c)) {
            v += ch;
            move();
        }

        return v ? literalExp(v) : null;
    }

    function getGroup() {
        if (ch !== '(') return null;

        move();
        const exp = getExp();
        to(')');

        return exp;
    }

    function getBinary(left: Expression) {
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

function isVariable(c: Number) {
    return (c === 36) || (c === 95) || // `$`, `_`
        (c >= 65 && c <= 90) || // A...Z
        (c >= 97 && c <= 122); // a...z
}

function stillVariable(c: Number) {
    return isVariable(c) || isNumber(c);
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

export interface Expression {
    type: ExpressionType;
}

export interface LiteralExpression extends Expression {
    value
}

export interface PropertyExpression extends Expression {
    owner: Expression;
    property: Expression;
}

export interface UnaryExpression extends Expression {
    operator: string;
    target: Expression;
}

export interface BinaryExpression extends Expression {
    operator: string;
    left: Expression;
    right: Expression;
}

export const enum ExpressionType {
    Literal, Property, Unary, Binary, Call
}

function literalExp(value) {
    return <LiteralExpression>{ type: ExpressionType.Literal, value };
}

function propertyExp(owner: Expression, property: Expression) {
    return <PropertyExpression>{ type: ExpressionType.Property, owner, property };
}

function unaryExp(operator: string, target: Expression) {
    return <UnaryExpression>{ type: ExpressionType.Unary, target, operator }
}
