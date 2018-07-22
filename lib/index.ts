export default function tokenize(exp: string) {
    let idx = 0;

    return null;
}

export const enum Operator {

}

const operators = {

}

export interface IExpression {
    type: ExpressionType;
}

export interface IBinaryExpression extends IExpression {
    operator: Operator;
    left: IExpression;
    right: IExpression;
}

export const enum ExpressionType {
}