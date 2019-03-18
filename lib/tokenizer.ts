import {
    ExpressionType, Expression,
    LiteralExpression, VariableExpression, UnaryExpression,
    GroupExpression, AssignExpression, ObjectExpression, ArrayExpression,
    BinaryExpression, MemberExpression, IndexerExpression, FuncExpression,
    CallExpression, TernaryExpression
} from './shared';

export function tokenize<T extends Expression = Expression>(exp: string): T {
    // if (!exp) return null;

    // const len = exp.length;
    // let idx = 0;

    // let cd = exp.charCodeAt(0);
    // let ch = exp[0];

    // function getExp(): Expression {
    //     skip();

    //     let e: Expression = tryLiteral()
    //         || tryVariable()
    //         || tryUnary()
    //         || tryGroup()
    //         || tryObject()
    //         || tryArray();

    //     if (!e) return e;
    //     e = tryKnown(e) || e;

    //     let r: Expression;
    //     do {
    //         skip();

    //         r = e;
    //         e = tryMember(e)
    //             || tryIndexer(e)
    //             || tryFunc(e)
    //             || tryCall(e)
    //             || tryTernary(e)
    //             || tryBinary(e);
    //     } while (e)

    //     return r;
    // }

    // function tryLiteral() {

    //     function tryNumeric() {
    //         let n = '';

    //         function x() {
    //             while (isNumber()) {
    //                 n += ch;
    //                 move();
    //             }
    //         }

    //         x();
    //         if (get(separator)) {
    //             n += separator;
    //             x();
    //         }

    //         if (n) {
    //             if (isVariableStart())
    //                 throw new Error(`Unexpected character (${ch}) at index ${idx}`);

    //             return literalExp(Number(n));
    //         }

    //         return null;
    //     }

    //     function tryString() {
    //         let c = ch, inter;
    //         if (c === '`') {
    //             inter = true;
    //         }
    //         else if (c !== '"' && c !== "'") return null;

    //         const q = c, es: Expression[] = [];
    //         let s = '';

    //         while (c = move()) {
    //             if (c === q) {
    //                 move();

    //                 if (es.length) {
    //                     if (s) {
    //                         es.push(literalExp(s));
    //                     }

    //                     return es.reduce((p, n) => binaryExp('+', p, n), literalExp(''));
    //                 }

    //                 return literalExp(s);
    //             }

    //             if (c === '\\') {
    //                 c = move();
    //                 switch (c) {
    //                     case 'b': s += '\b'; break;
    //                     case 'f': s += '\f'; break;
    //                     case 'n': s += '\n'; break;
    //                     case 'r': s += '\r'; break;
    //                     case 't': s += '\t'; break;
    //                     case 'v': s += '\x0B'; break;
    //                     case '0': s += '\0'; break;
    //                     case '\\': s += '\\'; break;
    //                     case "'": s += "'"; break;
    //                     case '"': s += '"'; break;
    //                     default: s += '\\' + c; break;
    //                 }
    //             } else if (inter && get('${')) {
    //                 if (s) {
    //                     es.push(literalExp(s));
    //                     s = '';
    //                 }
    //                 es.push(getExp());
    //                 skip()

    //                 if (ch !== '}')
    //                     throw new Error(`Unterminated template literal at ${idx}`);
    //             } else {
    //                 s += c;
    //             }
    //         }

    //         throw new Error(`Unclosed quote after ${s}`);
    //     }

    //     return tryNumeric() || tryString();
    // }

    // function getVariableName() {
    //     let v = '';

    //     if (isVariableStart()) {
    //         do {
    //             v += ch;
    //             move();
    //         } while (stillVariable());
    //     }

    //     return v;
    // }

    // function tryVariable() {
    //     const v = getVariableName();
    //     return v ? variableExp(v) : null;
    // }

    // function tryUnary() {
    //     const u = unary.find(u => get(u));
    //     return u ? unaryExp(u, getExp()) : null;
    // }

    // function tryGroup() {
    //     return get('(') ? groupExp(getGroup()) : null;
    // }

    // function getGroup() {
    //     const es: Expression[] = [];
    //     do {
    //         const e = getExp();
    //         if (e) {
    //             es.push(e);
    //         }
    //     } while (get(','));

    //     to(')');

    //     return es;
    // }

    // function tryObject() {
    //     if (!get('{')) return null;

    //     const es: AssignExpression[] = [];
    //     do {
    //         skip();
    //         const ve = getExp() as VariableExpression;
    //         if (ve.type !== ExpressionType.Variable && ve.type !== ExpressionType.Member)
    //             throw new Error(`Invalid assignment at ${idx}`);

    //         skip();
    //         if (get(':')) {
    //             if (ve.type !== ExpressionType.Variable)
    //                 throw new Error(`Invalid assignment at ${idx}`);

    //             skip();

    //             es.push(assignExp(ve.name, getExp()));
    //         }
    //         else {
    //             es.push(assignExp(ve.name, ve));
    //         }
    //     } while (get(','));

    //     to('}');

    //     return objectExp(es);
    // }

    // function tryArray() {
    //     if (!get('[')) return null;

    //     const es: Expression[] = [];
    //     do {
    //         es.push(getExp());
    //     } while (get(','));

    //     to(']');

    //     return arrayExp(es);
    // }

    // function tryKnown(e: Expression) {
    //     if (e.type === ExpressionType.Variable) {
    //         const le = e as VariableExpression;
    //         if (knowns.hasOwnProperty(le.name)) 
    //             return literalExp(knowns[le.name]);
    //     }

    //     return null;
    // }

    // function tryMember(e: Expression) {
    //     if (!get('.')) return null;

    //     skip();
    //     const v = getVariableName();
    //     if (!v) throw new Error(`Invalid member identifier at ${idx}`);

    //     return memberExp(e, v);
    // }

    // function tryIndexer(e: Expression) {
    //     if (!get('[')) return null;

    //     skip();
    //     const k = getExp();
    //     if (k == null) throw new Error(`Invalid indexer identifier at ${idx}`);

    //     to(']');

    //     return indexerExp(e, k);
    // }

    // function tryFunc(e: Expression) {
    //     if (get('=>'))
    //         return funcExp(getParameters(e), getExp());

    //     if (e.type === ExpressionType.Variable && (e as VariableExpression).name === 'function') {
    //         const parameters = getParameters(getExp());
    //         to('{');
    //         skip();
    //         get('return');

    //         const body = getExp();
    //         get(';');
    //         to('}');

    //         return funcExp(parameters, body);
    //     }

    //     return null;
    // }

    // function getParameters(e: Expression) {
    //     if (e.type === ExpressionType.Group) {
    //         const ge = e as GroupExpression;
    //         return ge.expressions.map(x => {
    //             if (x.type !== ExpressionType.Variable)
    //                 throw new Error(`Invalid parameter at ${idx}`);

    //             return (x as VariableExpression).name;
    //         });
    //     }

    //     if (e.type !== ExpressionType.Variable)
    //         throw new Error(`Invalid parameter at ${idx}`);

    //     return [(e as VariableExpression).name];
    // }

    // function tryCall(e: Expression) {
    //     return get('(') ? getCall(e) : null;
    // }

    // function getCall(e: Expression) {
    //     const args = getGroup();

    //     return callExp(e, args);
    // }

    // function tryTernary(e: Expression) {
    //     if (!get('?')) return null;

    //     const whenTrue = getExp();
    //     to(':');
    //     const whenFalse = getExp();

    //     return ternaryExp(e, whenTrue, whenFalse);
    // }

    // function tryBinary(e: Expression) {
    //     const op = binary.find(b => get(b));

    //     if (!op) return null;

    //     const right = getExp();

    //     if (right.type === ExpressionType.Binary)
    //         return fixPrecedence(e, op, right as BinaryExpression);

    //     return binaryExp(op, e, right);
    // }

    // function isSpace() {
    //     return cd === 32 || cd === 9 || cd === 160 || cd === 10 || cd === 13;
    // }

    // function isNumber() {
    //     return cd >= 48 && cd <= 57;
    // }

    // function isVariableStart() {
    //     return (cd === 36) || (cd === 95) || // `$`, `_`
    //         (cd >= 65 && cd <= 90) || // A...Z
    //         (cd >= 97 && cd <= 122); // a...z
    // }

    // function stillVariable() {
    //     return isVariableStart() || isNumber();
    // }

    // function move(count: number = 1) {
    //     idx += count;
    //     cd = exp.charCodeAt(idx)
    //     return ch = exp.charAt(idx);
    // }

    // function get(s: string) {
    //     if (eq(idx, s))
    //         return !!move(s.length);

    //     return false;
    // }

    // function skip() {
    //     while (isSpace() && move());
    // }

    // function eq(idx: number, target: string) {
    //     return exp.substr(idx, target.length) === target;
    // }

    // function to(c: string) {
    //     skip();

    //     if (!eq(idx, c))
    //         throw new Error(`Expected ${c} at index ${idx}, found ${exp[idx]}`);

    //     move(c.length);
    // }

    return new Tokenizer(exp).process() as T;
}

