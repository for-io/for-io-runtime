const loader = require('../../src/loader');

test('dependency chain across modules', () => {
    const modules = {
        mod1: { _$COMPONENTS_: { foo: () => 'x' } },
        mod2: { _$COMPONENTS_: { bar: (foo) => foo + 'y' } },
        mod3: { _$COMPONENTS_: { baz: (bar) => bar + 'z' } },
    };

    verifyDeps({ modules });
});

test('dependency chain inside module', () => {
    const modules = {
        mod1: {
            _$COMPONENTS_: {
                foo: () => 'x',
                bar: (foo) => foo + 'y',
                baz: (bar) => bar + 'z',
            }
        },
    };

    verifyDeps({ modules });
});

function verifyDeps(opts) {
    const context = new loader.DependencyInjection(opts);

    expect(context.getDependency('baz')).toBe('xyz');
    expect(context.getDependency('bar')).toBe('xy');
    expect(context.getDependency('foo')).toBe('x');
}