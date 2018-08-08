export default function tokenize(exp: string): Expression {
    if (!exp) return null;

    const len = exp.length;
    let idx = 0;

    function char() {
        return exp[idx]
    }

    function code() {
        return exp.charCodeAt(idx);
    }

    function skip() {
        while (isSpace(code())) idx++;
    }

    function get() {
        let c = code(), ch = char();
    }

    function group() {
    }

    return null;
}

function isSpace(c: Number) {
    return c === 32 ||  c === 9;
}

function isNumber(c: Number) {
    return (c >= 48 && c <= 57);
}

function isVariable(c: Number) {
    return (c === 36) || (c === 95) || // `$`, `_`
        (c >= 65 && c <= 90) || // A...Z
        (c >= 97 && c <= 122); // a...z
}

function stillVariable(c: Number) {
    return isVariable(c) || isNumber(c);
}

const logical = ['&&', '||'],
    unary = ['-', '!', '~', '+'],
    binary = [
        '|', '^', '&',
        '==', '!=', '===', '!==',
        '<', '>', '<=', '>=',
        '<<', '>>', '>>>',
        '+', '-',
        '*', '/', '%'],
    literals = {
        'true': true,
        'false': false,
        'null': null
    };

export interface Expression {
    type: ExpressionType;
    eval(...args: any[]): any;
}

export interface Logical extends Expression {
    operator: string;
}

export interface IBinaryExpression extends Expression {
    operator: string;
    left: Expression;
    right: Expression;
}

export const enum ExpressionType {
    Logical, Unary, Binary, Call
}