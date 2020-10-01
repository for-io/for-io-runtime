/*!
 * for-io-runtime
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

test('should merge multiple segments', () => {
    verify({
        mod1: { 'MEMBER x.foo': 1 },
        mod2: { 'MEMBER x.bar': 2 },
        mod3: { 'MEMBER y.baz': 3 },
    });
});

function verify(modules) {
    const context1 = new container.DependencyInjection({ modules });

    expect(context1.getDependency('x')).toStrictEqual({ foo: 1, bar: 2 });
    expect(context1.getDependency('y')).toStrictEqual({ baz: 3 });
}