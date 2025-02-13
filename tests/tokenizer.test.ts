import {
    ArrayExpression,
    BinaryExpression,
    CallExpression, ExpressionType, FuncExpression,
    IndexerExpression, LiteralExpression,
    MemberExpression, ObjectExpression, TernaryExpression,
    tokenize, UnaryExpression, VariableExpression,
} from "../index";

describe("Tokenizer simple call to check ExpressionType", () => {

    it("should return null", () => {
        const exp = tokenize("");
        expect(exp).toBe(null);
    });

    it("should not be able to parse", () => {
        expect(() => tokenize("#")).toThrow();
    });

    it("should return number LiteralExpression", () => {
        const e = tokenize<LiteralExpression>("42");
        expect(e.type).toBe(ExpressionType.Literal);
        expect(e.value).toBe(42);
    });

    it("should return decimal number LiteralExpression", () => {
        const e = tokenize<LiteralExpression>("42.4242");
        expect(e.type).toBe(ExpressionType.Literal);
        expect(e.value).toEqual(42.4242);
    });

    it("should return string LiteralExpression", () => {
        const e = tokenize<LiteralExpression>("'4\\'2'");
        expect(e.type).toBe(ExpressionType.Literal);
        expect(e.value).toBe("4'2");

        expect(() => tokenize("'blow")).toThrow();

        const esc = tokenize<LiteralExpression>("'\\z\\b\\f\\n\\r\\t\\v\\0\\\'\\\"\\\\'");
        expect(esc.type).toBe(ExpressionType.Literal);
        expect(esc.value).toBe("\\z\b\f\n\r\t\v\0\'\"\\");
    });

    it("should return LiteralExpression for known variables", () => {
        const e1 = tokenize<LiteralExpression>("true");
        expect(e1.type).toBe(ExpressionType.Literal);
        expect(e1.value).toBe(true);

        const e2 = tokenize<LiteralExpression>("false");
        expect(e2.type).toBe(ExpressionType.Literal);
        expect(e2.value).toBe(false);

        const e3 = tokenize<LiteralExpression>("null");
        expect(e3.type).toBe(ExpressionType.Literal);
        expect(e3.value).toBe(null);
    });

    it("should return VariableExpression", () => {
        const e = tokenize<VariableExpression>("Name");
        expect(e.type).toBe(ExpressionType.Variable);
        expect(e.name).toBe("Name");

        expect(() => tokenize("42d")).toThrow();
    });

    it("should return UnaryExpression", () => {
        const e = tokenize<UnaryExpression>("!IsActive");
        expect(e.type).toBe(ExpressionType.Unary);
        expect(e.operator).toBe("!");
        expect(e.target.type).toBe(ExpressionType.Variable);

        const te = e.target as VariableExpression;
        expect(te.name).toBe("IsActive");
    });

    it("should return ObjectExpression", () => {
        const e = tokenize<ObjectExpression>("{ a : v1, b.c }");
        expect(e.type).toBe(ExpressionType.Object);
        expect(e.members).toHaveLength(2);
        expect(e.members[0].name).toBe("a");
        expect(e.members[1].name).toBe("c");

        expect(() => tokenize("{ a: 4 ")).toThrow();
        expect(() => tokenize("{ 4: 4 }")).toThrow();
        expect(() => tokenize("{ a.b: 4 }")).toThrow();
    });

    it("should return ArrayExpression", () => {
        const e = tokenize<ArrayExpression>("[ a, 1 ]");
        expect(e.type).toBe(ExpressionType.Array);

        expect(e.items).toHaveLength(2);
        expect(e.items[0].type).toBe(ExpressionType.Variable);

        expect(e.items[1].type).toBe(ExpressionType.Literal);

        const ve = e.items[0] as VariableExpression;
        expect(ve.name).toBe("a");

        const le = e.items[1] as LiteralExpression;
        expect(le.value).toBe(1);
    });

    it("should return MemberExpression", () => {
        const e = tokenize<MemberExpression>("Company.Name");
        expect(e.type).toBe(ExpressionType.Member);
        expect(e.owner.type).toBe(ExpressionType.Variable);
        expect(e.name).toBe("Name");

        const ve = e.owner as VariableExpression;
        expect(ve.name).toBe("Company");

        expect(() => tokenize("Company.5")).toThrow();
    });

    it("should return IndexerExpression", () => {
        const e = tokenize<IndexerExpression>("Company['Name']");
        expect(e.type).toBe(ExpressionType.Indexer);
        expect(e.owner.type).toBe(ExpressionType.Variable);
        expect(e.key.type).toBe(ExpressionType.Literal);

        const ve = e.owner as VariableExpression;
        expect(ve.name).toBe("Company");

        const ve2 = e.key as LiteralExpression;
        expect(ve2.value).toBe("Name");

        expect(() => tokenize("Company[]")).toThrow();
    });

    it("should return FuncExpression for lambda", () => {
        const e = tokenize<FuncExpression>("(a, b) => a < b");
        expect(e.type).toBe(ExpressionType.Func);
        expect(e.parameters).toHaveLength(2);
        expect(e.parameters).toEqual(["a", "b"]);
        expect(e.body.type).toBe(ExpressionType.Binary);

        const be = e.body as BinaryExpression;
        expect(be.operator).toBe("<");
        expect(be.left.type).toBe(ExpressionType.Variable);
        expect(be.right.type).toBe(ExpressionType.Variable);

        const le = be.left as VariableExpression;
        expect(le.name).toBe("a");

        const re = be.right as VariableExpression;
        expect(re.name).toBe("b");

        expect(() => tokenize("(a, 4) => a < b")).toThrow();
        expect(() => tokenize("2 => a < b")).toThrow();
    });

    it("should return FuncExpression for function", () => {
        const fe = tokenize<FuncExpression>("function(a, b) { return a < b; }");
        expect(fe.type).toBe(ExpressionType.Func);
        expect(fe.parameters).toHaveLength(2);
        expect(fe.parameters).toEqual(["a", "b"]);
        expect(fe.body.type).toBe(ExpressionType.Binary);

        const be = fe.body as BinaryExpression;
        expect(be.operator).toBe("<");

        expect(be.left.type).toBe(ExpressionType.Variable);
        const le = be.left as VariableExpression;
        expect(le.name).toBe("a");

        expect(be.right.type).toBe(ExpressionType.Variable);
        const re = be.right as VariableExpression;
        expect(re.name).toBe("b");
    });

    it("should return CallExpression", () => {
        const e = tokenize<CallExpression>("Test(42, a)");
        expect(e.type).toBe(ExpressionType.Call);
        expect(e.callee.type).toBe(ExpressionType.Variable);
        expect(e.args.length).toBe(2);
        expect(e.args[0].type).toBe(ExpressionType.Literal);
        expect(e.args[1].type).toBe(ExpressionType.Variable);

        const le = e.args[0] as LiteralExpression;
        expect(le.value).toBe(42);

        const ve = e.args[1] as VariableExpression;
        expect(ve.name).toBe("a");
    });

    it("should return TernaryExpression", () => {
        const e = tokenize<TernaryExpression>("check ? 42 : 21");
        expect(e.type).toBe(ExpressionType.Ternary);
        expect(e.predicate.type).toBe(ExpressionType.Variable);
        expect(e.whenTrue.type).toBe(ExpressionType.Literal);
        expect(e.whenFalse.type).toBe(ExpressionType.Literal);

        const pe = e.predicate as VariableExpression;
        expect(pe.name).toBe("check");

        const wt = e.whenTrue as LiteralExpression;
        expect(wt.value).toBe(42);

        const wf = e.whenFalse as LiteralExpression;
        expect(wf.value).toBe(21);
    });

    it("should return BinaryExpression", () => {
        const e = tokenize<BinaryExpression>("v1 > v2");
        expect(e.type).toBe(ExpressionType.Binary);
        expect(e.operator).toBe(">");
        expect(e.left.type).toBe(ExpressionType.Variable);
        expect(e.right.type).toBe(ExpressionType.Variable);

        const le = e.left as VariableExpression;
        expect(le.name).toBe("v1");

        const re = e.right as VariableExpression;
        expect(re.name).toBe("v2");

        const ie1 = tokenize("`don't ${w}, 42`");
        expect(ie1.type).toBe(ExpressionType.Binary);

        const bie = ie1 as BinaryExpression;
        expect(bie.operator).toBe("+");
        expect(bie.left.type).toBe(ExpressionType.Binary);
        expect(bie.right.type).toBe(ExpressionType.Literal);

        const ie2 = tokenize("`don't ${w}`");
        expect(ie2.type).toBe(ExpressionType.Binary);

        const ie3 = tokenize("`${w} panic`");
        expect(ie3.type).toBe(ExpressionType.Binary);

        expect(() => tokenize("`don't ${w, 42`")).toThrow();
    });

    it("should return BinaryExpression with correct precedence", () => {
        const e = tokenize<BinaryExpression>("1 + 2 * 3");
        expect(e.type).toBe(ExpressionType.Binary);
        expect(e.operator).toBe("+");
        expect(e.left.type).toBe(ExpressionType.Literal);
        expect(e.right.type).toBe(ExpressionType.Binary);

        const le = e.left as LiteralExpression;
        expect(le.value).toBe(1);

        const re = e.right as BinaryExpression;
        expect(re.operator).toBe("*");
        expect(re.left.type).toBe(ExpressionType.Literal);
        expect(re.right.type).toBe(ExpressionType.Literal);

        const le2 = re.left as LiteralExpression;
        expect(le2.value).toBe(2);

        const le3 = re.right as LiteralExpression;
        expect(le3.value).toBe(3);
    });
});
