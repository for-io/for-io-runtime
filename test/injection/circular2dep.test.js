const container = require('../../src/container');

test('circular dependency of 2 components across modules', () => {
    const modules = {
        mod1: { _$COMPONENTS_: { foo: (bar) => bar + 'x' } },
        mod2: { _$COMPONENTS_: { bar: (foo) => foo + 'y' } },
    };

    verifyDeps({ modules });
});

test('circular dependency of 2 components inside module', () => {
    const modules = {
        mod1: {
            _$COMPONENTS_: {
                foo: (bar) => bar + 'x',
                bar: (foo) => foo + 'y',
            }
        },
    };

    verifyDeps({ modules });
});

function verifyDeps(opts) {
    const context = new container.DependencyInjection(opts);

    expect(() => context.getDependency('foo')).toThrow('Detected circular dependency: foo -> bar -> foo');
    expect(() => context.getDependency('bar')).toThrow('Detected circular dependency: bar -> foo -> bar');
}
