/*!
 * for.io
 *
 * Copyright (c) 2019-2020 Nikolche Mihajlovski and EPFL
 * 
 * MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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