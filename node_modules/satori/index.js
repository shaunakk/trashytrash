var Satori = function() {
    "use strict";

    var Globals,
        Constants,
        Errors,
        Environments,
        Primitives,
        Expressions,
        Evaluator,
        Reader;

    Globals = {
        Environments: []
    };

    Constants = {
        ARITY_VARIADIC: -1
    };

    Errors = {
        ARITY: 'ArityException',
        EXPRESSION: 'ExpressionException',
        PARENTHESIS: 'ParenthesisMismatchException',
        FUNCALL: 'FuncallException',
        SYMBOL: 'SymbolException',
        BINDING: 'BindingException',

        raise: function(message) { throw message; }
    };

    Environments = function() {
        var create = function(keys, values) {
            return assoc(keys, values);
        };

        var bind = function(keys, vals, envs) {
            return [create(keys, vals), envs];
        };

        var define = function(k, v, envs) {
            if(envs.length > 0 && !(k in envs[0])) {
                envs[0][k] = v;
                return v;
            }
            Errors.raise(Errors.BINDING);
            return Primitives.nil;
        };

        var set = function(k, v, envs) {
            if(envs.length > 0 && (k in envs[0])) {
                envs[0][k] = v;
                return v;
            }
            if(envs.length > 1) {
                return set(k, v, envs[1]);
            }
            return Primitives.nil;
        };

        var lookup = function(k, envs) {
            if(envs.length > 0 && (k in envs[0])) {
                return envs[0][k];
            }
            if(envs.length > 1) {
                return lookup(k, envs[1]);
            }
            return Primitives.nil;
        };

        return {
            create: create,
            bind: bind,
            define: define,
            set: set,
            lookup: lookup
        };
    };

    Primitives = function() {
        var nil = [];

        var add = f(function(_) {
            if(arity(_) === 0) { return 0; }
            if(arity(_) === 1) { return _[0]; }
            return disassoc(_)[1].reduce(function(x, y) { return x + y; });
        }, Constants.ARITY_VARIADIC);

        var sub = f(function(_) {
            if(arity(_) === 0) {
                Errors.raise(Errors.ARITY);
                return Primitives.nil;
            }
            if(arity(_) === 1) { return -_[0]; }
            return disassoc(_)[1].reduce(function(x, y) { return x - y; });
        }, Constants.ARITY_VARIADIC);

        var mult = f(function(_) {
            if(arity(_) === 0) { return 1; }
            if(arity(_) === 1) { return _[0]; }
            return disassoc(_)[1].reduce(function(x, y) { return x * y; });
        }, Constants.ARITY_VARIADIC);

        var div = f(function(_) {
            if(arity(_) === 0) {
                Errors.raise(Errors.ARITY);
                return Primitives.nil;
            }
            if(arity(_) === 1) { return 1 / _[0]; }
            return disassoc(_)[1].reduce(function(x, y) { return x / y; });
        }, Constants.ARITY_VARIADIC);

        var quote = f(function(_) {
            return _[0];
        }, 1);

        var atom = f(function(_) {
            return(
                pred(_[0]        === Primitives.t   ||
                     _[0]        === Primitives.nil ||
                     typeof _[0] === 'number'       ||
                     typeof _[0] === 'string')
            );
        }, 1);

        var eq = f(function(_) {
            return pred(atom(_[0]) && atom(_[1]) && _[0] === _[1]);
        }, 2);

        var car = f(function(_) {
            return _[0][0];
        }, 1);

        var cdr = f(function(_) {
            return _[0].slice(1, _[0].length);
        }, 1);

        var cons = f(function(_) {
            return [_[0], _[1]];
        }, 2);

        var cond = f(function(_) {
            var i,
                condCase,
                envs;

            if(arity(_) > 1) {
                envs = _[0];
                for(i = 1; i < arity(_); i++) {
                    condCase = _[i];

                    if(typeof condCase !== 'object' || condCase.length !== 2) {
                        Errors.raise(Errors.EXPRESSION);
                        break;
                    }
                    if(Evaluator.eval(condCase[0], envs) !== Primitives.nil) {
                        return Evaluator.eval(condCase[1], envs);
                    }
                }
            }
            return Primitives.nil;
        }, Constants.ARITY_VARIADIC);

        var lambda = f(function(_) {
            if(arity(_) > 2) {
                return function(envs, argKeys) {
                    var exps;

                    exps = disassoc(_)[1].slice(2);
                    return function() {
                        var argValues;

                        argValues = disassoc(arguments)[1];
                        if(argKeys.length !== argValues.length) {
                            Errors.raise(Errors.ARITY);
                            return Primitives.nil;
                        }
                        return Evaluator.evalSeq(exps,
                                                 Environments.bind(argKeys,
                                                                   argValues,
                                                                   envs));
                    };
                }(_[0], _[1]);
            }

            Errors.raise(Errors.ARITY);
            return Primitives.nil;
        }, Constants.ARITY_VARIADIC);

        var define = f(function(_) {
            return Environments.define(_[1], Evaluator.eval(_[2], _[0]), _[0]);
        }, 3);

        var set = f(function(_) {
            return Environments.set(_[1], Evaluator.eval(_[2], _[0]), _[0]);
        }, 3);

        var print = f(function(_) {
            console.log(_[0]);
            return _[0];
        }, 1);

        var memdump = f(function(_) {
            console.log(_[0]);
            return nil;
        }, 1);

        return {
            '+': add,
            '-': sub,
            '*': mult,
            '/': div,

            't': true,
            'nil': nil,
            '()': nil,
            'quote': quote,
            'atom': atom,
            'eq': eq,
            'car': car,
            'cdr': cdr,
            'cons': cons,
            'cond': cond,
            'lambda': lambda,

            'define': define,
            'set': set,

            'print': print,
            'memdump': memdump
        };
    };

    Expressions = function() {
        var parse = function(str) {
            var atomize = function(token) {
                if(!isNaN(Number(token))) {
                    return Number(token);
                }
                return String(token);
            };

            var tokenize = function(s) {
                return(s .
                       replace(/\(/g, ' ( ') .
                       replace(/\)/g, ' ) ') .
                       split(' ') .
                       filter(function(e) { return e !== ''; }));
            };

            var structure = function(tokens) {
                var token,
                    level;

                if(tokens.length === 0) {
                    Errors.raise(Errors.EXPRESSION);
                    return Primitives.nil;
                }

                token = tokens.shift();
                if(token === '(') {
                    level = [];
                    while(tokens[0] !== ')') {
                        level.push(structure(tokens));
                    }
                    tokens.shift();
                    return level;
                }
                if(token === ')') {
                    Errors.raise(Errors.PARENTHESIS);
                    return Primitives.nil;
                }

                return atomize(token);
            };

            var structures = function(tokens) {
                var structures;

                structures = [];
                while(tokens.length > 0) {
                    structures.push(structure(tokens));
                }

                return structures;
            };

            var clean = function(str) {
                return str.replace(/(\r\n|\n|\r)/gm, ' ');
            };

            return structures(tokenize(clean(str)));
        };

        var format = function(exp) {
            if(exp === Primitives.nil) { return 'nil'; }
            if(exp === Primitives.t)   { return 'T'; }

            switch(typeof exp) {
                case 'number':   return exp;
                case 'function': return '<Function>';
                case 'string':   return exp;
                default: break;
            }

            return(JSON.stringify(exp) .
                   replace(/\[/g, '(') .
                   replace(/\]/g, ')') .
                   replace(/\,/g, ' '));
        };

        return {
            parse: parse,
            format: format
        };
    };

    Evaluator = function() {
        var evList = function(list, envs) {
            if(list.length === 0) {
                return Primitives.nil;
            }
            return list.map(function(e) {
                return ev(e, envs);
            });
        };

        var evSeq = function(list, envs) {
            return evList(list, envs).pop();
        };

        var ev = function(exp, envs) {
            var proc,
                args;

            var resolveSymbol = function(key) {
                var value;

                if(key === 'nil') {
                    return Primitives.nil;
                }
                value = Environments.lookup(key, envs);
                if(!bool(value)) {
                    Errors.raise(Errors.SYMBOL);
                }
                return value;
            };

            if(bool(Primitives.atom(exp))) {
                if(typeof exp === 'number') { return exp; }
                if(typeof exp === 'string') {
                    if(exp[0] === '"' && exp[exp.length - 1] === '"') {
                        return exp;
                    }
                    return resolveSymbol(exp);
                }
            }
            if(exp.length === 0) { return Primitives.nil; }
            proc = Primitives.car(exp);
            args = Primitives.cdr(exp);
            switch(proc) {
                case 'quote':
                    return apply(ev(proc, envs), args);
                case 'memdump':
                    return apply(ev(proc, envs), [envs]);
                case 'lambda': case 'cond': case 'define': case 'set':
                    return apply(ev(proc, envs), [envs].concat(args));
                default:
                    return apply(ev(proc, envs), evList(args, envs));
            }
        };

        var apply = function(proc, args) {
            if(typeof proc === 'function') {
                return proc.apply(null, args);
            }
            Errors.raise(Errors.FUNCALL);
            return Primitives.nil;
        };

        return {
            eval: ev,
            evalSeq: evSeq
        };
    };

    Reader = function() {
        var read = function(exp) {
            try {
                return Expressions.format(Evaluator.evalSeq(Expressions.parse(exp),
                                                            Globals.Environments));
            } catch(e) {
                console.log(e);
                return Expressions.format(Primitives.nil);
            }
        };

        return {
            read: read
        };
    };

    //---//

    var assoc = function(keys, values) {
        var dict = {};

        keys.map(function(k, i) {
            dict[k] = values[i];
        });
        return dict;
    };

    var disassoc = function(object) {
        var keys,
            values,
            key;

        keys = []; values = [];
        for(key in object) {
            if(object.hasOwnProperty(key)) {
                keys.push(key); values.push(object[key]);
            }
        }
        return [keys, values];
    };

    var arity = function(args) {
        return Object.keys(args).length;
    };

    var f = function(body, a) {
        return function() {
            if(a !== Constants.ARITY_VARIADIC && a !== arity(arguments)) {
                Errors.raise(Errors.ARITY);
                return Primitives.nil;
            }

            return body(arguments);
        };
    };

    var pred = function(b) {
        return(b ? Primitives.t : Primitives.nil);
    };

    var bool = function(p) {
        return(p === Primitives.nil ? false : true);
    };

    //---//

    Environments = new Environments();
    Primitives = new Primitives();
    Expressions = new Expressions();
    Evaluator = new Evaluator();
    Reader = new Reader();

    Globals.Environments.push(Primitives);

    return {
        read: Reader.read
    };
}();

module.exports = {
    read: Satori.read
};
