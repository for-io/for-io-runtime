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

import express from 'express';
import { STATUS_CODES as HTTP_STATUS_CODES } from 'http';
import _ from 'lodash';
import path from 'path';
import { createAppContext } from './appcontext';
import { authFactory, authMiddlewareFactoryService } from "./server-modules/auth";
import { connectToDb } from './server-modules/dbconn';
import { expressAppFactory } from "./server-modules/defaultAppFactory";
import { passwordsService } from "./server-modules/passwords";

export async function appFactory(appSetup: any = {}) {
  if (appSetup.api) {
    throw new Error('The appSetup.api property is not supported anymore!');
  }

  const logger = appSetup.logger || console;
  const config = initConfig(appSetup, logger);
  const modules = appSetup.modules;
  const router = appSetup.router || express.Router();
  const moduleNames = getModuleNames(appSetup, config);

  const components = Object.assign({
    _,
    config,
    router,
    logger__default: logger,
    HTTP_STATUS_CODES,
    passwords__default: passwordsService,
  }, appSetup.components);

  const componentFactories = {
    expressApp__default: expressAppFactory,
    authMiddlewareFactory__default: () => authMiddlewareFactoryService,
    auth__default: authFactory,
  };

  if (!components.database) {
    Object.assign(components, await connectToDb(config));
  }

  const context = createAppContext({
    modules,
    moduleNames,
    components,
    componentFactories,
    config,
    require,
  });

  if (config.DEBUG_MODE) {
    logger.debug('Dependency injection context:');

    context.iterateSegments((segment: any, c: any) => {
      let moduleName = path.basename(c.moduleName);
      let deps = c.dependencies.length > 0 ? `, DEPS [${c.dependencies.join(', ')}]` : '';
      logger.debug(` - ${segment} ${c.name} : ${typeof c.value}, MODULE ${moduleName}` + deps)
    });
  }

  const app = context.getDependency('expressApp');

  return { app, config };
}

function getModuleNames(appSetup: any, config: any) {
  const { dir, moduleNames } = appSetup;

  if (!dir || !moduleNames) return moduleNames;

  let testMode = config.NODE_ENV === 'test';

  return {
    src: (moduleNames.src || []).map((name: any) => path.join(dir, name)),
    test: testMode ? (moduleNames.test || []).map((name: any) => path.join(dir, name)) : [],
  };
}

function initConfig(opts: any, logger: any) {
  const defaultConfig = {
    PORT: process.env.PORT || 3000,
    DEBUG_MODE: process.env.FOR_IO_DEBUG === 'true',
    NODE_ENV: process.env.NODE_ENV || 'production',
    JWT_SECRET: process.env.JWT_SECRET,
    DB_TYPE: 'none', // typically configured by the app
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
    USE_MOCKS: false, // typically overwritten by tests
  };

  if (opts.config) Object.assign(defaultConfig, opts.config);

  if (!defaultConfig.JWT_SECRET) {
    defaultConfig.JWT_SECRET = generateRandomJWTSecret();
    logger.warn('JWT_SECRET was not specified. Generated a random secret. This should be fixed in production.');
  }

  return defaultConfig;
}

function generateRandomJWTSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
}
