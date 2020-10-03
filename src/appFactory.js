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

const _ = require('lodash');
const path = require('path');
const express = require('express');

const HTTP_STATUS_CODES = require('http').STATUS_CODES;

const auth = require('./server-modules/auth');
const passwords = require('./server-modules/passwords');
const appFactoryModule = require('./server-modules/defaultAppFactory');
const { connectToDb } = require('./server-modules/dbconn');

const { createAppContext } = require('./appcontext');

const API_MODULE_NAME = 'API_MODULE';

function preprocessAppSetup(appSetup) {
  if (appSetup.api) {
    appSetup.modules = appSetup.modules || {};

    let apiModule = {};

    for (const apiKey in appSetup.api) {
      if (appSetup.api.hasOwnProperty(apiKey)) {
        const controller = appSetup.api[apiKey];

        let apiName = apiKey.replace(/[^a-zA-Z0-9]+/g, '_');
        apiModule[`API ${apiName}`] = { [apiKey]: controller };
      }
    }

    if (API_MODULE_NAME in appSetup.modules) throw new Error(`The module "${API_MODULE_NAME}" already exists!`);
    appSetup.modules[API_MODULE_NAME] = apiModule;

    delete appSetup.api;
  }

  return appSetup;
}

async function createApp(appSetup = {}) {
  appSetup = preprocessAppSetup(appSetup);

  const config = initConfig(appSetup);

  const builtInModules = { auth, passwords, appFactoryModule };
  const modules = Object.assign(builtInModules, appSetup.modules);

  const logger = appSetup.logger || console;
  const router = appSetup.router || express.Router();

  const moduleNames = getModuleNames(appSetup, config);

  const components = Object.assign({
    _, config, router,
    logger__default: logger,
    HTTP_STATUS_CODES,
  }, appSetup.components);

  if (!components.database) {
    Object.assign(components, await connectToDb(config));
  }

  const context = createAppContext({
    modules,
    moduleNames,
    components,
    config,
    require,
  });

  if (config.DEBUG_MODE) {
    logger.debug('Dependency injection context', context.info());
  }

  const appFactory = context.getDependency('appFactory');
  const app = appFactory.createApp();

  return { app, config };
}

function getModuleNames(appSetup, config) {
  const { dir, moduleNames } = appSetup;

  if (!dir || !moduleNames) return moduleNames;

  let testMode = config.NODE_ENV === 'test';

  return {
    src: (moduleNames.src || []).map(name => path.join(dir, name)),
    test: testMode ? (moduleNames.test || []).map(name => path.join(dir, name)) : [],
  };
}

function initConfig(opts) {
  const defaultConfig = {
    PORT: process.env.PORT || 3000,
    DEBUG_MODE: process.env.FOR_IO_DEBUG === 'true',
    NODE_ENV: process.env.NODE_ENV || 'production',
    DB_TYPE: 'none', // typically configured by the app
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
    USE_MOCKS: false, // typically overwritten by tests
  };

  if (opts.config) Object.assign(defaultConfig, opts.config);

  return defaultConfig;
}

module.exports = createApp;