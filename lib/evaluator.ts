import {
    ExpressionType, Expression,
    LiteralExpression, VariableExpression, UnaryExpression,
    GroupExpression, AssignExpression, ObjectExpression, ArrayExpression,
    BinaryExpression, MemberExpression, FuncExpression,
    CallExpression, TernaryExpression
} from './types';

export function evaluate(exp: Expression, scopes: any[] = []) {
    if (exp.type === ExpressionType.Literal)
        return (exp as LiteralExpression).value;

    if (exp.type === ExpressionType.Variable)
        return readVar(exp as VariableExpression, scopes);

    if (exp.type === ExpressionType.Unary) {
        const e = exp as UnaryExpression;
        return evalUnary(e.operator, evaluate(e.target, scopes));
    }

    if (exp.type === ExpressionType.Group)
        return (exp as GroupExpression).expressions.map(e => evaluate(e, scopes));

    if (exp.type === ExpressionType.Assign)
        return setMember({}, exp as AssignExpression, scopes);

    if (exp.type === ExpressionType.Object) {
        const e = exp as ObjectExpression, o = {};
        e.members.forEach(m => setMember(o, m, scopes));
        return o;
    }

    if (exp.type === ExpressionType.Array)
        return (exp as ArrayExpression).items.map(i => evaluate(i, scopes));

    if (exp.type === ExpressionType.Binary) {
        const e = exp as BinaryExpression;
        return evalBinary(evaluate(e.left, scopes), e.operator, e.right, scopes);
    }

    if (exp.type === ExpressionType.Member) {
        const e = exp as MemberExpression;
        const o = evaluate(e.owner, scopes);
        return o != null ? readVar(e.member, [o]) : null;
    }

    if (exp.type === ExpressionType.Func) {
        const e = exp as FuncExpression;
        return (...args) => {
            const s = {};
            e.parameters.forEach((p, i) => s[p] = args[i]);
            return evaluate(e.body, [s, ...scopes]);
        };
    }

    if (exp.type === ExpressionType.Call) {
        const e = exp as CallExpression;
        const c = evaluate(e.callee, scopes);
        const a = e.args.map(x => evaluate(x, scopes));
        return c.apply(this, a);
    }

    if (exp.type === ExpressionType.Ternary) {
        const e = exp as TernaryExpression;
        return evaluate(e.predicate, scopes)
            ? evaluate(e.whenTrue, scopes)
            : evaluate(e.whenFalse, scopes);
    }

    throw new Error(`Unknown ExpressionType ${exp.type}`);
}

function readVar(exp: VariableExpression, scopes: any[]) {
    const s = scopes.find(s => exp.name in s);
    return s && s[exp.name];
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

function setMember(object, exp: VariableExpression, scopes: any[]) {
    object[exp.name] = exp.type === ExpressionType.Assign
        ? evaluate((exp as AssignExpression).right, scopes)
        : readVar(exp, scopes);
}

function evalBinary(left, operator: string, right: Expression, scopes: any[]) {
    switch (operator) {
        case '&&': return left && evaluate(right, scopes);
        case '||': return left || evaluate(right, scopes);
    }

    const r = evaluate(right, scopes)
    switch (operator) {
        case '==': return left == r;
        case '!=': return left != r;
        case '<': return left < r;
        case '>': return left > r;
        case '<=': return left <= r;
        case '>=': return left >= r;
        case '===': return left === r;
        case '!==': return left !== r;
        case '%': return left % r;
        case '+': return left + r;
        case '-': return left - r;
        case '*': return left * r;
        case '/': return left / r;
        case '^': return left ^ r;
        case '|': return left | r;
        case '<<': return left << r;
        case '>>': return left >> r;
        case '>>>': return left >>> r;
        default: throw new Error(`Unknown binary operator ${operator}`);
    }
}
