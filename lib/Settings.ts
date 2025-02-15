export class Settings {
    public static default = new Settings();

    private knowns = {
        "false": false,
        "null": null,
        "true": true,
    };
    private unary: { [op: string]: (value: any) => any } = {
        "!": (v) => !v,
        "+": (v) => +v,
        "-": (v) => -1 * v,
        "~": (v) => ~v,
    };
    private binary: { [op: string]: BinaryOperatorInfo } = {
        "&&": { precedence: 0, func: (l, r) => l && u(r) },
        "||": { precedence: 0, func: (l, r) => l || u(r) },

        "|": { precedence: 1, func: (l, r) => l | u(r) },
        "^": { precedence: 1, func: (l, r) => l ^ u(r) },
        "&": { precedence: 1, func: (l, r) => l & u(r) },

        "===": { precedence: 2, func: (l, r) => l === u(r) },
        "!==": { precedence: 2, func: (l, r) => l !== u(r) },
        "==": { precedence: 2, func: (l, r) => l == u(r) },
        "!=": { precedence: 2, func: (l, r) => l != u(r) },

        "<<": { precedence: 3, func: (l, r) => l << u(r) },
        ">>>": { precedence: 3, func: (l, r) => l >>> u(r) },
        ">>": { precedence: 3, func: (l, r) => l >> u(r) },

        "<=": { precedence: 4, func: (l, r) => l <= u(r) },
        ">=": { precedence: 4, func: (l, r) => l >= u(r) },
        "<": { precedence: 4, func: (l, r) => l < u(r) },
        ">": { precedence: 4, func: (l, r) => l > u(r) },

        "+": { precedence: 5, func: (l, r) => l + u(r) },
        "-": { precedence: 5, func: (l, r) => l - u(r) },

        "*": { precedence: 6, func: (l, r) => l * u(r) },
        "/": { precedence: 6, func: (l, r) => l / u(r) },
        "%": { precedence: 6, func: (l, r) => l % u(r) },
    };

    get knownIdentifiers() {
        return Object.getOwnPropertyNames(this.knowns);
    }

    get unaryOperators() {
        return Object.getOwnPropertyNames(this.unary);
    }

    get binaryOperators() {
        return Object.getOwnPropertyNames(this.binary).sort((b1, b2) => b2.length - b1.length);
    }

    public addKnownValue(identifier: string, value: any) {
        this.knowns[identifier] = value;
        return this;
    }

    public containsKnown(identifier: string) {
        return identifier in this.knowns;
    }

    public getKnownValue(identifier: string) {
        return this.knowns[identifier];
    }

    public addUnaryOperator(op: string, func: (value: any) => any) {
        this.unary[op] = func;
        return this;
    }

    public containsUnary(op: string) {
        return this.unary[op] != null;
    }

    public getUnaryOperator(op: string) {
        return this.unary[op];
    }

    public addBinaryOperator(op: string, func: (left: any, right: any) => any, precedence = 7) {
        this.binary[op] = { precedence, func };
        return this;
    }

    public containsBinary(op: string) {
        return this.binary[op] != null;
    }

    public getBinaryOperator(op: string) {
        return this.binary[op];
    }
}

export interface BinaryOperatorInfo {
    precedence: number;
    func: (left: any, right: () => any) => any;
}

function u(v: any) {
    return typeof v === "function" ? v() : v;
}
