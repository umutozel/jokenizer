export const enum ExpressionType {
    Literal = 'L', 
    Variable = 'V', 
    Unary = 'U', 
    Group = 'G', 
    Assign = 'A',
    Object = 'O',
    Array = 'AR',
    Member = 'M', 
    Indexer = 'I', 
    Binary = 'B', 
    Func = 'F', 
    Call = 'C', 
    Ternary = 'T'
}

export interface Expression {
    readonly type: ExpressionType;
}

export interface LiteralExpression extends Expression {
    readonly value
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
    readonly members: VariableExpression[];
}

export interface ArrayExpression extends Expression {
    readonly items: Expression[];
}

export interface MemberExpression extends Expression {
    readonly owner: Expression;
    readonly member: VariableExpression;
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
