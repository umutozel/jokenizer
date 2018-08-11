export const enum ExpressionType {
    Literal, Variable, Unary, Member, Binary, Call, Group, Lambda, Ternary
}

export interface Expression {
    type: ExpressionType;
}

export interface LiteralExpression extends Expression {
    value
}

export interface VariableExpression extends Expression {
    name: string;
}

export interface UnaryExpression extends Expression {
    operator: string;
    target: Expression;
}

export interface MemberExpression extends Expression {
    owner: Expression;
    member: Expression;
}

export interface BinaryExpression extends Expression {
    operator: string;
    left: Expression;
    right: Expression;
}

export interface CallExpression extends Expression {
    callee: Expression;
    args: Expression[];
}

export interface GroupExpression extends Expression {
    expressions: Expression[];
}

export interface LambdaExpression extends Expression {
    parameters: string[];
    body: Expression;
}

export interface TernaryExpression extends Expression {
    predicate: Expression;
    whenTrue: Expression;
    whenFalse: Expression;
}