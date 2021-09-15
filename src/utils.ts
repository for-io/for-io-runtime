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

export default {

    isValidName(name: any) {
        return /^[\w_$]+$/.test(name);
    },

    orElse(val: any, alternative: any) {
        return val !== undefined ? val : alternative;
    },

    isArray(x: any) {
        return Array.isArray(x);
    },

    isString(x: any) {
        return typeof x === 'string' || (x instanceof String);
    },

    isNumber(x: any) {
        return !isNaN(x - parseFloat(x));
    },

    isBoolean(x: any) {
        return typeof x === 'boolean' || (x instanceof Boolean);
    },

    isFunction(x: any) {
        if (typeof x === 'function') return true;

        let s = Object.prototype.toString.call(x);
        return s === '[object Function]' || s === '[object AsyncFunction]';
    },

    isObject(x: any) {
        return x !== null && (typeof x === 'object') && !Array.isArray(x);
    },

    must(cond: any, errMsg = 'Assertion failed!') {
        if (!cond) throw new Error(errMsg);
    },

    def(val: any, desc: any) {
        if (val === undefined) throw new Error(`Undefined "${desc}"!`);
    },

    extractRoute(s: any) {
        let parts = s.split(' ');

        this.must(parts.length === 2, 'Expected route to have 2 parts: verb and path (e.g. GET /foo), but found: ' + parts.length);

        return {
            verb: parts[0],
            path: parts[1],
        };
    },

};
