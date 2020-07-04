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
const JOKER = '***';

function isFunction(x) {
    return typeof x === 'function'
        || Object.prototype.toString.call(x) === '[object AsyncFunction]'
        || Object.prototype.toString.call(x) === '[object Function]';
}

function unmask(m, val) {
    if (m === JOKER) {
        return val;
    }

    if (isFunction(m)) {
        let ret = m(val);
        return ret !== undefined ? ret : val;
    }

    if (isObject(m) && isObject(val)) {
        return unmaskObjDiff(m, val);
    }

    if (Array.isArray(m) && Array.isArray(val)) {
        return unmaskArrDiff(m, val);
    }

    return m;
}

function unmaskObjDiff(m, val) {
    let x = {};

    for (const k of Object.keys(m)) {
        if (val.hasOwnProperty(k)) {
            x[k] = unmask(m[k], val[k]);
        } else {
            x[k] = m[k];
        }
    }

    return x;
}

function unmaskArrDiff(m, val) {
    let x = [];

    let min = Math.min(m.length, val.length);

    for (let i = 0; i < min; i++) {
        x.push(unmask(m[i], val[i]));
    }

    return x;
}

function isObject(x) {
    return x !== null && (typeof x === 'object') && !Array.isArray(x);
}

module.exports = { unmask };