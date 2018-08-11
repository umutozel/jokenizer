import {
    ExpressionType, Expression,
    LiteralExpression, VariableExpression, UnaryExpression, GroupExpression,
    BinaryExpression, MemberExpression, CallExpression,
    FuncExpression, TernaryExpression
} from './types';

export default function tokenize(exp: string): Expression {
    if (!exp) return null;

    const len = exp.length,
        err = 'Cannot parse expression.';
    let idx = 0;

    const cd = () => exp.charCodeAt(idx);
    const ch = () => exp.charAt(idx);

    function getExp() {
        skip();

        let e = tryLiteral()
            || tryVariable()
            || tryUnary()
            || tryGroup();

        if (!e) return e;

        skip();

        return tryBinary(e)
            || tryMember(e)
            || tryCall(e)
            || tryFunc(e)
            || tryTernary(e)
            || tryKnown(e)
            || e;
    }

    function tryLiteral() {

        function tryNumeric() {
            let n = '';

            function x() {
                while (isNumber(cd())) {
                    n += ch();
                    move();
                }
            }

            x();
            if (get(separator)) {
                n += separator;
                x();
            }

            if (n) {
                if (isVariableStart(cd()))
                    throw new Error(`Unexpected character (${ch}) at index ${idx}`);

                return literalExp(Number(n));
            }

            return null;
        }

        function tryString() {
            let c = ch();
            if (c !== '"' && c !== "'") return null;

            const q = c;
            let s = '';

            while (c = nxt()) {

                if (c === q) {
                    move();
                    return literalExp(s);
                }

                if (c === '\\') {
                    c = nxt();
                    switch (c) {
                        case 'b': s += '\b'; break;
                        case 'f': s += '\f'; break;
                        case 'n': s += '\n'; break;
                        case 'r': s += '\r'; break;
                        case 't': s += '\t'; break;
                        case 'v': s += '\x0B'; break;
                        case '0': s += '\0'; break;
                        case "'": s += "'"; break;
                        case '"': s += '"'; break;
                        case '\\': s += '\\'; break;
                    }
                } else {
                    s += c;
                }
            }

            throw new Error(`Unclosed quote after ${s}`);
        }

        return tryNumeric() || tryString();
    }

    function tryVariable() {
        let v = '';

        if (isVariableStart(cd())) {
            while (stillVariable(cd())) {
                v += ch();
                move();
            }
        }

        return v ? variableExp(v) : null;
    }

    function tryUnary() {
        const u = unary.find(u => get(u));

        if (u) return unaryExp(u, getExp());

        return null;
    }

    function tryGroup() {
        if (get('('))
            return groupExp(getGroup());

        return null;
    }

    function getGroup() {
        const exps: Expression[] = [];

        do {
            exps.push(getExp());
            skip();
        } while (get(','));

        to(')');

        return exps;
    }

    function tryBinary(e: Expression) {
        const op = binary.find(b => get(b));

        if (op) {
            const right = getExp();

            if (right.type === ExpressionType.Binary)
                return fixPredence(e, op, <BinaryExpression>right);

            return binaryExp(op, e, right);
        }

        return null;
    }

    function tryMember(e: Expression) {
        if (ch() === '.') return memberExp(e, getExp());

        return null;
    }

    function tryCall(e: Expression) {
        return get('(') ? getCall(e) : null;
    }

    function getCall(e: Expression) {
        const args = getGroup();
        to(')');

        return callExp(e, args);
    }

    function tryFunc(e: Expression) {
        if (get('=>'))
            return funcExp(getParameters(e), getExp());

        if (e.type === ExpressionType.Variable && (<VariableExpression>e).name === 'function') {
            const parameters = getParameters(e);
            to('{');

            const body = getExp();
            get(';');
            to('}');

            return funcExp(parameters, body);
        }

        return null;
    }

    function getParameters(e: Expression) {
        let parameters: string[];

        if (e.type === ExpressionType.Group) {
            const ge = <GroupExpression>e;
            parameters = ge.expressions.map(x => {
                if (x.type !== ExpressionType.Variable)
                    throw new Error(`Invalid parameter at ${idx}`);

                return (<VariableExpression>x).name;
            });
        }
        else {
            if (e.type !== ExpressionType.Variable)
                throw new Error(`Invalid parameter at ${idx}`);

            parameters = [(<VariableExpression>e).name];
        }

        return parameters;
    }

    function tryTernary(e: Expression) {
        if (ch() !== '?') return null;

        const whenTrue = getExp();
        to(':');
        const whenFalse = getExp();

        return ternaryExp(e, whenTrue, whenFalse);
    }

    function tryKnown(e: Expression) {
        if (e.type === ExpressionType.Literal) {
            const le = <VariableExpression>e;
            if (le.name in knowns) return literalExp(knowns[le.name]);
        }

        return null;
    }

    function get(s: string) {
        if (eq(exp, idx, s)) {
            move(s.length);
            return true;
        }

        return false;
    }

    function move(count: number = 1) {
        idx += count;
    }

    function nxt() {
        move();
        return idx < len ? ch() : null;
    }

    function skip() {
        while (isSpace(cd())) move();
    }

    function to(c: string) {
        skip();

        if (!eq(exp, idx, c))
            throw new Error(`Expected ${c} at index ${idx}, found ${exp[idx]}`);

        move(c.length);
    }

    const e = getExp();

    skip();

    if (idx < len) throw new Error(err);

    return e;
}

