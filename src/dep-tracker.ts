/*!
 * for-io-runtime
 *
 * Copyright (c) 2019-2021 Nikolche Mihajlovski and EPFL
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

export class DependencyTracker {
    _chain: any;

    constructor() {
        this._chain = [];
    }

    getChain(startingPos = 0) {
        return this._chain.slice(startingPos).join(' -> ');
    }

    enter(name: any) {
        let pos = this._chain.indexOf(name);

        if (pos >= 0) {
            let chain = this.getChain(pos) + ' -> ' + name;
            let fullChain = this.getChain() + ' -> ' + name;
            let e = new Error(`Detected circular dependency: ${chain}`);
            (e as any).details = { 'Full chain': fullChain };
            throw e;
        }

        this._chain.push(name);
    }

    leave(name: any) {
        let len = this._chain.length;

        if (len > 0 && this._chain[len - 1] === name) {
            this._chain.length = len - 1;
        } else {
            throw new Error(`The last dependency is not '${name}'`);
        }
    }
}
