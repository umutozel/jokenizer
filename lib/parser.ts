import {
    ExpressionType, Expression,
    LiteralExpression, VariableExpression, UnaryExpression,
    GroupExpression, AssignExpression, ObjectExpression, ArrayExpression,
    BinaryExpression, MemberExpression, FuncExpression,
    CallExpression, TernaryExpression
} from './types';

export default function tokenize(exp: string): Expression {
    if (!exp) return null;

    const len = exp.length;
    let idx = 0;

    const cd = () => exp.charCodeAt(idx);
    const ch = () => exp.charAt(idx);

    function getExp(): Expression {
        skip();

        let e = tryLiteral()
            || tryVariable()
            || tryUnary()
            || tryGroup()
            || tryObject()
            || tryArray();

        if (!e) return e;

        skip();

        return tryBinary(e)
            || tryMember(e)
            || tryFunc(e)
            || tryCall(e)
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
            do {
                v += ch();
                move();
            } while (stillVariable(cd()));
        }

        return v ? variableExp(v) : null;
    }

    function tryUnary() {
        const u = unary.find(u => get(u));
        return u ? unaryExp(u, getExp()) : null;
    }

    function tryGroup() {
        return get('(') ? groupExp(getGroup()) : null;
    }

    function getGroup() {
        const es = getSequence();
        to(')');

        return es;
    }

    function trySequence(prev: Expression) {
        return get(',') ? groupExp(getSequence(prev)) : null;
    }

    function getSequence(prev?: Expression) {
        const es: Expression[] = prev ? [prev] : [];
        do {
            es.push(getExp());
        } while (get(','));

        return es;
    }

    function tryObject() {
        if (!get('{')) return null;

        const es: VariableExpression[] = [];
        do {
            const e = getExp();
            if (e.type !== ExpressionType.Variable)
                throw new Error(`Invalid assignment at ${idx}`);

            const ve = <VariableExpression>e;
            if (get(':')) {
                skip();

                es.push(assignExp(ve, getExp()));
            }
            else {
                es.push(ve);
            }
        } while (get(','));

        to('}');

        return objectExp(es);
    }

    function tryArray() {
        if (!get('[')) return null;

        const es: Expression[] = [];
        do {
            es.push(getExp());
        } while (get(','));

        to(']');

        return arrayExp(es);
    }

    function tryBinary(e: Expression) {
        const op = binary.find(b => get(b));

        if (!op) return null;

        const right = getExp();

        if (right.type === ExpressionType.Binary)
            return fixPrecedence(e, op, <BinaryExpression>right);

        return binaryExp(op, e, right);
    }

    function tryMember(e: Expression) {
        return get('.') ? memberExp(e, getExp()) : null;
    }

    function tryFunc(e: Expression) {
        if (get('=>'))
            return funcExp(getParameters(e), getExp());

        if (e.type === ExpressionType.Variable && (<VariableExpression>e).name === 'function') {
            const parameters = getParameters(getExp());
            to('{');
            skip();
            get('return');

            const body = getExp();
            get(';');
            to('}');

            return funcExp(parameters, body);
        }

        return null;
    }

    function getParameters(e: Expression) {
        if (e.type === ExpressionType.Group) {
            const ge = <GroupExpression>e;
            return ge.expressions.map(x => {
                if (x.type !== ExpressionType.Variable)
                    throw new Error(`Invalid parameter at ${idx}`);

                return (<VariableExpression>x).name;
            });
        }

        if (e.type !== ExpressionType.Variable)
            throw new Error(`Invalid parameter at ${idx}`);

        return [(<VariableExpression>e).name];
    }

    function tryCall(e: Expression) {
        return get('(') ? getCall(e) : null;
    }

    function getCall(e: Expression) {
        const args = getGroup();

        return callExp(e, args);
    }

    function tryTernary(e: Expression) {
        if (!get('?')) return null;

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
        while (isSpace(cd(), ch())) move();
    }

    function to(c: string) {
        skip();

        if (!eq(exp, idx, c))
            throw new Error(`Expected ${c} at index ${idx}, found ${exp[idx]}`);

        move(c.length);
    }

    let _e = getExp();
    _e = _e ? trySequence(_e) || _e : _e;

    if (idx < len) throw new Error(`Cannot parse expression, stuck at ${idx}`);

    return _e;
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

function isSpace(cd: Number, ch: string) {
    return cd === 32 || cd === 9 || cd === 160 || ch === '\n';
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

function fixPrecedence(left: Expression, leftOp: string, right: BinaryExpression) {
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

function assignExp(member: VariableExpression, right: Expression) {
    return <AssignExpression>{ type: ExpressionType.Assign, name: member.name, right };
}

function objectExp(members: VariableExpression[]) {
    return <ObjectExpression>{ type: ExpressionType.Object, members };
}

function arrayExp(items: Expression[]) {
    return <ArrayExpression>{ type: ExpressionType.Array, items };
}

function binaryExp(operator: string, left: Expression, right: Expression) {
    return <BinaryExpression>{ type: ExpressionType.Binary, operator, left, right };
}

function memberExp(owner: Expression, member: Expression) {
    return <MemberExpression>{ type: ExpressionType.Member, owner, member };
}

function funcExp(parameters: string[], body: Expression) {
    return <FuncExpression>{ type: ExpressionType.Func, parameters, body };
}

function callExp(callee: Expression, args: Expression[]) {
    return <CallExpression>{ type: ExpressionType.Call, callee, args };
}

function ternaryExp(predicate: Expression, whenTrue: Expression, whenFalse: Expression) {
    return <TernaryExpression>{ type: ExpressionType.Ternary, predicate, whenTrue, whenFalse };
}
