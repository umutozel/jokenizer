import { Settings } from "./Settings";
import {
    ArrayExpression, BinaryExpression,
    CallExpression, Expression, ExpressionType,
    FuncExpression, GroupExpression, IndexerExpression,
    LiteralExpression, MemberExpression, ObjectExpression,
    TernaryExpression, UnaryExpression, VariableExpression,
} from "./shared";

export class ExpressionVisitor {

    constructor(protected readonly settings: Settings = Settings.default) {
    }

    public process(exp: Expression, scopes: any[]) {
        if (exp.type === ExpressionType.Func) {
            return this.visitFunc(exp as FuncExpression, scopes);
        }

        return this.visit(exp, scopes);
    }

    protected visit(exp: Expression, scopes: any[]) {
        switch (exp.type) {
            case ExpressionType.Array: return this.visitArray(exp as any, scopes);
            case ExpressionType.Binary: return this.visitBinary(exp as any, scopes);
            case ExpressionType.Call: return this.visitCall(exp as any, scopes);
            case ExpressionType.Indexer: return this.visitIndexer(exp as any, scopes);
            case ExpressionType.Literal: return this.visitLiteral(exp as any, scopes);
            case ExpressionType.Member: return this.visitMember(exp as any, scopes);
            case ExpressionType.Object: return this.visitObject(exp as any, scopes);
            case ExpressionType.Ternary: return this.visitTernary(exp as any, scopes);
            case ExpressionType.Unary: return this.visitUnary(exp as any, scopes);
            case ExpressionType.Variable: return this.visitVariable(exp as any, scopes);
            case ExpressionType.Group:
                const groupExp = exp as GroupExpression;
                if (groupExp.expressions.length === 1) {
                    return this.visit(groupExp.expressions[0], scopes);
                }
            /* eslint-disable no-fallthrough */
            case ExpressionType.Assign:
            case ExpressionType.Func:
                throw new Error(`Invalid ${exp.type} expression usage`);
            /* eslint-enable no-fallthrough */
            default: throw new Error(`Unsupported ExpressionType ${exp.type}`);
        }
    }

    protected visitArray(exp: ArrayExpression, scopes: any[]) {
        return exp.items.map((i) => this.visit(i, scopes));
    }

    protected visitBinary(exp: BinaryExpression, scopes: any[]) {
        const e = exp as BinaryExpression;
        return this.evalBinary(this.visit(e.left, scopes), e.operator, e.right, scopes);
    }

    protected visitCall(exp: CallExpression, scopes: any[]) {
        const c = this.visit(exp.callee, scopes);
        const a = exp.args.map((x) => x.type === ExpressionType.Func
            ? this.visitFunc(x as any, scopes)
            : this.visit(x, scopes));
        return c(...a);
    }

    protected visitFunc(exp: FuncExpression, scopes: any[]) {
        return (...args: any[]) => {
            const s = {};
            exp.parameters.forEach((p, i) => s[p] = args[i]);
            return this.visit(exp.body, [s, ...scopes]);
        };
    }

    protected visitIndexer(exp: IndexerExpression, scopes: any[]) {
        const e = exp as IndexerExpression;
        const o = this.visit(e.owner, scopes);
        const k = this.visit(e.key, scopes);
        return o != null ? o[k] : null;
    }

    protected visitLiteral(exp: LiteralExpression, _scopes: any[]) {
        return exp.value;
    }

    protected visitMember(exp: MemberExpression, scopes: any[]) {
        return this.readVar(exp.name, [this.visit(exp.owner, scopes)]);
    }

    protected visitObject(exp: ObjectExpression, scopes: any[]) {
        const o = {};
        exp.members.forEach((m) => o[m.name] = this.visit(m.right, scopes));
        return o;
    }

    protected visitTernary(exp: TernaryExpression, scopes: any[]) {
        const e = exp as TernaryExpression;
        return this.visit(e.predicate, scopes)
            ? this.visit(e.whenTrue, scopes)
            : this.visit(e.whenFalse, scopes);
    }

    protected visitUnary(exp: UnaryExpression, scopes: any[]) {
        const value = this.visit(exp.target, scopes);
        const op = this.settings.getUnaryOperator(exp.operator);
        if (!op) {
            throw new Error(`Unknown unary operator ${exp.operator}`);
        }

        return op(value);
    }

    protected visitVariable(exp: VariableExpression, scopes: any[]) {
        return this.readVar(exp.name, scopes);
    }

    protected evalBinary(leftValue: any, operator: string, right: Expression, scopes: any[]) {
        const op = this.settings.getBinaryOperator(operator);
        if (!op) {
            throw new Error(`Unknown binary operator ${operator}`);
        }

        if (["&&", "||"].indexOf(operator) !== -1) {
            return op.func(leftValue, () => this.visit(right, scopes));
        }

        let rightValue = this.visit(right, scopes);
        [leftValue, rightValue] = this.tryFixDate(leftValue, rightValue);

        return op.func(leftValue, rightValue);
    }

    protected readVar(prop: string, scopes: any[]) {
        const scope = scopes.find((s) => s && prop in s);
        const v = scope && scope[prop];
        return (v && v.bind && typeof v.bind === "function") ? v.bind(scope) : v;
    }

    protected tryFixDate(v1: any, v2: any): [any, any] {
        if (Object.prototype.toString.call(v1) === "[object Date]") {
            v1 = v1.getTime();
            if (typeof v2 === "string") {
                v2 = Date.parse(v2);
            }
        }

        return [v1, v2];
    }
}
