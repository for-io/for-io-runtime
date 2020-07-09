const loader = require('../../src/loader');

test('circular dependency of 3 components across modules', () => {
    const modules = {
        mod1: { _$COMPONENTS_: { foo: (baz) => baz + 'x' } },
        mod2: { _$COMPONENTS_: { bar: (foo) => foo + 'y' } },
        mod3: { _$COMPONENTS_: { baz: (bar) => bar + 'z' } },
    };

    verifyDeps({ modules });
});

test('circular dependency of 3 components inside module', () => {
    const modules = {
        mod1: {
            _$COMPONENTS_: {
                foo: (baz) => baz + 'x',
                bar: (foo) => foo + 'y',
                baz: (bar) => bar + 'z',
            }
        },
    };

    verifyDeps({ modules });
});

function verifyDeps(opts) {
    const context = new loader.DependencyInjection(opts);

    expect(() => context.getDependency('foo')).toThrow('Detected circular dependency: foo -> baz -> bar -> foo');
    expect(() => context.getDependency('bar')).toThrow('Detected circular dependency: bar -> foo -> baz -> bar');
    expect(() => context.getDependency('baz')).toThrow('Detected circular dependency: baz -> bar -> foo -> baz');
}