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

import { AppSetup } from "..";

function exceptionHandlerFactory(logger: any, HTTP_STATUS_CODES: any) {

    return async (res: any, exception: any) => {
        let status;

        if (typeof exception === 'number') {
            status = exception;
        } else if (typeof exception === 'object' && typeof exception.statusCode === 'number') {
            status = exception.statusCode;
        } else {
            status = 500;
        }

        if (!HTTP_STATUS_CODES[status + '']) {
            logger.error('Invalid status code:', status);
            status = 500;
        }

        let body = exception.body || { status: HTTP_STATUS_CODES[status + ''] };

        if (status >= 500) {
            logger.error('Caught exception:', exception);
        }

        res.status(status);

        if (typeof body === 'string') {
            res.send(body);
        } else {
            res.json(body);
        }
    };

}

export function registerExceptionHandler(app: AppSetup) {
    app.addServiceFactory({ name: 'exceptionHandler', asDefault: true }, exceptionHandlerFactory);
}