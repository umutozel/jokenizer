import { ExpressionVisitor } from "./ExpressionVisitor";
import { Settings } from "./Settings";
import { Expression } from "./shared";
import { tokenize } from "./Tokenizer";

export function evaluate<T = any>(exp: Expression | string, ...scopes: any[]): T;
export function evaluate<T = any>(exp: Expression | string, settings: Settings, ...scopes: any[]): T {
    if (!(settings instanceof Settings)) {
        scopes = [settings, ...scopes];
        settings = void 0;
    }

    return new ExpressionVisitor(settings)
        .process(
            typeof exp === "string"
                ? tokenize(exp, settings)
                : exp,
            scopes,
        ) as T;
}
