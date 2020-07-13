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

module.exports = {

    isValidName(name) {
        return /^[\w_$]+$/.test(name);
    },

    orElse(val, alternative) {
        return val !== undefined ? val : alternative;
    },

    isArray(x) {
        return Array.isArray(x);
    },

    isString(x) {
        return typeof x === 'string' || (x instanceof String);
    },

    isNumber(x) {
        return !isNaN(x - parseFloat(x));
    },

    isBoolean(x) {
        return typeof x === 'boolean' || (x instanceof Boolean);
    },

    isFunction(x) {
        let s = Object.prototype.toString.call(x);
        return s === '[object Function]' || s === '[object AsyncFunction]';
    },

    isObject(x) {
        return x !== null && (typeof x === 'object') && !Array.isArray(x);
    },

};
