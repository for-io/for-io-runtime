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

const { App } = require("../../../test-helpers");

App.addEndpoint('updateUserProfile', {
    verb: 'PATCH',
    path: '/users/:id',
    middleware: ['auth'],

    async controller(db, responses, _, id, body, userId) {
        // users can update only their own profile
        if (id !== userId) throw responses.FORBIDDEN;

        let modification = {
            $set: {
                firstName: body.firstName,
                lastName: body.lastName,
            },
        };

        let result = await db.users.updateOne({ _id: id }, modification);

        if (result.matchedCount === 0) throw responses.NOT_FOUND;

        return responses.OK;
    }
});
