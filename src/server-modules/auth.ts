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

const jwt = require('jsonwebtoken');
const passport = require('passport');
const { ExtractJwt } = require('passport-jwt');
const JWTStrategy = require('passport-jwt').Strategy;

function _init(config: any) {
    passport.use('jwt', new JWTStrategy({

        secretOrKey: config.JWT_SECRET,

        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

    }, async (token: any, done: any) => {

        try {
            // pass the user data to the next middleware
            return done(null, token.user);
        } catch (error) {
            done(error);
        }

    }));
}

export function authFactory(config: any) {
    _init(config);

    return {
        signToken(payload: any) {
            return jwt.sign(payload, config.JWT_SECRET);
        }
    };
}

export const authMiddlewareFactoryService = {

    createMiddleware(route: any) {
        return passport.authenticate('jwt', { session: false });
    },

}
