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

const { runTest } = require('api-diligence');
const { appFactory } = require('../../src/appFactory');

const mod1 = {
    'API hello': {
        verb: "GET", path: "/hello", run: (foo) => foo,
    },
};

const mod2 = {
    'PROVIDER foo'() {
        return (bar) => bar + 'x';
    },

    'PROVIDER bar'() {
        return (foo) => foo + 'y';
    },
}

const error = jest.fn(() => { });

const mod3 = {
    'SINGLETON logger': { error },
};

function onDone() {
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('Caught exception:', new Error("Detected circular dependency: foo -> bar -> foo"));
}

const appSetup = { modules: { mod1, mod2, mod3 } };

runTest({
    name: 'circular provider dependencies',
    opts: { appSetup, appFactory, onDone },
    cases: [{
        name: 'should fail on circular provider dependencies',
        steps: [{
            request: 'GET /hello?name=spock',
            500: { status: 'Internal Server Error' },
        }],
    }],
});