export const enum ExpressionType {
    Literal = "Literal",
    Variable = "Variable",
    Unary = "Unary",
    Group = "Group",
    Assign = "Assign",
    Object = "Object",
    Array = "Array",
    Member = "Member",
    Indexer = "Indexer",
    Func = "Func",
    Call = "Call",
    Ternary = "Ternary",
    Binary = "Binary",
}

export interface Expression {
    readonly type: ExpressionType;
}

export interface LiteralExpression extends Expression {
    readonly value: any;
}

export interface VariableExpression extends Expression {
    readonly name: string;
}

export interface UnaryExpression extends Expression {
    readonly operator: string;
    readonly target: Expression;
}

export interface GroupExpression extends Expression {
    readonly expressions: Expression[];
}

export interface AssignExpression extends VariableExpression {
    readonly right: Expression;
}

export interface ObjectExpression extends Expression {
    readonly members: AssignExpression[];
}

export interface ArrayExpression extends Expression {
    readonly items: Expression[];
}

export interface MemberExpression extends VariableExpression {
    readonly owner: Expression;
}

export interface IndexerExpression extends Expression {
    readonly owner: Expression;
    readonly key: Expression;
}

export interface BinaryExpression extends Expression {
    readonly operator: string;
    readonly left: Expression;
    readonly right: Expression;
}

export interface FuncExpression extends Expression {
    readonly parameters: string[];
    readonly body: Expression;
}

export interface CallExpression extends Expression {
    readonly callee: Expression;
    readonly args: Expression[];
}

export interface TernaryExpression extends Expression {
    readonly predicate: Expression;
    readonly whenTrue: Expression;
    readonly whenFalse: Expression;
}