const unary = ['-', '!', '~', '+'],
    binary = [
        '&&', '||',
        '|', '^', '&',
        '==', '!=', '===', '!==',
        '<', '>', '<=', '>=',
        '<<', '>>', '>>>',
        '+', '-',
        '*', '/', '%'],
    precedence = {
        '&&': 0, '||': 0,
        '|': 1, '^': 1, '&': 1,
        '==': 2, '!=': 2, '===': 2, '!==': 2,
        '<': 3, '>': 3, '<=': 3, '>=': 3,
        '<<': 4, '>>': 4, '>>>': 4,
        '+': 5, '-': 5,
        '*': 6, '/': 6, '%': 6
    },
    knowns = {
        'true': true,
        'false': false,
        'null': null
    },
    separator = (function () {
        const n = 1.1;
        return n.toLocaleString().substr(1, 1);
    })();

function eq(source: string, idx: number, target: string) {
    return source.substr(idx, target.length) === target;
}

function isSpace(c: Number) {
    return c === 32 || c === 9;
}

function isNumber(c: Number) {
    return (c >= 48 && c <= 57);
}

function isVariableStart(c: Number) {
    return (c === 36) || (c === 95) || // `$`, `_`
        (c >= 65 && c <= 90) || // A...Z
        (c >= 97 && c <= 122); // a...z
}

function stillVariable(c: Number) {
    return isVariableStart(c) || isNumber(c);
}

function fixPredence(left: Expression, leftOp: string, right: BinaryExpression) {
    const p1 = precedence[leftOp];
    const p2 = precedence[right.operator];

    return p2 < p1 
        ? binaryExp(right.operator, binaryExp(leftOp, left, right.left), right.right)
        : binaryExp(leftOp, left, right);
}

function literalExp(value) {
    return <LiteralExpression>{ type: ExpressionType.Literal, value };
}

function variableExp(name: string) {
    return <VariableExpression>{ type: ExpressionType.Variable, name };
}

function unaryExp(operator: string, target: Expression) {
    return <UnaryExpression>{ type: ExpressionType.Unary, target, operator }
}

function groupExp(expressions: Expression[]) {
    return <GroupExpression>{ type: ExpressionType.Group, expressions };
}

function binaryExp(operator: string, left: Expression, right: Expression) {
    return <BinaryExpression>{ type: ExpressionType.Binary, operator, left, right };
}

function memberExp(owner: Expression, member: Expression) {
    return <MemberExpression>{ type: ExpressionType.Member, owner, member };
}

function callExp(callee: Expression, args: Expression[]) {
    return <CallExpression>{ type: ExpressionType.Call, callee, args };
}

function funcExp(parameters: string[], body: Expression) {
    return <FuncExpression>{ type: ExpressionType.Func, parameters, body };
}

function ternaryExp(predicate: Expression, whenTrue: Expression, whenFalse: Expression) {
    return <TernaryExpression>{ type: ExpressionType.Ternary, predicate, whenTrue, whenFalse };
}