const unary = ['-', '+', '!', '~'],
    binary = [
        '&&', '||',
        '|', '^', '&',
        '===', '!==', '==', '!=',
        '<<', '>>>', '>>',
        '<=', '>=', '<', '>',
        '+', '-',
        '*', '/', '%'],
    precedence = {
        '&&': 0, '||': 0,
        '|': 1, '^': 1, '&': 1,
        '===': 2, '!==': 2, '==': 2, '!=': 2,
        '<=': 3, '>=': 3, '<': 3, '>': 3,
        '<<': 4, '>>>': 4, '>>': 4,
        '+': 5, '-': 5,
        '*': 6, '/': 6, '%': 6
    },
    knowns = {
        'true': true,
        'false': false,
        'null': null
    };

export class Tokenizer {

    constructor(protected readonly exp: string) {
        const n = 1.1;
        this.separator = n.toLocaleString().substr(1, 1);

        this.len = exp.length;
        this._idx = 0;

        this._cd = exp.charCodeAt(0);
        this._ch = exp[0];
    }

    protected separator: string;
    protected readonly len: number;

    private _idx: number;
    protected get idx() { return this._idx; }

    private _cd: number;
    protected get cd() { return this._cd; }

    private _ch: string;
    protected get ch() { return this._ch; }

    public process() {
        if (!this.exp) return null;

        const e = this.getExp();

        if (this.idx < this.len) throw new Error(`Cannot parse expression, stuck at ${this.idx}`);

        return e;
    }

