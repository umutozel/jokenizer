export class Settings {
    
    constructor() {
    }

    private knowns = {
        'true': true,
        'false': false,
        'null': null
    };
    private unary: { [op: string]: (value) => any } = {
        '-': v => -1*v, 
        '+': v => +v,
        '!': v => !v,
        '~': v => ~v
    };
    private binary: { [op: string]: BinaryOperatorInfo } = {
        '&&': { precedence: 0, func: (l, r) => l && u(r) },
        '||': { precedence: 0, func: (l, r) => l || u(r) },
        
        '|': { precedence: 1, func: (l, r) => l | u(r) },
        '^': { precedence: 1, func: (l, r) => l ^ u(r) },
        '&': { precedence: 1, func: (l, r) => l & u(r) },

        '===': { precedence: 2, func: (l, r) => l === u(r) },
        '!==': { precedence: 2, func: (l, r) => l !== u(r) },
        '==': { precedence: 2, func: (l, r) => l == u(r) },
        '!=': { precedence: 2, func: (l, r) => l != u(r) },

        '<<': { precedence: 3, func: (l, r) => l << u(r) },
        '>>>': { precedence: 3, func: (l, r) => l >>> u(r) },
        '>>': { precedence: 3, func: (l, r) => l >> u(r) },

        '<=': { precedence: 4, func: (l, r) => l <= u(r) },
        '>=': { precedence: 4, func: (l, r) => l >= u(r) },
        '<': { precedence: 4, func: (l, r) => l < u(r) },
        '>': { precedence: 4, func: (l, r) => l > u(r) },

        '+': { precedence: 5, func: (l, r) => l + u(r) },
        '-': { precedence: 5, func: (l, r) => l - u(r) },

        '*': { precedence: 6, func: (l, r) => l * u(r) },
        '/': { precedence: 6, func: (l, r) => l / u(r) },
        '%': { precedence: 6, func: (l, r) => l % u(r) }
    };

    get knownIdentifiers() {
        return Object.getOwnPropertyNames(this.knowns);
    }
    
    get unaryOperators() {
        return Object.getOwnPropertyNames(this.unary);
    }

    get binaryOperators() {
        return Object.getOwnPropertyNames(this.binary);
    }

    addKnownValue(identifier: string, value) {
        this.knowns[identifier] = value;
        return this;
    }

    containsKnown(identifier: string) {
        return identifier in this.knowns;
    }

    getKnownValue(identifier: string) {
        return this.knowns[identifier];
    }

    addUnaryOperator(op: string, func: (value) => any) {
        this.unary[op] = func;
        return this;
    }

    containsUnary(op: string) {
        return this.unary[op] != null;
    }
    
    getUnaryOperator(op: string) {
        return this.unary[op];
    }

    addBinaryOperator(op: string, func: (left, right) => any, precedence = 7) {
        this.binary[op] = {precedence, func};
        return this;
    }

    containsBinary(op: string) {
        return this.binary[op] != null;
    }

    getBinaryOperator(op: string) {
        return this.binary[op];
    }
    
    static default = new Settings();
}

export interface BinaryOperatorInfo {
    precedence: number;
    func: (left, right: () => any) => any | any;
}

function u(v) {
    return typeof v === 'function' ? v() : v;
}