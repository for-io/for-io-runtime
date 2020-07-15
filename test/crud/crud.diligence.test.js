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

const path = require('path');
const { runApiDiligence } = require('../../apidiligence');
const testSetup = require('./testSetup');

const tokens = {};
async function getAuthToken({ username, agent }) {
    if (!tokens[username]) {
        let resp = await agent.post('/login')
            .send({ username, password: username })
            .timeout(1000)
            .catch(err => {
                console.error(err);
                throw err;
            });

        if (resp.statusCode !== 200) throw new Error('Expected successful login!');

        tokens[username] = resp.body.token;
    }
    return tokens[username];
}

// run tests with mock auth
const setup1 = Object.assign({}, testSetup, { mockAuth: true });
runApiDiligence({
    testsRoot: path.join(__dirname, 'api-diligence'),
    test: { tags: ['mock-auth'], username: 'spock' },
    setup: setup1,
    config: { useMocks: true },
});

// run tests with real auth
const setup2 = Object.assign({}, testSetup, { getAuthToken });
runApiDiligence({
    testsRoot: path.join(__dirname, 'api-diligence'),
    test: { tags: ['real-auth'], username: 'spock' },
    setup: setup2,
    config: { useMocks: false },
});