    protected getExp(): Expression {
        this.skip();

        let e: Expression = this.tryLiteral()
            || this.tryVariable()
            || this.tryUnary()
            || this.tryGroup()
            || this.tryObject()
            || this.tryArray();

        if (!e) return e;
        e = this.tryKnown(e) || e;

        let r: Expression;
        do {
            this.skip();

            r = e;
            e = this.tryMember(e)
                || this.tryIndexer(e)
                || this.tryFunc(e)
                || this.tryCall(e)
                || this.tryTernary(e)
                || this.tryBinary(e);
        } while (e);

        return r;
    }

    protected tryLiteral() {
        const that = this;

        function tryNumeric() {
            let n = '';

            function x() {
                while (that.isNumber()) {
                    n += that.ch;
                    that.move();
                }
            }

            x();
            if (that.get(that.separator)) {
                n += that.separator;
                x();
            }

            if (n) {
                if (that.isVariableStart())
                    throw new Error(`Unexpected character (${that.ch}) at index ${that.idx}`);

                return Tokenizer.literalExp(Number(n));
            }

            return null;
        }

        function tryString() {
            let c = that.ch, inter;
            if (c === '`') {
                inter = true;
            }
            else if (c !== '"' && c !== "'") return null;

            const q = c, es: Expression[] = [];
            let s = '';

            while (c = that.move()) {
                if (c === q) {
                    that.move();

                    if (es.length) {
                        if (s) {
                            es.push(Tokenizer.literalExp(s));
                        }

                        return es.reduce((p, n) => Tokenizer.binaryExp('+', p, n), Tokenizer.literalExp(''));
                    }

                    return Tokenizer.literalExp(s);
                }

                if (c === '\\') {
                    c = that.move();
                    switch (c) {
                        case 'b': s += '\b'; break;
                        case 'f': s += '\f'; break;
                        case 'n': s += '\n'; break;
                        case 'r': s += '\r'; break;
                        case 't': s += '\t'; break;
                        case 'v': s += '\x0B'; break;
                        case '0': s += '\0'; break;
                        case '\\': s += '\\'; break;
                        case "'": s += "'"; break;
                        case '"': s += '"'; break;
                        default: s += '\\' + c; break;
                    }
                } else if (inter && that.get('${')) {
                    if (s) {
                        es.push(Tokenizer.literalExp(s));
                        s = '';
                    }
                    es.push(that.getExp());
                    that.skip()

                    if (that.ch !== '}')
                        throw new Error(`Unterminated template literal at ${that.idx}`);
                } else {
                    s += c;
                }
            }

            throw new Error(`Unclosed quote after ${s}`);
        }

        return tryNumeric() || tryString();
    }

