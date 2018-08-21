# Jokenizer - JavaScript Expression Parser and Evaluator

jokenizer is just a simple library to parse JavaScript expression and evaluate them with custom scopes.

## Let's parse something

```JavaScript
const expression = tokenize('{ a: v1, b }');
const scope = { v1: 3, b: 5 };
const value = evaluate(expression, [scope]);

/*
expression =
{
    "type": "O",          // ObjectExpression
    "members": [{
        "type": "A",      // AssignExpression
        "name": "a",
        "right": {
            "type": "V",  // VariableExpression
            "name": "v1"
        }
    }, {
        "type": "V",
        "name": "b"
    }]
}

value = { "a": 3, "b": 5 }     // evaluated value
*/
```
