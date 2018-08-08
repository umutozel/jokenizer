export default function tokenize(exp: string): Expression {
    if (!exp) return null;

    const len = exp.length;
    let idx = 0;
    let ch: string;

    while (idx < len) {
    }

    function code() {
        return exp.charCodeAt(idx);
    } 

    function skip() {
        while (isSpace(code())) idx++;
    }

    return null;
}

function isSpace(c: Number) {
    return c === 32 || c === 9;
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
    Logical, Unary, Binary,
}