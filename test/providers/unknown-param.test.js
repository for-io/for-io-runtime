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

const { runTest } = require('api-diligence');
const { appFactory } = require('../../src/main');

const api = {
    $api: {
        hello: { verb: "GET", path: "/hello", run: (foo) => foo },
    },
};

const error = jest.fn(() => { });

const loggerMod = {
    $components: {
        logger: { error },
    },
};

function onDone() {
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('Caught exception:', new Error("Unknown parameter: 'foo'"));
}

const testSetup = { modules: { api, loggerMod }, onDone, appFactory, db: false, dir: __dirname };

runTest({
    name: 'unknown param',
    precondition: {},
    cases: [{
        name: 'should fail on unknown param "foo"',
        steps: [{
            request: 'GET /hello',
            500: { status: 'Internal Server Error' },
        }],
    }],
}, testSetup);