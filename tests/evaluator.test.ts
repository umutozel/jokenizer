import {
    BinaryExpression, evaluate, ExpressionType,
    GroupExpression, ObjectExpression, Settings,
    tokenize, UnaryExpression,
} from "../index";

describe("Evaluation tests", () => {

    it("should evaluate number with string", () => {
        const v = evaluate("42");
        expect(v).toBe(42);
    });

    it("should evaluate number", () => {
        const v = evaluate(tokenize("42"));
        expect(v).toBe(42);
    });

    it("should evaluate decimal number", () => {
        const v = evaluate(tokenize("42.4242"));
        expect(v).toEqual(42.4242);
    });

    it("should evaluate string", () => {
        const v = evaluate(tokenize("'4\\'2'"));
        expect(v).toBe("4'2");
    });

    it("should evaluate interpolated string", () => {
        const v1 = evaluate(tokenize("`don't ${w}, 42`"), { w: "panic" });
        expect(v1).toBe("don't panic, 42");

        const v2 = evaluate(tokenize("`don't ${w}`"), { w: "panic" });
        expect(v2).toBe("don't panic");

        const v3 = evaluate(tokenize("`${w} panic`"), { w: "don't" });
        expect(v3).toBe("don't panic");
    });

    it("should evaluate reserved constants for known variables", () => {
        const v1 = evaluate(tokenize("true"));
        expect(v1).toBe(true);

        const v2 = evaluate(tokenize("false"));
        expect(v2).toBe(false);

        const v3 = evaluate(tokenize("null"));
        expect(v3).toBe(null);

        const settings = new Settings().addKnownValue("secret", 42);
        const v4 = evaluate("secret", settings);
        expect(v4).toBe(42);
    });

    it("should evaluate variable", () => {
        const v = evaluate(tokenize("Name"), { Name: "Alan" });
        expect(v).toBe("Alan");
    });

    it("should evaluate unary", () => {
        const v1 = evaluate(tokenize("-Str"), { Str: "5" });
        expect(v1).toBe(-5);

        const v2 = evaluate(tokenize("+Str"), { Str: "5" });
        expect(v2).toBe(5);

        const v3 = evaluate(tokenize("!IsActive"), { IsActive: false });
        expect(v3).toBe(true);

        const t4 = tokenize<UnaryExpression>("~index");
        const v4 = evaluate(t4, { index: -1 });
        expect(v4).toBe(0);

        const t5 = { operator: "None", target: t4.target, type: t4.type } as UnaryExpression;
        expect(() => evaluate(t5, { index: -1 })).toThrow();
    });

    it("should evaluate custom unary", () => {
        const settings = new Settings()
            .addUnaryOperator("^", (e) => e * e);

        const v = evaluate("^Id", settings, { Id: 16 });
        expect(v).toBe(256);
    });

    it("should evaluate object", () => {
        const t = tokenize<ObjectExpression>("{ a: v1, b.c }");
        const v = evaluate(t, { v1: 3, b: { c: 5 } });
        expect(v).toEqual({ a: 3, c: 5 });
    });

    it("should evaluate array", () => {
        const v = evaluate(tokenize("[ a, 1 ]"), { a: 0 });
        expect(v).toEqual([0, 1]);
    });

    it("should evaluate member", () => {
        const v1 = evaluate(tokenize("Company.Name"), { Company: { Name: "Netflix" } });
        expect(v1).toBe("Netflix");

        const v2 = evaluate(tokenize("Company.Name"), null);
        expect(v2).toBe(undefined);
    });

    it("should evaluate indexer", () => {
        const v1 = evaluate(tokenize("Company['Name']"), { Company: { Name: "Netflix" } });
        expect(v1).toBe("Netflix");

        const v2 = evaluate(tokenize("Company[key]"), { Company: { Name: "Netflix" }, key: "Name" });
        expect(v2).toBe("Netflix");

        const v3 = evaluate(tokenize("Company['Name']"), null);
        expect(v3).toBe(null);
    });

    it("should evaluate function for lambda", () => {
        const v = evaluate(tokenize("(a, b) => a < b"));
        expect(v(2, 1)).toBe(false);
    });

    it("should evaluate function", () => {
        const v = evaluate(tokenize("function(a, b) { return a < b; }"));
        expect(v(2, 1)).toBe(false);
    });

    it("should evaluate function call", () => {
        const v1 = evaluate(tokenize("test()"), { test: () => 42 });
        expect(v1).toBe(42);

        const v2 = evaluate(tokenize("test(42, a)"), { test: (a: any, b: any) => a * b }, { a: 2 });
        expect(v2).toBe(84);

        const v3 = evaluate(tokenize("find(i => i > 2)"), [1, 2, 3, 4, 5]);
        expect(v3).toBe(3);
    });

    it("should evaluate ternary", () => {
        const v1 = evaluate(tokenize("check ? 42 : 21"), { check: true });
        expect(v1).toBe(42);

        const v2 = evaluate(tokenize("check ? 42 : 21"), { check: false });
        expect(v2).toBe(21);
    });

    it("should evaluate binary", () => {
        const v1 = evaluate(tokenize("v1 == v2"), { v1: 5, v2: 3 });
        expect(v1).toBe(false);

        const v2 = evaluate(tokenize("v1 != v2"), { v1: 5, v2: 3 });
        expect(v2).toBe(true);

        const v3 = evaluate(tokenize("v1 < v2"), { v1: 5, v2: 3 });
        expect(v3).toBe(false);

        const v4 = evaluate(tokenize("v1 > v2"), { v1: 5, v2: 3 });
        expect(v4).toBe(true);

        const v5 = evaluate(tokenize("v1 <= v2"), { v1: 5, v2: 3 });
        expect(v5).toBe(false);

        const v6 = evaluate(tokenize("v1 >= v2"), { v1: 5, v2: 3 });
        expect(v6).toBe(true);

        const v7 = evaluate(tokenize("v1 === v2"), { v1: 5, v2: 3 });
        expect(v7).toBe(false);

        const v8 = evaluate(tokenize("v1 !== v2"), { v1: 5, v2: 3 });
        expect(v8).toBe(true);

        const v9 = evaluate(tokenize("v1 % v2"), { v1: 5, v2: 3 });
        expect(v9).toBe(2);

        const v10 = evaluate(tokenize("v1 + v2"), { v1: 5, v2: 3 });
        expect(v10).toBe(8);

        const v11 = evaluate(tokenize("v1 - v2"), { v1: 5, v2: 3 });
        expect(v11).toBe(2);

        const v12 = evaluate(tokenize("v1 * v2"), { v1: 5, v2: 3 });
        expect(v12).toBe(15);

        const v13 = evaluate(tokenize("v1 / v2"), { v1: 6, v2: 3 });
        expect(v13).toBe(2);

        const v14 = evaluate(tokenize("v1 ^ v2"), { v1: 5, v2: 3 });
        expect(v14).toBe(6);

        const v15 = evaluate(tokenize("v1 | v2"), { v1: 5, v2: 3 });
        expect(v15).toBe(7);

        const v16 = evaluate(tokenize("v1 & v2"), { v1: 5, v2: 3 });
        expect(v16).toBe(1);

        const t17 = tokenize("v1 << v2");
        const v17 = evaluate(t17, { v1: 5, v2: 3 });
        expect(v17).toBe(40);

        const v18 = evaluate(tokenize("v1 >> v2"), { v1: 128, v2: 3 });
        expect(v18).toBe(16);

        const v19 = evaluate(tokenize("v1 >>> v2"), { v1: 16, v2: 3 });
        expect(v19).toBe(2);

        const v20 = evaluate(tokenize("v1 && v2"), { v1: true, v2: false });
        expect(v20).toBe(false);

        const t21 = tokenize<BinaryExpression>("v1 || v2");
        const v21 = evaluate(t21, { v1: false, v2: true });
        expect(v21).toBe(true);

        const t22 = { operator: "None", left: t21.left, right: t21.right, type: t21.type } as BinaryExpression;
        expect(() => evaluate(t22, { v1: false, v2: true })).toThrow();

        const date = new Date();
        const v23 = evaluate(tokenize("v1 == v2"), { v1: date, v2: date.getTime() });
        expect(v23).toBe(true);

        const v24 = evaluate(tokenize("v1 == v2"), { v1: date, v2: date.toISOString() });
        expect(v24).toBe(true);
    });

    it("should evaluate custom binary", () => {
        const settings = new Settings()
            .addBinaryOperator("in", (l, r) => r.indexOf(l) >= 0)
            .addBinaryOperator("mul", (l, r) => l * r, 0);

        const company1 = {};
        const company2 = {};
        const companies = [company1];
        const f = evaluate("(c, cs) => c in cs", settings);

        expect(f(company1, companies)).toBe(true);
        expect(f(company2, companies)).toBe(false);

        const v = evaluate("2 mul 3 + 5", settings);
        expect(v).toBe(16);
    });

    it("should fix precedence", () => {
        const v1 = evaluate(tokenize("(1 + 2 * 3)"));
        expect(v1).toBe(7);

        const v2 = evaluate(tokenize("(1 * 2 + 3)"));
        expect(v2).toBe(5);
    });

    it("should throw for unknown token", () => {
        expect(() => evaluate({ type: "NONE" } as any)).toThrow();
    });

    it("should throw for invalid token", () => {
        const objExp = tokenize<ObjectExpression>("{ a: b }");
        expect(() => evaluate(objExp.members[0])).toThrow();

        const groupExp = { expressions: [], type: ExpressionType.Group } as GroupExpression;
        expect(() => evaluate(groupExp)).toThrow();

        expect(() => evaluate(tokenize("a < b => b*2"))).toThrow();
    });

    it("settings tests", () => {
        const settings = new Settings();

        expect(3).toBe(settings.knownIdentifiers.length);
        expect(4).toBe(settings.unaryOperators.length);
        expect(21).toBe(settings.binaryOperators.length);

        expect(settings.containsKnown("true")).toBe(true);
        expect(settings.containsUnary("!")).toBe(true);
        expect(settings.containsBinary("%")).toBe(true);
    });
});
