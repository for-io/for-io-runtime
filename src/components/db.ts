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

import { Collection, FilterQuery, UpdateQuery } from "mongodb";
import { AppSetup } from "..";

const moduleName = 'built-in:components/db.ts';

type MongoDocId = any;

type BaseSchema = { [key: string]: any };

type MongoCollectionExtensions<TSchema extends BaseSchema> = {
    exists(query: FilterQuery<TSchema>): Promise<boolean>;
    verifyId(docId: MongoDocId): Promise<void>;
    getOne(query: FilterQuery<TSchema>): Promise<TSchema>;
    getById(docId: MongoDocId): Promise<TSchema>;
    updateById(docId: MongoDocId, modification: UpdateQuery<TSchema> | Partial<TSchema>): Promise<void>;
    updateByIdIf(docId: MongoDocId, condition: FilterQuery<TSchema>, modification: UpdateQuery<TSchema> | Partial<TSchema>): Promise<void>;
    deleteById(docId: MongoDocId): Promise<void>;
    deleteByIdIf(docId: MongoDocId, condition: FilterQuery<TSchema>): Promise<void>;
    addRef(docId: MongoDocId, relName: string, referencedId: MongoDocId): Promise<void>;
    removeRef(docId: MongoDocId, relName: string, referencedId: MongoDocId): Promise<void>;
};

export type ExtendedMongoCollection<TSchema extends BaseSchema> = Collection<TSchema> & MongoCollectionExtensions<TSchema>;

interface ApiResponses {
    NOT_FOUND: any,
    FORBIDDEN: any,
};

function createDbService(config: any, database: any, responses: ApiResponses, mongodb__getter: any) {

    switch (config.DB_TYPE) {
        case 'mongodb':
            return createMongoProxy(mongodb__getter(), responses);

        default:
            return null;
    }

    function createMongoProxy(mongodb: any, responses: ApiResponses) {
        const dbProxyTarget = {
            ObjectId: mongodb.ObjectId.bind(mongodb),
        };

        const collFactory = (name: string) => database.collection(name);

        return createDbProxy(dbProxyTarget, collFactory, getMongoCollectionExtensions(responses));
    }

    function createDbProxy(dbTarget: any, collFactory: any, collExtensions: any) {

        function extendColl(coll: any) {
            if (collExtensions) {
                for (const name in collExtensions) {
                    if (collExtensions.hasOwnProperty(name)) {
                        const fn = collExtensions[name];
                        coll[name] = fn.bind(coll);
                    }
                }
            }

            return coll;
        }

        return new Proxy(dbTarget, {
            get: function (target: any, propName: string, receiver: any) {

                // if not a symbol and not an existing property and not internal
                if (isCollProperty(target, propName)) {
                    target[propName] = extendColl(collFactory(propName));
                }

                return target[propName];
            }
        });
    }

};

function isCollProperty(target: any, propName: string) {
    return typeof propName === 'string'
        && !Object.prototype.hasOwnProperty.call(target, propName)
        && !propName.startsWith('__')
        && propName !== 'then'
        && propName !== 'toJSON';
}

function getMongoCollectionExtensions<TSchema extends BaseSchema>(responses: ApiResponses) {
    const collExtensions: MongoCollectionExtensions<TSchema> = {

        async exists(this: ExtendedMongoCollection<TSchema>, filter: FilterQuery<TSchema>): Promise<boolean> {
            let count = await this.countDocuments(filter, { limit: 1 });
            return count === 1;
        },

        async verifyId(this: ExtendedMongoCollection<TSchema>, docId: MongoDocId): Promise<void> {
            if (!(await this.exists({ _id: docId }))) throw responses.NOT_FOUND;
        },

        async getOne(this: ExtendedMongoCollection<TSchema>, filter: FilterQuery<TSchema>): Promise<TSchema> {
            let doc = await this.findOne(filter);

            if (!doc) throw responses.NOT_FOUND;

            return doc;
        },

        async getById(this: ExtendedMongoCollection<TSchema>, docId: MongoDocId) {
            return await this.getOne({ _id: docId });
        },

        async updateById(this: ExtendedMongoCollection<TSchema>, docId: MongoDocId,
            modification: UpdateQuery<TSchema> | Partial<TSchema>): Promise<void> {

            let result = await this.updateOne({ _id: docId }, modification);

            if (result.matchedCount === 0) throw responses.NOT_FOUND;
        },

        async updateByIdIf(this: ExtendedMongoCollection<TSchema>, docId: MongoDocId,
            condition: FilterQuery<TSchema>, modification: UpdateQuery<TSchema> | Partial<TSchema>): Promise<void> {

            await this.verifyId(docId);

            let filter = Object.assign({ _id: docId }, condition);

            let result = await this.updateOne(filter, modification);

            if (result.matchedCount === 0) throw responses.FORBIDDEN;
        },

        async deleteById(this: ExtendedMongoCollection<TSchema>, docId: MongoDocId): Promise<void> {
            let result = await this.deleteOne({ _id: docId });

            if (result.deletedCount === 0) throw responses.NOT_FOUND;
        },

        async deleteByIdIf(this: ExtendedMongoCollection<TSchema>, docId: MongoDocId, condition: FilterQuery<TSchema>): Promise<void> {
            await this.verifyId(docId);

            let filter = Object.assign({ _id: docId }, condition);

            let result = await this.deleteOne(filter);

            if (result.deletedCount === 0) throw responses.FORBIDDEN;
        },

        async addRef(this: ExtendedMongoCollection<TSchema>, docId: MongoDocId, relName: string, referencedId: MongoDocId): Promise<void> {
            let result = await this.updateOne({ _id: docId }, {
                $push: {
                    [relName]: referencedId
                },
            } as any);

            if (result.matchedCount === 0) throw responses.NOT_FOUND;
        },

        async removeRef(this: ExtendedMongoCollection<TSchema>, docId: MongoDocId, relName: string, referencedId: MongoDocId): Promise<void> {
            let result = await this.updateOne({ _id: docId }, {
                $pull: {
                    [relName]: referencedId
                },
            } as any);

            if (result.matchedCount === 0) throw responses.NOT_FOUND;
        },

    };

    return collExtensions;
}

export function registerDb(app: AppSetup) {
    app.addServiceFactory({ name: 'db', asDefault: true, moduleName }, createDbService);
}