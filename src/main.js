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
const path = require('path');
const mongo = require('mongodb');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HTTP_STATUS_CODES = require('http').STATUS_CODES;

const { newApp } = require('./app');

const { DependencyTracker } = require('./dep-tracker');
const invoker = require('./invoker');
const routing = require('./routing');
const container = require('./container');
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

  const dir = opts.dir;
  const logger = opts.logger || console;
  const router = opts.router || express.Router();
  const database = opts.database || await connectToDb(config);
  const routes = opts.routes || [];
  const api = opts.api || {};

  if (opts.moduleNames) {
    appendModuleNames(dir, opts.moduleNames);
  }

  if (opts.types) {
    typeRegistry.addTypes(opts.types);
  }

  const components = {
    _, invoker, types, mongo, database,
    routes, router, api, middleware,
    mail, bcrypt, jwt, config,
    DependencyTracker,
    logger__default: logger,
    HTTP_STATUS_CODES,
  };

  const context = new container.DependencyInjection({
    components,
    modules,
    moduleNames,
    useMocks: config.useMocks,
  });

  // set up authentication
  context.execute(auth.init);

  // set up routing
  context.execute(routing);

  if (config.NODE_ENV === 'dev') {
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

  return config;
}

function appendModuleNames(dir, names) {
  for (const name of names) {
    moduleNames.push(dir ? path.join(dir, name) : name);
  }
}

async function connectToDb(config) {
  const mongoUrl = config.MONGO_URL || process.env.MONGO_URL || 'mongodb://localhost:27017/test';
  const mongoClient = new mongo.MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  await mongoClient.connect();
  return mongoClient.db();
}

module.exports = { createApp };