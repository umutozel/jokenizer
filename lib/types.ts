export const enum ExpressionType {
    Literal = 'L', 
    Variable = 'V', 
    Unary = 'U', 
    Group = 'G', 
    Assign = 'A',
    Object = 'O',
    Array = 'AR',
    Member = 'M', 
    Binary = 'B', 
    Call = 'C', 
    Func = 'F', 
    Ternary = 'T'
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

export interface GroupExpression extends Expression {
    expressions: Expression[];
}

export interface AssignExpression extends VariableExpression {
    right: Expression;
}

export interface ObjectExpression extends Expression {
    members: VariableExpression[];
}

export interface ArrayExpression extends Expression {
    items: Expression[];
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

export interface FuncExpression extends Expression {
    parameters: string[];
    body: Expression;
}

export interface TernaryExpression extends Expression {
    predicate: Expression;
    whenTrue: Expression;
    whenFalse: Expression;
}
