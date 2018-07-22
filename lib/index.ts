export default function tokenize(exp: string) {
    if (!exp) return null;
    
    const len = exp.length;
    let idx = 0;
    let ch: string;

    while(idx < len) {

    }

    function skip() {
    }

    function isSpace(ch: string) {
    }

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