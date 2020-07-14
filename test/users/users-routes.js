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

exports._$API_ = {

    updateUserProfile: {
        route: "PATCH /users/:id",
        verb: "PATCH",
        path: "/users/:id",
        title: "Update user profile",
        description: "",
        params: {
            id: "string"
        },
        query: {},
        body: {
            firstName: "string",
            lastName: "string"
        },
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404, 422],
        middleware: ["authenticate"],
        tags: ["users"],
        typeNames: {
            params: "UpdateUserProfileParams",
            body: "UpdateUserProfileBody"
        },
        model: "User:update"
    },

    listUsers: {
        route: "GET /users",
        verb: "GET",
        path: "/users",
        title: "List users",
        description: "",
        params: {},
        query: {},
        body: {},
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403],
        middleware: ["authenticate"],
        tags: ["users"],
        typeNames: {},
        model: "User:list"
    },

    deleteUser: {
        route: "DELETE /users/:id",
        verb: "DELETE",
        path: "/users/:id",
        title: "Delete user",
        description: "",
        params: {
            id: "string"
        },
        query: {},
        body: {},
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404],
        middleware: ["authenticate"],
        tags: ["users"],
        typeNames: {
            params: "DeleteUserParams"
        },
        model: "User:remove"
    },

    login: {
        route: "POST /login",
        verb: "POST",
        path: "/login",
        title: "Login user",
        description: "",
        params: {},
        query: {},
        body: {
            username: "string",
            password: "password"
        },
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404, 500],
        middleware: [],
        tags: ["users"],
        typeNames: {
            body: "LoginBody"
        }
    },

    getUserProfile: {
        route: "GET /users/:id",
        verb: "GET",
        path: "/users/:id",
        title: "Get user profile",
        description: "",
        params: {
            id: "string"
        },
        query: {},
        body: {},
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404],
        middleware: ["authenticate"],
        tags: ["users"],
        typeNames: {
            params: "GetUserProfileParams"
        },
        model: "User:getProfile"
    },

    addUser: {
        route: "POST /users",
        verb: "POST",
        path: "/users",
        title: "Create user",
        description: "",
        params: {},
        query: {},
        body: {
            username: "string",
            password: "password",
            email: "email",
            firstName: "string",
            lastName: "string"
        },
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 422],
        middleware: [],
        tags: ["users"],
        typeNames: {
            body: "AddUserBody"
        },
        model: "User:add"
    }
};