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

import utils from './utils';

const STRIP_COMMENTS_REGEX = /((\/\/.*$)|(\/\*[\S\s]*?\*\/))/mg;
const ARGUMENT_NAMES_REGEX = /([^\s,]+)/g;

export function getParamNames(func: any) {
    let fnStr = func.toString().replace(STRIP_COMMENTS_REGEX, '').trim();
    if (fnStr.startsWith('async ')) {
        fnStr = fnStr.substring(6);
    }

    let leftParPos = fnStr.indexOf('(');
    let rightParPos = fnStr.indexOf(')');
    let arrowPos = fnStr.indexOf('=>');

    let paramsStr;

    if (arrowPos < 0 || (leftParPos >= 0 && leftParPos < rightParPos && rightParPos < arrowPos)) {
        paramsStr = fnStr.slice(leftParPos + 1, rightParPos);

    } else {
        paramsStr = fnStr.slice(0, arrowPos);
    }

    paramsStr = paramsStr.trim();

    const paramNames = paramsStr.match(ARGUMENT_NAMES_REGEX) || [];

    for (const name of paramNames) {
        if (!utils.isValidName(name)) {
            throw new Error(`Invalid parameter names: '${paramsStr}' of function:\n${JSON.stringify(func)}`);
        }
    }

    return paramNames;
}

export function invoke(func: any, argProvider: any, thiz?: any) {
    if (!func) throw new Error('Invalid function: ' + func);
    if (!argProvider) throw new Error('Invalid arg provider: ' + argProvider);

    thiz = thiz || func;

    const paramNames = getParamNames(func);
    const args = paramNames.map(argProvider);

    return func.apply(thiz, args);
}

export async function invokeAsync(func: any, asyncArgProvider: any, thiz: any) {
    if (!func) throw new Error('Invalid function: ' + func);
    if (!asyncArgProvider) throw new Error('Invalid arg provider: ' + asyncArgProvider);

    thiz = thiz || func;

    const paramNames = getParamNames(func);
    const args = [];

    for (const paramName of paramNames) {
        args.push(await asyncArgProvider(paramName));
    }

    return await func.apply(thiz, args);
}
