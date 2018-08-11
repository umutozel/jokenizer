import {
    ExpressionType, Expression,
    LiteralExpression, UnaryExpression, VariableExpression,
    BinaryExpression, MemberExpression, CallExpression,
    GroupExpression, LambdaExpression
} from './types';

export default function tokenize(exp: string): Expression {
    if (!exp) return null;

    const len = exp.length,
        err = 'Cannot parse expression.';
    let idx = 0;

    const c = () => exp.charCodeAt(idx);
    const ch = () => exp.charAt(idx);

    function getExp() {
        skip();

        let e = tryLiteral()
            || tryVariable()
            || tryUnary();

        if (!e) {
            if (idx < len) throw new Error(err);
            
            return e;
        }

        skip();

        e = tryBinary(e)
            || tryMember(e)
            || tryCall(e)
            || tryGroup(e)
            || tryLambda(e)
            || tryKnown(e)
            || e;

        skip();

        if (idx < len) throw new Error(err);

        return e;
    }

    function tryLiteral() {

        function tryNumeric() {
            let n = '';

            function x() {
                while (isNumber(c())) {
                    n += ch();
                    move();
                }
            }

            x();
            if (ch() === Separator) {
                n += ch();
                x();
            }

            if (n) {
                if (isVariableStart(c())) throw new Error(`Unexpected character (${ch}) at index ${idx}`);

                return literalExp(Number(n));
            }

            return null;
        }

        function tryString() {
        }

        return tryNumeric() || tryString();
    }

    function tryVariable() {
        let v = '';

        if (isVariableStart(c())) {
            while (stillVariable(c())) {
                v += ch();
                move();
            }
        }

        return v ? variableExp(v) : null;
    }

    function tryUnary() {
        const u = unary.find(u => eq(exp, idx, u));

        if (u) {
            move(u.length);
            return unaryExp(u, getExp());
        }

        return null;
    }

    function tryBinary(e: Expression) {
        const op = binary.find(b => eq(exp, idx, b));

        if (op) {

        }

        return null;
    }

    function tryMember(e: Expression) {
        if (ch() === '.') return memberExp(e, getExp());
    }

    function tryCall(e: Expression) {
        return ch() === '(' ? getCall(e) : e;
    }

    function getCall(e: Expression) {
        move();

        const args = getGroup();

        to(')');

        return callExp(e, args);
    }

    function tryGroup(e: Expression) {
        if (ch() === ',')
            return [e].concat(getGroup());

        return null;
    }

    function getGroup() {
        const exps: Expression[] = [];

        do {
            exps.push(getExp());
            skip();
        } while (eq(exp, idx, ','));

        return exps;
    }

    function tryLambda(e: Expression) {
    }

    function tryKnown(e: Expression) {
        if (e.type === ExpressionType.Literal) {
            const le = <VariableExpression>e;
            if (le.name in knowns) return literalExp(knowns[le.name]);
        }

        return null;
    }

    function move(count: number = 1) {
        idx += count;
    }

    function skip() {
        while (isSpace(c())) move();
    }

    function to(c: string) {
        skip();

        if (!eq(exp, idx, c))
            throw new Error(`Expected ${c} at index ${idx}, found ${exp[idx]}`);

        move(c.length);
    }

    return getExp();
}

function isSpace(c: Number) {
    return c === 32 || c === 9;
}

function isNumber(c: Number) {
    return (c >= 48 && c <= 57);
}

function eq(source: string, idx: number, target: string) {
    return source.substr(idx, target.length) === target;
}

function isVariableStart(c: Number) {
    return (c === 36) || (c === 95) || // `$`, `_`
        (c >= 65 && c <= 90) || // A...Z
        (c >= 97 && c <= 122); // a...z
}

function stillVariable(c: Number) {
    return isVariableStart(c) || isNumber(c);
}

const Separator = (function () {
    const n = 1.1;
    return n.toLocaleString().substr(1, 1);
})();

const unary = ['-', '!', '~', '+'],
    binary = [
        '&&', '||',
        '|', '^', '&',
        '==', '!=', '===', '!==',
        '<', '>', '<=', '>=',
        '<<', '>>', '>>>',
        '+', '-',
        '*', '/', '%'],
    knowns = {
        'true': true,
        'false': false,
        'null': null
    };

function literalExp(value) {
    return <LiteralExpression>{ type: ExpressionType.Literal, value };
}

function variableExp(name: string) {
    return <VariableExpression>{ type: ExpressionType.Variable, name };
}

function memberExp(owner: Expression, member: Expression) {
    return <MemberExpression>{ type: ExpressionType.Member, owner, member };
}

function unaryExp(operator: string, target: Expression) {
    return <UnaryExpression>{ type: ExpressionType.Unary, target, operator }
}

function callExp(callee: Expression, args: Expression[]) {
    return <CallExpression>{ type: ExpressionType.Call, callee, args };
}