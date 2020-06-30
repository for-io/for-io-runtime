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
const fs = require('fs');

function listTestDirs(parentDir) {
    let basename = fs.readdirSync(parentDir);

    return basename
        .map(basename => path.join(parentDir, basename))
        .filter(isTestDir);
}

function isTestDir(dir) {
    let stat = fs.lstatSync(dir);
    return stat.isDirectory();
}

function loadTest(dir) {
    let files = fs.readdirSync(dir);

    let name = path.basename(dir);

    let test = {
        name,
        config: {},
        precondition: {},
        cases: [],
    };

    let casesByUser = {};

    function getCase(username) {
        casesByUser[username] = casesByUser[username] || { name: `as ${username}`, requests: [] };
        return casesByUser[username];
    }

    for (let i = 0; i < files.length; i++) {
        let basename = files[i];
        let filename = path.join(dir, basename);

        let stat = fs.lstatSync(filename);

        if (stat.isFile()) {

            if (basename === 'db-before.json') {
                test.precondition = loadJson(filename);

            } else if (basename.endsWith('.json')) {
                let m;

                if (m = basename.match(/^(\w+)-db-after\.json$/)) {
                    let username = m[1];
                    let testCase = getCase(username);
                    testCase.postcondition = loadJson(filename);

                } else if (m = basename.match(/^(\w+)-(request|response|postcondition)-(\d+)\.json$/)) {
                    let username = m[1];
                    let reqProp = m[2]; // 'request' or 'response' or 'postcondition'
                    let reqIndex = parseInt(m[3]) - 1; // turn into 0-based index

                    let testCase = getCase(username);
                    testCase.requests[reqIndex] = testCase.requests[reqIndex] || {};
                    testCase.requests[reqIndex][reqProp] = loadJson(filename);
                }
            }
        }
    }

    for (const username in casesByUser) {
        if (casesByUser.hasOwnProperty(username)) {
            test.cases.push(casesByUser[username]);
        }
    }

    return test;
}

function loadJson(filename) {
    return JSON.parse(fs.readFileSync(filename));
}

module.exports = { listTestDirs, loadTest };