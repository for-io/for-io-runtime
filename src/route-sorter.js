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

function sortRoutes(routes) {
    const VERB_ORDER = { GET: 1, POST: 2, PUT: 3, PATCH: 4, DELETE: 5, ANY: 6 };

    function paramCount(path) {
        return (path.match(/\:/g) || []).length;
    }

    function compare(a, b) {
        if (a.verb !== b.verb) {
            return VERB_ORDER[a.verb] - VERB_ORDER[b.verb];
        }

        let pc1 = paramCount(a.path);
        let pc2 = paramCount(b.path);

        if (pc1 !== pc2) {
            return pc1 - pc2;
        }

        return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
    }

    routes.sort(compare);
}

module.exports = { sortRoutes };