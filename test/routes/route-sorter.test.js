const { sortRoutes } = require('../../src/route-sorter');

test('should sort routes by verb', () => {
    verifySortOrder([
        { ref: 1, verb: 'POST', path: '/x' },
        { ref: 2, verb: 'ANY', path: '/x' },
        { ref: 3, verb: 'GET', path: '/x' },
    ], [3, 1, 2]);
});

test('should sort routes by params in path', () => {
    verifySortOrder([
        { ref: 1, verb: 'GET', path: '/:x/:y' },
        { ref: 2, verb: 'GET', path: '/:x/foo' },
        { ref: 3, verb: 'GET', path: '/foo/:y' },
        { ref: 4, verb: 'GET', path: '/bar/baz' },
    ], [4, 2, 3, 1]);
});

test('should sort routes by path in lexical order', () => {
    verifySortOrder([
        { ref: 1, verb: 'GET', path: '/d' },
        { ref: 2, verb: 'GET', path: '/aaa' },
        { ref: 3, verb: 'GET', path: '/zz' },
        { ref: 4, verb: 'GET', path: '/z' },
    ], [2, 1, 4, 3]);
});

function verifySortOrder(routes, order) {
    sortRoutes(routes);

    let refs = routes.map(r => r.ref);

    expect(refs).toStrictEqual(order);
}