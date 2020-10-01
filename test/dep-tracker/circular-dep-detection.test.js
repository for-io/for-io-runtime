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

const { DependencyTracker } = require('../../src/dep-tracker');

test('should detect circular dependencies (1)', () => {
    const dep = new DependencyTracker();

    dep.enter('a');
    dep.enter('b');

    expect(() => dep.enter('b')).toThrow("Detected circular dependency: b -> b");
});

test('should detect circular dependencies (2)', () => {
    const dep = new DependencyTracker();

    dep.enter('a');
    dep.enter('b');
    dep.enter('c');

    expect(() => dep.enter('a')).toThrow("Detected circular dependency: a -> b -> c -> a");
});

test('should detect circular dependencies (3)', () => {
    const dep = new DependencyTracker();

    dep.enter('a');
    dep.enter('b');
    dep.enter('c');

    expect(() => dep.enter('a')).toThrow("Detected circular dependency: a -> b -> c -> a");
});

test('should detect circular dependencies (4)', () => {
    const dep = new DependencyTracker();

    dep.enter('x');

    expect(() => dep.enter('x')).toThrow("Detected circular dependency: x -> x");
});
