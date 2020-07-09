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

const _ = require('lodash');
const mongo = require('mongodb');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HTTP_STATUS_CODES = require('http').STATUS_CODES;

const { newApp } = require('./app');

const routing = require('./routing');
const loader = require('./loader');
const moduleNames = require('./modulenames');
const middleware = require('./middleware');
const auth = require('./services/auth');
const mail = require('./services/mail');

const typeRegistry = require('./type-registry');
const types = typeRegistry.getTypes();
typeRegistry.addTypes(require('./types-auth'));

async function createApp(opts = {}) {
  const config = initConfig(opts);

  const modules = opts.modules;
  const logger = opts.logger || console;
  const router = opts.router || express.Router();
  const db = opts.db || await connectToDb();
  const routes = opts.routes || [];
  const api = opts.api || {};

  if (opts.types) {
    typeRegistry.addTypes(opts.types);
  }

  const components = {
    _, types, mongo, db, routes, logger, router, api, middleware, mail, bcrypt, jwt, config, HTTP_STATUS_CODES,
  };

  const context = new loader.DependencyInjection({
    components,
    modules,
    moduleNames,
    useMocks: config.useMocks,
  });

  // set up authentication
  context.execute(auth.init);

  // set up routing
  context.execute(routing);

  if (config.DEV_MODE) {
    logger.info('Dependency injection context', context.info());
  }

  return newApp({ router, config });
}

function initConfig(opts) {
  const config = {
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  if (opts.config) Object.assign(config, opts.config);

  if (config.DEV_MODE === undefined) {
    config.DEV_MODE = config.NODE_ENV === 'dev'
  }

  return config;
}

async function connectToDb() {
  const MONGO_URL = 'mongodb://localhost:27017';
  const mongoClient = new mongo.MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  const conn = await mongoClient.connect();
  return conn.db('test');
}

module.exports = { createApp };