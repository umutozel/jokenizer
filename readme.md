# Jokenizer - JavaScript Expression Parser and Evaluator

[![Build Status](https://travis-ci.org/umutozel/jokenizer.svg?branch=master)](https://travis-ci.org/umutozel/jokenizer)
[![Coverage Status](https://coveralls.io/repos/github/umutozel/jokenizer/badge.svg?branch=master)](https://coveralls.io/github/umutozel/jokenizer?branch=master)
[![npm version](https://badge.fury.io/js/jokenizer.svg)](https://badge.fury.io/js/jokenizer)
<a href="https://snyk.io/test/npm/jokenizer"><img src="https://snyk.io/test/npm/jokenizer/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/npm/jokenizer" style="max-width:100%;"></a>

jokenizer is just a simple library to parse JavaScript expressions and evaluate them with custom scopes.

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
