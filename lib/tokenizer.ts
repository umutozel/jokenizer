import {
    ExpressionType, Expression,
    LiteralExpression, VariableExpression, UnaryExpression,
    GroupExpression, AssignExpression, ObjectExpression, ArrayExpression,
    BinaryExpression, MemberExpression, IndexerExpression, FuncExpression,
    CallExpression, TernaryExpression
} from './types';

export function tokenize(exp: string): Expression {
    if (!exp) return null;

    const len = exp.length;
    let idx = 0;

    let cd = exp.charCodeAt(0);
    let ch = exp[0];

    function getExp(): Expression {
        skip();

        let e: Expression = tryLiteral()
            || tryVariable()
            || tryUnary()
            || tryGroup()
            || tryObject()
            || tryArray();

        if (!e) return e;

        let r: Expression;
        do {
            skip();

            r = e;
            e = tryMember(e)
                || tryIndexer(e)
                || tryFunc(e)
                || tryCall(e)
                || tryKnown(e)
                || tryTernary(e)
                || tryBinary(e);
        } while (e)

        return r;
    }

    function tryLiteral() {

        function tryNumeric() {
            let n = '';

            function x() {
                while (isNumber()) {
                    n += ch;
                    move();
                }
            }

            x();
            if (get(separator)) {
                n += separator;
                x();
            }

            if (n) {
                if (isVariableStart())
                    throw new Error(`Unexpected character (${ch}) at index ${idx}`);

                return literalExp(Number(n));
            }

            return null;
        }

        function tryString() {
            let c = ch, inter;
            if (c === '`') {
                inter = true;
            }
            else if (c !== '"' && c !== "'") return null;

            const q = c, es: Expression[] = [];
            let s = '';

            while (c = move()) {
                if (c === q) {
                    move();

                    if (es.length) {
                        if (s) {
                            es.push(literalExp(s));
                        }

                        return es.reduce((p, n) => binaryExp('+', p, n), literalExp(''));
                    }

                    return literalExp(s);
                }

                if (c === '\\') {
                    c = move();
                    switch (c) {
                        case 'b': s += '\b'; break;
                        case 'f': s += '\f'; break;
                        case 'n': s += '\n'; break;
                        case 'r': s += '\r'; break;
                        case 't': s += '\t'; break;
                        case 'v': s += '\x0B'; break;
                        case '0': s += '\0'; break;
                        case '\\': s += '\\'; break;
                        case "'": s += "'"; break;
                        case '"': s += '"'; break;
                        default: s += '\\' + c; break;
                    }
                } else if (inter && get('${')) {
                    if (s) {
                        es.push(literalExp(s));
                        s = '';
                    }
                    es.push(getExp());

                    if (skip() && ch !== '}') 
                        throw new Error(`Unterminated template literal at ${idx}`);
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

        if (isVariableStart()) {
            do {
                v += ch;
                move();
            } while (stillVariable());
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
        const es: Expression[] = [];
        do {
            const e = getExp();
            if (e) {
                es.push(e);
            }
        } while (get(','));

        to(')');

        return es;
    }

    function tryObject() {
        if (!get('{')) return null;

        const es: VariableExpression[] = [];
        do {
            const e = getExp();
            if (e.type !== ExpressionType.Variable)
                throw new Error(`Invalid assignment at ${idx}`);

            const ve = e as VariableExpression;
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

    function tryMember(e: Expression) {
        if (!get('.')) return null;

        skip();
        const v = tryVariable();
        if (v == null) throw new Error(`Invalid member identifier at ${idx}`);

        return memberExp(e, v);
    }

    function tryIndexer(e: Expression) {
        if (!get('[')) return null;

        skip();
        const k = getExp();
        if (k == null) throw new Error(`Invalid indexer identifier at ${idx}`);

        to(']');
        
        return indexerExp(e, k);
    }

    function tryFunc(e: Expression) {
        if (get('=>'))
            return funcExp(getParameters(e), getExp());

        if (e.type === ExpressionType.Variable && (e as VariableExpression).name === 'function') {
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
            const ge = e as GroupExpression;
            return ge.expressions.map(x => {
                if (x.type !== ExpressionType.Variable)
                    throw new Error(`Invalid parameter at ${idx}`);

                return (x as VariableExpression).name;
            });
        }

        if (e.type !== ExpressionType.Variable)
            throw new Error(`Invalid parameter at ${idx}`);

        return [(e as VariableExpression).name];
    }

    function tryCall(e: Expression) {
        return get('(') ? getCall(e) : null;
    }

    function getCall(e: Expression) {
        const args = getGroup();

        return callExp(e, args);
    }

    function tryKnown(e: Expression) {
        if (e.type === ExpressionType.Variable) {
            const le = e as VariableExpression;
            if (le.name in knowns) return literalExp(knowns[le.name]);
        }

        return null;
    }

    function tryTernary(e: Expression) {
        if (!get('?')) return null;

        const whenTrue = getExp();
        to(':');
        const whenFalse = getExp();

        return ternaryExp(e, whenTrue, whenFalse);
    }

    function tryBinary(e: Expression) {
        const op = binary.find(b => get(b));

        if (!op) return null;

        const right = getExp();

        if (right.type === ExpressionType.Binary)
            return fixPrecedence(e, op, right as BinaryExpression);

        return binaryExp(op, e, right);
    }

    function isSpace() {
        return cd === 32 || cd === 9 || cd === 160 || cd === 10 || cd === 13;
    }

    function isNumber() {
        return cd >= 48 && cd <= 57;
    }

    function isVariableStart() {
        return (cd === 36) || (cd === 95) || // `$`, `_`
            (cd >= 65 && cd <= 90) || // A...Z
            (cd >= 97 && cd <= 122); // a...z
    }
    
    function stillVariable() {
        return isVariableStart() || isNumber();
    }

    function move(count: number = 1) {
        idx += count;
        cd = exp.charCodeAt(idx)
        return ch = exp.charAt(idx);
    }
    
    function get(s: string) {
        if (eq(idx, s))
            return !!move(s.length);

        return false;
    }
        
    function skip() {
        while (isSpace() && move());
    }

    function eq(idx: number, target: string) {
        return exp.substr(idx, target.length) === target;
    }
    
    function to(c: string) {
        skip();

        if (!eq(idx, c))
            throw new Error(`Expected ${c} at index ${idx}, found ${exp[idx]}`);

        move(c.length);
    }
    
    const _exps: Expression[] = [];
    let _e: Expression;
    while (idx < len && (_e = getExp())) {
        _exps.push(_e);
        skip();
        get(',');
    }
    
    if (idx < len) throw new Error(`Cannot parse expression, stuck at ${idx}`);

    return _exps.length > 1 ? groupExp(_exps) : _exps[0];
}

const unary = ['-', '+', '!', '~'],
    binary = [
        '&&', '||',
        '|', '^', '&',
        '===', '!==', '==', '!=',
        '<<', '>>>', '>>',
        '<=', '>=', '<', '>',
        '+', '-',
        '*', '/', '%'],
    precedence = {
        '&&': 0, '||': 0,
        '|': 1, '^': 1, '&': 1,
        '===': 2, '!==': 2, '==': 2, '!=': 2,
        '<=': 3, '>=': 3, '<': 3, '>': 3,
        '<<': 4, '>>>': 4, '>>': 4,
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

function fixPrecedence(left: Expression, leftOp: string, right: BinaryExpression) {
    const p1 = precedence[leftOp];
    const p2 = precedence[right.operator];

    return p2 < p1
        ? binaryExp(right.operator, binaryExp(leftOp, left, right.left), right.right)
        : binaryExp(leftOp, left, right);
}

function literalExp(value) {
    return { type: ExpressionType.Literal, value } as LiteralExpression;
}

function variableExp(name: string) {
    return { type: ExpressionType.Variable, name } as VariableExpression;
}

function unaryExp(operator: string, target: Expression) {
    return { type: ExpressionType.Unary, target, operator } as UnaryExpression;
}

function groupExp(expressions: Expression[]) {
    return { type: ExpressionType.Group, expressions } as GroupExpression;
}

function assignExp(member: VariableExpression, right: Expression) {
    return { type: ExpressionType.Assign, name: member.name, right } as AssignExpression;
}

function objectExp(members: VariableExpression[]) {
    return { type: ExpressionType.Object, members } as ObjectExpression;
}

function arrayExp(items: Expression[]) {
    return { type: ExpressionType.Array, items } as ArrayExpression;
}

function binaryExp(operator: string, left: Expression, right: Expression) {
    return { type: ExpressionType.Binary, operator, left, right } as BinaryExpression;
}

function memberExp(owner: Expression, member: VariableExpression) {
    return { type: ExpressionType.Member, owner, member } as MemberExpression;
}

function indexerExp(owner: Expression, key: Expression) {
    return { type: ExpressionType.Indexer, owner, key } as IndexerExpression;
}

function funcExp(parameters: string[], body: Expression) {
    return { type: ExpressionType.Func, parameters, body } as FuncExpression;
}

function callExp(callee: Expression, args: Expression[]) {
    return { type: ExpressionType.Call, callee, args } as CallExpression;
}

function ternaryExp(predicate: Expression, whenTrue: Expression, whenFalse: Expression) {
    return { type: ExpressionType.Ternary, predicate, whenTrue, whenFalse } as TernaryExpression;
}
