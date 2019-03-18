import { Expression } from './shared';
import { ExpressionVisitor } from './ExpressionVisitor';
import { tokenize } from './Tokenizer';
import { Settings } from './Settings';

export function evaluate<T = any>(exp: Expression | string, ...scopes: any[]): T;
export function evaluate<T = any>(exp: Expression | string, settings: Settings, ...scopes: any[]): T {
    if (!(settings instanceof Settings)) {
        scopes = [settings, ...scopes];
        settings = void 0;
    }

    return new ExpressionVisitor(settings)
        .process(
            typeof exp === 'string' 
                ? tokenize(exp, settings) 
                : exp, 
            scopes
        ) as T;
}
