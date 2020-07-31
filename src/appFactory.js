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
const express = require('express');

const utils = require('./utils');
const middleware = require('./middleware');
const HTTP_STATUS_CODES = require('http').STATUS_CODES;

const auth = require('./server-modules/auth');
const passwords = require('./server-modules/passwords');
const { connectToDb } = require('./server-modules/dbconn');

const { createExpressApp } = require('./app');
const { createAppContext } = require('./appcontext');

async function createApp(appSetup = {}) {
  const config = initConfig(appSetup);

  const builtInModules = { auth, passwords };
  const modules = Object.assign(builtInModules, appSetup.modules);

  const logger = appSetup.logger || console;
  const router = appSetup.router || express.Router();

  const moduleNames = getModuleNames(appSetup);

  const components = Object.assign({
    _, config, router, middleware,
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
    require,
    useMocks: config.useMocks,
  });

  if (config.NODE_ENV === 'dev') {
    logger.info('Dependency injection context', context.info());
  }

  return createExpressApp({ router, config });
}

function getModuleNames(appSetup) {
  const dir = appSetup.dir;
  return appSetup.moduleNames ? appSetup.moduleNames.map(name => dir ? path.join(dir, name) : name) : undefined;
}

function initConfig(opts) {
  const config = {
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  if (opts.config) Object.assign(config, opts.config);

  return config;
}

module.exports = createApp;