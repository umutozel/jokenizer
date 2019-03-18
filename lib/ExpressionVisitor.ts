import {
    ExpressionType, Expression,
    LiteralExpression, VariableExpression, UnaryExpression,
    GroupExpression, ObjectExpression, ArrayExpression,
    BinaryExpression, MemberExpression, IndexerExpression, 
    FuncExpression, CallExpression, TernaryExpression
} from './shared';
import { Settings } from './Settings';

export class ExpressionVisitor {

    constructor(protected readonly settings: Settings = Settings.default) {
    }
    
    process(exp: Expression, scopes: any[]) {
        if (exp.type === ExpressionType.Func)
            return this.visitFunc(exp as FuncExpression, scopes);
        
        return this.visit(exp, scopes);
    }

    protected visit(exp: Expression, scopes: any[]) {
        switch (exp.type) {
            case ExpressionType.Array: return this.visitArray(<any>exp, scopes);
            case ExpressionType.Binary: return this.visitBinary(<any>exp, scopes);
            case ExpressionType.Call: return this.visitCall(<any>exp, scopes);
            case ExpressionType.Indexer: return this.visitIndexer(<any>exp, scopes);
            case ExpressionType.Literal: return this.visitLiteral(<any>exp, scopes);
            case ExpressionType.Member: return this.visitMember(<any>exp, scopes);
            case ExpressionType.Object: return this.visitObject(<any>exp, scopes);
            case ExpressionType.Ternary: return this.visitTernary(<any>exp, scopes);
            case ExpressionType.Unary: return this.visitUnary(<any>exp, scopes);
            case ExpressionType.Variable: return this.visitVariable(<any>exp, scopes);
            case ExpressionType.Group: 
                const gexp = exp as GroupExpression;
                if (gexp.expressions.length == 1)
                    return this.visit(gexp.expressions[0], scopes);
            case ExpressionType.Assign:
            case ExpressionType.Func:
                throw new Error(`Invalid ${exp.type} expression usage`);
            default: throw new Error(`Unsupported ExpressionType ${exp.type}`);
        }
    }

    protected visitArray(exp: ArrayExpression, scopes: any[]) {
        return exp.items.map(i => this.visit(i, scopes))
    }

    protected visitBinary(exp: BinaryExpression, scopes: any[]) {
        const e = exp as BinaryExpression;
        return this.evalBinary(this.visit(e.left, scopes), e.operator, e.right, scopes);
    }

    protected visitCall(exp: CallExpression, scopes: any[]) {
        const c = this.visit(exp.callee, scopes);
        const a = exp.args.map(x => x.type === ExpressionType.Func ? this.visitFunc(<any>x, scopes) : this.visit(x, scopes));
        return c(...a);
    }

    protected visitFunc(exp: FuncExpression, scopes: any[]) {
        return (...args) => {
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

    protected visitLiteral(exp: LiteralExpression, scopes: any[]) {
        return exp.value;
    }

    protected visitMember(exp: MemberExpression, scopes: any[]) {
        return this.readVar(exp.name, [this.visit(exp.owner, scopes)])
    }

    protected visitObject(exp: ObjectExpression, scopes: any[]) {
        const o = {};
        exp.members.forEach(m => o[m.name] = this.visit(m.right, scopes));
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
        if (!op) throw new Error(`Unknown unary operator ${exp.operator}`);

        return op(value);
    }

    protected visitVariable(exp: VariableExpression, scopes: any[]) {
        return this.readVar(exp.name, scopes);
    }

    protected evalBinary(leftValue, operator: string, right: Expression, scopes: any[]) {
        const op = this.settings.getBinaryOperator(operator);
        if (!op) throw new Error(`Unknown binary operator ${operator}`);

        if (~['&&', '||'].indexOf(operator))
            return op.func(leftValue, () => this.visit(right, scopes));
        
        let rightValue = this.visit(right, scopes);
        [leftValue, rightValue] = this.tryFixDate(leftValue, rightValue);

        return op.func(leftValue, rightValue);
    }

    protected readVar(prop: string, scopes: any[]) {
        const s = scopes.find(s => s && prop in s);
        const v = s && s[prop];
        return (v && v.bind && typeof v.bind === 'function') ? v.bind(s) : v;
    }

    protected tryFixDate(v1, v2): [any, any] {
        if (Object.prototype.toString.call(v1) === '[object Date]') {
            v1 = v1.getTime();
            if (typeof v2 === 'string') {
                v2 = Date.parse(v2);
            }
        }
    
        return [v1, v2];
    }
}
