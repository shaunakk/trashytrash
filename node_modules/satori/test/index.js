var satori,
    assert;

satori = require('../index');
assert = require('assert');

(function() {
    var f,
        s,
        m,
        tests;

    f = 'Failure: ';
    s = 'Success: ';
    m = ' => ';

    tests = [
        ['nil', 'nil'],
        ['()', 'nil'],
        ['t', 'T'],

        ['(quote x)', 'x'],

        ['(atom 1)', 'T'],
        ['(atom (quote x))', 'T'],
        ['(atom "foo")', 'T'],
        ['(atom nil)', 'T'],
        ['(atom ())', 'T'],
        ['(atom (quote (1 2)))', 'nil'],
        ['(atom +)', 'nil'],

        ['(eq t t)', 'T'],
        ['(eq t nil)', 'nil'],
        ['(eq nil t)', 'nil'],
        ['(eq nil ())', 'T'],
        ['(eq () nil)', 'T'],

        ['(car (quote (1 2)))', 1],
        ['(cdr (quote (1 2)))', '(2)'],
        ['(cons 1 2)', '(1 2)'],

        ['(cond ((eq 0 1) t) (t 5))', 5],

        ['((lambda (x) (+ x x) (* x x)) 5)', 25],

        ['(+)', 0],
        ['(+ 1)', 1],
        ['(+ 1 2)', 3],
        ['(+ 1 2 3)', 6],

        ['(- 1)', -1],
        ['(- 2 1)', 1],
        ['(- 1 2)', -1],
        ['(- 5 3 2)', 0],

        ['(*)', 1],
        ['(* 2)', 2],
        ['(* 2 2)', 4],
        ['(* (- 2) (- 2) (- 2))', -8],

        ['(/ 2)', 0.5],
        ['(/ 2 4)', 0.5],
        ['(/ 8 2 2)', 2]
    ];

    tests.map(function(e) {
        assert(satori.read(e[0]) === e[1], f + e[0] + m + e[1]);
        console.log(s + e[0] + m + e[1]);
    });

    console.log('\nAll tests passed.');
    process.exit(0);
})();
