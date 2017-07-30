Satori
======

A simple Lisp interpreter written in JavaScript, with a Scheme-like syntax.

## Installation

```sh
$ sudo npm install satori -g
```

## Usage

Satori provides a REPL, as well as the ability to evaluate files.

```sh
$ satori
λ>
```

```sh
$ satori test.scm

"Hello, World!"
```

Satori is not intended to be a production Lisp implementation. Instead, it is a
demonstration of an axiomatic approach to computation, reflecting the
realization that a few simple primitives provide the bedrock for an incredibly
expressive programming language.

As such, Satori supports eight Lisp primitives...

* quote
* atom
* eq
* car
* cdr
* cons
* cond
* lambda

... four arithmetic functions ...

* +
* -
* *
* /

... two primitives to enable side effects ...

* define
* set

... and two special operators ...

* print
* memdump

The following is an example session demonstrating their usage and syntax.

```scheme
λ> (memdump)
[ { '+': [Function],
    '-': [Function],
    '*': [Function],
    '/': [Function],
    t: true,
    nil: [],
    '()': [],
    quote: [Function],
    atom: [Function],
    eq: [Function],
    car: [Function],
    cdr: [Function],
    cons: [Function],
    cond: [Function],
    lambda: [Function],
    define: [Function],
    set: [Function],
    print: [Function],
    memdump: [Function] } ]
=> nil

λ> t
=> T

λ> nil
=> nil

λ> ()
=> nil

λ> (quote x)
=> x

λ> (quote (1 2 3))
=> (1 2 3)

λ> (atom 1)
=> T

λ> (atom (quote (1 2)))
=> nil

λ> (eq 1 1)
=> T

λ> (eq 1 2)
=> nil

λ> (eq (quote x) (quote x))
=> T

λ> (eq (quote (1 2)) (quote (1 3)))
=> nil

λ> (car (quote (1 2)))
=> 1

λ> (cdr (quote (1 2)))
=> (2)

λ> (cons 1 2)
=> (1 2)

λ> (cons 1 (quote (2 3)))
=> (1 (2 3))

λ> (cond ((eq 1 2) 0) (t 5))
=> 5

λ> (cond ((eq 1 1) 0) (t 5))
=> 0

λ> ((lambda (x y) (+ x y)) 1 2)
=> 3

λ> (define adder (lambda (x)
                   (lambda (y)
                     (+ x y))))
=> <Function>

λ> (define increment (adder 1))
=> <Function>

λ> (increment 10)
=> 11

λ> (print 1)
1
=> 1

λ> (define x 5)
=> 5

λ> x
=> 5

λ> (set x 10)
=> 10

λ> x
=> 10

λ> (define closure-example (lambda ()
                             (define x 5)
                             (define y 10)
                             (memdump)
                             (lambda ()
                               (+ x y))))
=> <Function>

λ> ((closure-example))
[ { x: 5, y: 10 },
  [ { '+': [Function],
      '-': [Function],
      '*': [Function],
      '/': [Function],
      t: true,
      nil: [],
      '()': [],
      quote: [Function],
      atom: [Function],
      eq: [Function],
      car: [Function],
      cdr: [Function],
      cons: [Function],
      cond: [Function],
      lambda: [Function],
      define: [Function],
      set: [Function],
      print: [Function],
      memdump: [Function],
      adder: [Function],
      increment: [Function],
      x: 10,
      'closure-example': [Function] } ] ]
=> 15

λ>:quit
```

## Release History

* 1.0.4 Documentation fixes
* 1.0.3 Updated node package
* 1.0.2 Expanded documentation
* 1.0.1 Expanded documentation
* 1.0.0 Initial release

## License

Satori is provided as-is under the two-clause BSD license.
