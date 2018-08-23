# Jokenizer - JavaScript Expression Parser and Evaluator

[![Build Status](https://travis-ci.org/umutozel/jokenizer.svg?branch=master)](https://travis-ci.org/umutozel/jokenizer)
[![Coverage Status](https://coveralls.io/repos/github/umutozel/jokenizer/badge.svg?branch=master)](https://coveralls.io/github/umutozel/jokenizer?branch=master)	
[![npm version](https://badge.fury.io/js/jokenizer.svg)](https://badge.fury.io/js/jokenizer)	
<a href="https://snyk.io/test/npm/jokenizer"><img src="https://snyk.io/test/npm/jokenizer/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/npm/jokenizer" style="max-width:100%;"></a>

jokenizer is just a simple library to parse JavaScript expressions and evaluate them with custom scopes.
Written completely in TypeScript.

# Installation
```
npm i jokenizer
```

# Let's try it out

```JavaScript
import { tokenize, evaluate } from 'jokenizer';

const expression = tokenize('{ a: v1, b }');
const scope = { v1: 3, b: 5 };
const value = evaluate(expression, scope);

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

# Supported Expression Types

### LiteralExpression
```JavaScript
evaluate(tokenize('42'));               //  42
evaluate(tokenize('42.4242'));          //  42.4242
evaluate(tokenize('"4\'2"'));           //  "4'2"
evaluate(tokenize('true'));             //  true
evaluate(tokenize('false'));            //  false
evaluate(tokenize('null'));             //  null
```

### VariableExpression
```JavaScript
evaluate(tokenize('Name'), { Name: 'Alan' });       //  'Alan'
```

### UnaryExpression
```JavaScript
evaluate(tokenize('-Str'), { Str: '5' });               //  -5
evaluate(tokenize('+Str'), { Str: '5' });               //  5
evaluate(tokenize('!IsActive'), { IsActive: false });   //  true
evaluate(tokenize('~index'), { index: -1 });            //  0
```

### GroupExpression
```JavaScript
evaluate(tokenize('(a, b)'), { a: 4, b: 2 });   //  [1, 2]
evaluate(tokenize('a, b'), { a: 4, b: 2 });     //  [4, 2]
evaluate(tokenize('(a)'), { a: 4 });            //  4   - if expression count is 1, returns its value
```

### ObjectExpression
```JavaScript
evaluate(tokenize('{ a: v1, b }'), { v1: 3, b: 5 });    //  { a: 3, b: 5 }
```

### ArrayExpression
```JavaScript
evaluate(tokenize('[ a, 1 ]'), { a: 0 });               //  [0, 1]
```

### BinaryExpression
```JavaScript
evaluate(tokenize('v1 <= v2'), { v1: 5, v2: 3 });           //  false
evaluate(tokenize('v1 % v2'), { v1: 5, v2: 3 });            //  2
evaluate(tokenize('v1 * v2'), { v1: 5, v2: 3 });            //  15
evaluate(tokenize('v1 && v2'), { v1: true, v2: false });    //  false
evaluate(tokenize('1 + 2 * 3'));                            //  7   - supports operator precedence
```

### MemberExpression
```JavaScript
evaluate(tokenize('Company.Name'), { Company: { Name: 'Netflix' } });       //  'Netflix'
```

### IndexerExpression
```JavaScript
evaluate(tokenize('Company["Name"]'), { Company: { Name: 'Netflix' } });                //  'Netflix'
evaluate(tokenize('Company[key]'), { Company: { Name: 'Netflix' }, key: 'Name' });      //  'Netflix'
```

### FuncExpression
```JavaScript
const f = evaluate(tokenize('(a, b) => a < b'));
f(2, 1);        //  false

const f = evaluate(tokenize('function(a, b) { return a < b; }'));
f(2, 1)         //  false
```

### CallExpression
```JavaScript
evaluate(tokenize('test(42, a)'), { test: (a, b) => a * b }, { a: 2 });     //  84
```

### TernaryExpression
```JavaScript
evaluate(tokenize('check ? 42 : 21'), { check: true });     //  42
```

# License
Jokenizer is under the [MIT License](LICENSE).