    protected getVariableName() {
        let v = '';

        if (this.isVariableStart()) {
            do {
                v += this.ch;
                this.move();
            } while (this.stillVariable());
        }

        return v;
    }

    protected tryVariable() {
        const v = this.getVariableName();
        return v ? Tokenizer.variableExp(v) : null;
    }

    protected tryUnary() {
        const u = unary.find(u => this.get(u));
        return u ? Tokenizer.unaryExp(u, this.getExp()) : null;
    }

    protected tryGroup() {
        return this.get('(') ? Tokenizer.groupExp(this.getGroup()) : null;
    }

    protected getGroup() {
        const es: Expression[] = [];
        do {
            const e = this.getExp();
            if (e) {
                es.push(e);
            }
        } while (this.get(','));

        this.to(')');

        return es;
    }

    protected tryObject() {
        if (!this.get('{')) return null;

        const es: AssignExpression[] = [];
        do {
            this.skip();
            const ve = this.getExp() as VariableExpression;
            if (ve.type !== ExpressionType.Variable && ve.type !== ExpressionType.Member)
                throw new Error(`Invalid assignment at ${this.idx}`);

            this.skip();
            if (this.get(':')) {
                if (ve.type !== ExpressionType.Variable)
                    throw new Error(`Invalid assignment at ${this.idx}`);

                this.skip();

                es.push(Tokenizer.assignExp(ve.name, this.getExp()));
            }
            else {
                es.push(Tokenizer.assignExp(ve.name, ve));
            }
        } while (this.get(','));

        this.to('}');

        return Tokenizer.objectExp(es);
    }

    protected tryArray() {
        if (!this.get('[')) return null;

        const es: Expression[] = [];
        do {
            es.push(this.getExp());
        } while (this.get(','));

        this.to(']');

        return Tokenizer.arrayExp(es);
    }

    protected tryKnown(e: Expression) {
        if (e.type === ExpressionType.Variable) {
            const le = e as VariableExpression;
            if (knowns.hasOwnProperty(le.name))
                return Tokenizer.literalExp(knowns[le.name]);
        }

        return null;
    }

    protected tryMember(e: Expression) {
        if (!this.get('.')) return null;

        this.skip();
        const v = this.getVariableName();
        if (!v) throw new Error(`Invalid member identifier at ${this.idx}`);

        return Tokenizer.memberExp(e, v);
    }

    protected tryIndexer(e: Expression) {
        if (!this.get('[')) return null;

        this.skip();
        const k = this.getExp();
        if (k == null) throw new Error(`Invalid indexer identifier at ${this.idx}`);

        this.to(']');

        return Tokenizer.indexerExp(e, k);
    }

    protected tryFunc(e: Expression) {
        if (this.get('=>'))
            return Tokenizer.funcExp(this.getParameters(e), this.getExp());

        if (e.type === ExpressionType.Variable && (e as VariableExpression).name === 'function') {
            const parameters = this.getParameters(this.getExp());
            this.to('{');
            this.skip();
            this.get('return');

            const body = this.getExp();
            this.get(';');
            this.to('}');

            return Tokenizer.funcExp(parameters, body);
        }

        return null;
    }

    protected getParameters(e: Expression) {
        if (e.type === ExpressionType.Group) {
            const ge = e as GroupExpression;
            return ge.expressions.map(x => {
                if (x.type !== ExpressionType.Variable)
                    throw new Error(`Invalid parameter at ${this.idx}`);

                return (x as VariableExpression).name;
            });
        }

        if (e.type !== ExpressionType.Variable)
            throw new Error(`Invalid parameter at ${this.idx}`);

        return [(e as VariableExpression).name];
    }

