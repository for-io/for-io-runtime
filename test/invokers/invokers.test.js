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

const { invoke, invokeAsync } = require("../../src/invokers");

const args = { x: 3, y: 4, z: 5 };

describe('invokers', () => {

    it('should invoke fn with params as list', () => {
        let ret = invoke((x, y) => x + y, (paramName) => args[paramName]);

        expect(ret).toEqual(7);
    });

    it('should invoke fn with params as obj', () => {
        let ret = invoke(({ y, z }) => y + z, (paramName) => args[paramName]);

        expect(ret).toEqual(9);
    });


    it('should invoke fn with params as list with async arg provider', async () => {
        let ret = await invokeAsync(async (x, y) => x + y, async (paramName) => await args[paramName]);

        expect(ret).toEqual(7);
    });

    it('should invoke fn with params as obj with async arg provider', async () => {
        let ret = await invokeAsync(async ({ y, z }) => y + z, async (paramName) => await args[paramName]);

        expect(ret).toEqual(9);
    });

});
