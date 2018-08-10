export const enum ExpressionType {
    Literal, Variable, Property, Unary, Binary, Call
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

export interface PropertyExpression extends Expression {
    owner: Expression;
    property: Expression;
}

export interface UnaryExpression extends Expression {
    operator: string;
    target: Expression;
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
