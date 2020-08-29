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

exports['SINGLETON db__default'] = (config, database, mongodb__getter, mongoCollectionExtensions__optional__getter) => {

    switch (config.DB_TYPE) {
        case 'mongodb':
            return createMongoProxy(mongodb__getter(), mongoCollectionExtensions__optional__getter());

        default:
            return null;
    }

    function createMongoProxy(mongodb, mongoCollectionExtensions) {
        const dbProxyTarget = {
            ObjectId: mongodb.ObjectId.bind(mongodb),
        };

        const collFactory = name => database.collection(name);

        return createDbProxy(dbProxyTarget, collFactory, mongoCollectionExtensions);
    }

    function createDbProxy(dbTarget, tableFactory, tableExtensions) {

        function extendTable(table) {
            if (tableExtensions) {
                for (const name in tableExtensions) {
                    if (tableExtensions.hasOwnProperty(name)) {
                        const fn = tableExtensions[name];
                        table[name] = fn.bind(table);
                    }
                }
            }

            return table;
        }

        return new Proxy(dbTarget, {
            get: function (target, propName, receiver) {

                if (!target.hasOwnProperty(propName) && !propName.startsWith('__')) {
                    target[propName] = extendTable(tableFactory(propName));
                }

                return target[propName];
            }
        });
    }

};

exports['MEMBER mongoCollectionExtensions.exists'] = () => {

    return async function exists(filter) {
        let count = await this.countDocuments(filter, { limit: 1 });
        return count === 1;
    }

};
