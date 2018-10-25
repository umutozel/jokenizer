import { Expression } from './types';
import { ExpressionVisitor } from './ExpressionVisitor';
import { tokenize } from './tokenizer';

export function evaluate(exp: Expression | string, ...scopes: any[]) {
    return new ExpressionVisitor().process(typeof exp === 'string' ? tokenize(exp) : exp, scopes);
}
