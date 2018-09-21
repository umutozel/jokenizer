import {
    ExpressionType, Expression,
    LiteralExpression, VariableExpression, UnaryExpression,
    GroupExpression, AssignExpression, ObjectExpression, ArrayExpression,
    BinaryExpression, MemberExpression, IndexerExpression, FuncExpression,
    CallExpression, TernaryExpression
} from './types';

export function evaluate(exp: Expression, ...scopes: any[]) {
    return _evaluate(exp, scopes);
}

function _evaluate(exp: Expression, scopes: any[]) {
    if (exp.type === ExpressionType.Literal)
        return (exp as LiteralExpression).value;

    if (exp.type === ExpressionType.Variable)
        return readVar(exp as VariableExpression, scopes);

    if (exp.type === ExpressionType.Unary) {
        const e = exp as UnaryExpression;
        return evalUnary(e.operator, _evaluate(e.target, scopes));
    }

    if (exp.type === ExpressionType.Group) {
        const ge = (exp as GroupExpression);
        
        if (ge.expressions.length === 1) 
            return _evaluate(ge.expressions[0], scopes);

        return ge.expressions.map(e => _evaluate(e, scopes));
    }

    if (exp.type === ExpressionType.Object) {
        const e = exp as ObjectExpression, o = {};
        e.members.forEach(m => setMember(o, m, scopes));
        return o;
    }

    if (exp.type === ExpressionType.Array)
        return (exp as ArrayExpression).items.map(i => _evaluate(i, scopes));

    if (exp.type === ExpressionType.Binary) {
        const e = exp as BinaryExpression;
        return evalBinary(_evaluate(e.left, scopes), e.operator, e.right, scopes);
    }

    if (exp.type === ExpressionType.Member) {
        const e = exp as MemberExpression;
        return readVar(e.member, [_evaluate(e.owner, scopes)]);
    }

    if (exp.type === ExpressionType.Indexer) {
        const e = exp as IndexerExpression;
        const o = _evaluate(e.owner, scopes);
        const k = _evaluate(e.key, scopes);
        return o != null ? o[k] : null;
    }

    if (exp.type === ExpressionType.Func) {
        const e = exp as FuncExpression;
        return (...args) => {
            const s = {};
            e.parameters.forEach((p, i) => s[p] = args[i]);
            return _evaluate(e.body, [s, ...scopes]);
        };
    }

    if (exp.type === ExpressionType.Call) {
        const e = exp as CallExpression;
        const c = _evaluate(e.callee, scopes);
        const a = e.args.map(x => _evaluate(x, scopes));
        return c(...a);
    }

    if (exp.type === ExpressionType.Ternary) {
        const e = exp as TernaryExpression;
        return _evaluate(e.predicate, scopes)
            ? _evaluate(e.whenTrue, scopes)
            : _evaluate(e.whenFalse, scopes);
    }

    throw new Error(`Unknown ExpressionType ${exp.type}`);
}

function readVar(exp: VariableExpression, scopes: any[]) {
    const s = scopes.find(s => s && exp.name in s);
    const v = s && s[exp.name];
    return (v && v.bind && typeof v.bind === 'function')  ? v.bind(s) : v;
}

function evalUnary(operator: string, value) {
    switch (operator) {
        case '-': return -1 * value;
        case '+': return Number(value);
        case '!': return !value;
        case '~': return ~value;
        default: throw new Error(`Unknown unary operator ${operator}`);
    }
}

function setMember(object, exp: AssignExpression, scopes: any[]) {
    object[exp.name] = _evaluate(exp.right, scopes)
}

function evalBinary(l, operator: string, right: Expression, scopes: any[]) {
    switch (operator) {
        case '&&': return l && _evaluate(right, scopes);
        case '||': return l || _evaluate(right, scopes);
    }

    let r = _evaluate(right, scopes);
    switch (operator) {
        case '%': return l % r;
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return l / r;
        case '^': return l ^ r;
        case '|': return l | r;
        case '<<': return l << r;
        case '>>': return l >> r;
        case '>>>': return l >>> r;
    };

    [l, r] = fixForDate(l, r);
    [r, l] = fixForDate(r, l);
    
    switch (operator) {
        case '==': return l == r;
        case '!=': return l != r;
        case '<': return l < r;
        case '>': return l > r;
        case '<=': return l <= r;
        case '>=': return l >= r;
        case '===': return l === r;
        case '!==': return l !== r;
        default: throw new Error(`Unknown binary operator ${operator}`);
    }
}

function fixForDate(v1, v2) {
    if (Object.prototype.toString.call(v1) === '[object Date]') {
        v1 = v1.getTime();
        if (typeof v2 === 'string') {
            v2 = Date.parse(v2);
        }
    }
    
    return [v1, v2];
}
