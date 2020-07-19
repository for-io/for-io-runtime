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

const container = require('../../src/container');

test('circular dependency of 2 groups across modules', () => {
    const modules = {
        mod1: { $x: (y) => y },
        mod2: { $y: (x) => x },
    };

    verifyDeps({ modules }, 'mod1.$x -> y -> mod2.$y -> x -> mod1.$x');
});

test('circular dependency of 2 groups inside module', () => {
    const modules = {
        mod1: {
            $x: (y) => y,
            $y: (x) => x,
        },
    };

    verifyDeps({ modules }, 'mod1.$x -> y -> mod1.$y -> x -> mod1.$x');
});

function verifyDeps(opts, chain) {
    expect(() => new container.DependencyInjection(opts))
        .toThrow('Detected circular dependency: ' + chain);
}
