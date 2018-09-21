import { Expression } from './types';
import { ExpressionVisitor } from './ExpressionVisitor';

export function evaluate(exp: Expression, ...scopes: any[]) {
    return new ExpressionVisitor().process(exp, scopes);
}
