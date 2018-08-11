import {
    ExpressionType, Expression, 
    LiteralExpression, UnaryExpression, VariableExpression,
    BinaryExpression, MemberExpression, CallExpression, 
    GroupExpression, LambdaExpression
} from './types';

export default function tokenize(exp: string): Expression {
    if (!exp) return null;

    let idx = 0;

    const c = () => exp.charCodeAt(idx);
    const ch = () => exp.charAt(idx);
    
    function getExp() {
        skip();

        const e = tryLiteral()
            || tryUnary()
            || tryVariable();
        
        if (!exp) return null;
        
        skip();

        return tryBinary(e)
            || tryMember(e)
            || tryCall(e)
            || tryGroup(e)
            || tryLambda(e)
            || tryKnown(e)
            || exp;
    }

    function tryLiteral() {

        function tryNumeric() {
            let n = '';
    
            function x() {
                while (isNumber(c())) {
                    n += ch;
                    move();
                }
            }
    
            x();
            if (ch() === Separator) {
                n += ch;
                x();
            }
    
            if (isVariableStart(c())) throw new Error(`Unexpected character (${ch}) at index ${idx}`);
            
            return n ? literalExp(Number(n)) : null;
        }
    
        function tryString() {
        }
    
        return tryNumeric() || tryString();
    }
    
    function tryUnary() {
        const u = unary.find(u => eq(exp, idx, u));

        if (u) {
            move(u.length);
            return unaryExp(u, getExp());
        }

        return null;
    }

    function tryVariable() {
        let v = '';

        if (isVariableStart(c())) {
            while (stillVariable(c())) {
                v += ch;
                move();
            }
        }

        return v ? variableExp(v) : null;
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

        const args = [];
        do {
            args.push(getExp());
            skip();
        } while (eq(exp, idx, ','));

        to(')');

        return callExp(e, args);
    }

    function tryGroup(e: Expression) {
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