    protected tryCall(e: Expression) {
        return this.get('(') ? this.getCall(e) : null;
    }

    protected getCall(e: Expression) {
        const args = this.getGroup();

        return Tokenizer.callExp(e, args);
    }

    protected tryTernary(e: Expression) {
        if (!this.get('?')) return null;

        const whenTrue = this.getExp();
        this.to(':');
        const whenFalse = this.getExp();

        return Tokenizer.ternaryExp(e, whenTrue, whenFalse);
    }

    protected tryBinary(e: Expression) {
        const op = binary.find(b => this.get(b));

        if (!op) return null;

        const right = this.getExp();

        if (right.type === ExpressionType.Binary)
            return this.fixPrecedence(e, op, right as BinaryExpression);

        return Tokenizer.binaryExp(op, e, right);
    }

    protected isSpace() {
        return this.cd === 32 || this.cd === 9 || this.cd === 160 || this.cd === 10 || this.cd === 13;
    }

    protected isNumber() {
        return this.cd >= 48 && this.cd <= 57;
    }

    protected isVariableStart() {
        return (this.cd === 36) || (this.cd === 95) || // `$`, `_`
            (this.cd >= 65 && this.cd <= 90) || // A...Z
            (this.cd >= 97 && this.cd <= 122); // a...z
    }

    protected stillVariable() {
        return this.isVariableStart() || this.isNumber();
    }

    protected move(count: number = 1) {
        this._idx += count;
        this._cd = this.exp.charCodeAt(this.idx)
        return this._ch = this.exp.charAt(this.idx);
    }

    protected get(s: string) {
        if (this.eq(this.idx, s))
            return !!this.move(s.length);

        return false;
    }

    protected skip() {
        while (this.isSpace() && this.move());
    }

    protected eq(idx: number, target: string) {
        return this.exp.substr(idx, target.length) === target;
    }

    protected to(c: string) {
        this.skip();

        if (!this.eq(this.idx, c))
            throw new Error(`Expected ${c} at index ${this.idx}, found ${this.exp[this.idx]}`);

        this.move(c.length);
    }

    protected fixPrecedence(left: Expression, leftOp: string, right: BinaryExpression) {
        const p1 = precedence[leftOp];
        const p2 = precedence[right.operator];

        return p2 < p1
            ? Tokenizer.binaryExp(right.operator, Tokenizer.binaryExp(leftOp, left, right.left), right.right)
            : Tokenizer.binaryExp(leftOp, left, right);
    }

    static literalExp(value) {
        return { type: ExpressionType.Literal, value } as LiteralExpression;
    }
    
    static variableExp(name: string) {
        return { type: ExpressionType.Variable, name } as VariableExpression;
    }
    
    static unaryExp(operator: string, target: Expression) {
        return { type: ExpressionType.Unary, target, operator } as UnaryExpression;
    }
    
    static groupExp(expressions: Expression[]) {
        return { type: ExpressionType.Group, expressions } as GroupExpression;
    }
    
    static assignExp(member: string, right: Expression) {
        return { type: ExpressionType.Assign, name: member, right } as AssignExpression;
    }
    
    static objectExp(members: AssignExpression[]) {
        return { type: ExpressionType.Object, members } as ObjectExpression;
    }
    
    static arrayExp(items: Expression[]) {
        return { type: ExpressionType.Array, items } as ArrayExpression;
    }
    
    static binaryExp(operator: string, left: Expression, right: Expression) {
        return { type: ExpressionType.Binary, operator, left, right } as BinaryExpression;
    }
    
    static memberExp(owner: Expression, name: string) {
        return { type: ExpressionType.Member, owner, name } as MemberExpression;
    }
    
    static indexerExp(owner: Expression, key: Expression) {
        return { type: ExpressionType.Indexer, owner, key } as IndexerExpression;
    }
    
    static funcExp(parameters: string[], body: Expression) {
        return { type: ExpressionType.Func, parameters, body } as FuncExpression;
    }
    
    static callExp(callee: Expression, args: Expression[]) {
        return { type: ExpressionType.Call, callee, args } as CallExpression;
    }
    
    static ternaryExp(predicate: Expression, whenTrue: Expression, whenFalse: Expression) {
        return { type: ExpressionType.Ternary, predicate, whenTrue, whenFalse } as TernaryExpression;
    }
}