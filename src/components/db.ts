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

import { AppSetup } from "..";

const moduleName = 'built-in:components/db.ts';

function dbFactory(config: any, database: any, mongodb__getter: any, mongoCollectionExtensions__optional__getter: any) {

    switch (config.DB_TYPE) {
        case 'mongodb':
            return createMongoProxy(mongodb__getter(), mongoCollectionExtensions__optional__getter());

        default:
            return null;
    }

    function createMongoProxy(mongodb: any, mongoCollectionExtensions: any) {
        const dbProxyTarget = {
            ObjectId: mongodb.ObjectId.bind(mongodb),
        };

        const collFactory = (name: string) => database.collection(name);

        return createDbProxy(dbProxyTarget, collFactory, mongoCollectionExtensions);
    }

    function createDbProxy(dbTarget: any, tableFactory: any, tableExtensions: any) {

        function extendTable(table: any) {
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
            get: function (target: any, propName: string, receiver: any) {

                // if not a symbol and not an existing property and not internal
                if (isCollProperty(target, propName)) {
                    target[propName] = extendTable(tableFactory(propName));
                }

                return target[propName];
            }
        });
    }

};

function isCollProperty(target: any, propName: string) {
    return typeof propName === 'string'
        && !target.hasOwnProperty(propName)
        && !propName.startsWith('__')
        && propName !== 'then'
        && propName !== 'toJSON';
}

function existsFactory(responses: any) {

    return async function exists(this: any, filter: any) {
        let count = await this.countDocuments(filter, { limit: 1 });
        return count === 1;
    };

}

function verifyIdFactory(responses: any) {

    return async function verifyId(this: any, id: any) {
        if (!(await this.exists({ _id: id }))) throw responses.NOT_FOUND;
    };

}

function getOneFactory(responses: any) {

    return async function getOne(this: any, filter: any) {
        let doc = await this.findOne(filter);

        if (!doc) throw responses.NOT_FOUND;

        return doc;
    };

}

function getByIdFactory(responses: any) {

    return async function getById(this: any, id: any) {
        return await this.getOne({ _id: id });
    };

}

function deleteByIdFactory(responses: any) {

    return async function deleteById(this: any, id: any, condition: any) {
        if (condition) {
            await this.verifyId(id);

            let filter = Object.assign({ _id: id }, condition);

            let result = await this.deleteOne(filter);

            if (result.deletedCount === 0) throw responses.FORBIDDEN;

        } else {
            let result = await this.deleteOne({ _id: id });

            if (result.deletedCount === 0) throw responses.NOT_FOUND;
        }
    };

}


function updateByIdFactory(responses: any) {

    return async function updateById(this: any, id: any, modification: any, condition: any) {
        if (condition) {
            await this.verifyId(id);

            let filter = Object.assign({ _id: id }, condition);

            let result = await this.updateOne(filter, modification);

            if (result.matchedCount === 0) throw responses.FORBIDDEN;

        } else {
            let result = await this.updateOne({ _id: id }, modification);

            if (result.matchedCount === 0) throw responses.NOT_FOUND;
        }
    };

}

function addRefFactory(responses: any) {

    return async function addRef(this: any, docId: any, relName: string, refId: any) {
        let result = await this.updateOne({ _id: docId }, {
            $push: {
                [relName]: refId
            },
        });

        if (result.matchedCount === 0) throw responses.NOT_FOUND;
    };

}

function removeRefFactory(responses: any) {

    return async function removeRef(this: any, docId: any, relName: string, refId: any) {
        let result = await this.updateOne({ _id: docId }, {
            $pull: {
                [relName]: refId
            },
        });

        if (result.matchedCount === 0) throw responses.NOT_FOUND;
    };

}

export function registerDb(app: AppSetup) {
    app.addServiceFactory({ name: 'db', asDefault: true, moduleName }, dbFactory);

    const target = 'mongoCollectionExtensions';
    app.addMemberFactory(`${target}.exists`, existsFactory);
    app.addMemberFactory(`${target}.verifyId`, verifyIdFactory);
    app.addMemberFactory(`${target}.getOne`, getOneFactory);
    app.addMemberFactory(`${target}.getById`, getByIdFactory);
    app.addMemberFactory(`${target}.deleteById`, deleteByIdFactory);
    app.addMemberFactory(`${target}.updateById`, updateByIdFactory);
    app.addMemberFactory(`${target}.addRef`, addRefFactory);
    app.addMemberFactory(`${target}.removeRef`, removeRefFactory);
}