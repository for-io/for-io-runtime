const container = require('../../src/container');

test('circular dependency of 2 groups across modules', () => {
    const modules = {
        mod1: { _$X_: (y) => y },
        mod2: { _$Y_: (x) => x },
    };

    verifyDeps({ modules });
});

test('circular dependency of 2 groups inside module', () => {
    const modules = {
        mod1: {
            _$X_: (y) => y,
            _$Y_: (x) => x,
        },
    };

    verifyDeps({ modules });
});

function verifyDeps(opts) {
    expect(() => new container.DependencyInjection(opts))
        .toThrow('Detected circular dependency: _$X_ -> y -> _$Y_ -> x -> _$X_');
}
