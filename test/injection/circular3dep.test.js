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

test('circular dependency of 3 components across modules', () => {
    const modules = {
        mod1: { $components: { foo: (baz) => baz + 'x' } },
        mod2: { $components: { bar: (foo) => foo + 'y' } },
        mod3: { $components: { baz: (bar) => bar + 'z' } },
    };

    verifyDeps({ modules });
});

test('circular dependency of 3 components inside module', () => {
    const modules = {
        mod1: {
            $components: {
                foo: (baz) => baz + 'x',
                bar: (foo) => foo + 'y',
                baz: (bar) => bar + 'z',
            }
        },
    };

    verifyDeps({ modules });
});

function verifyDeps(opts) {
    const context = new container.DependencyInjection(opts);

    expect(() => context.getDependency('foo')).toThrow('Detected circular dependency: foo -> baz -> bar -> foo');
    expect(() => context.getDependency('bar')).toThrow('Detected circular dependency: bar -> foo -> baz -> bar');
    expect(() => context.getDependency('baz')).toThrow('Detected circular dependency: baz -> bar -> foo -> baz');
}