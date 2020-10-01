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

exports['SINGLETON appFactory__default'] = (config, router) => ({

  createApp() {
    const express = require('express');
    const app = express();

    if (config.MORGAN_LOGGER !== undefined) {  // e.g. 'dev', 'combined'
      const morgan = require('morgan');
      app.use(morgan(config.MORGAN_LOGGER));
    }

    if (config.STATIC_DIR !== undefined) {  // e.g. 'public'
      const path = require('path');
      app.use(express.static(path.join(__dirname, config.STATIC_DIR)));
    }

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    const cookieParser = require('cookie-parser');
    app.use(cookieParser());

    if (config.CORS_ORIGIN !== undefined) {  // e.g. '*', 'example.com'
      const cors = require('cors');
      app.use(cors({ origin: config.CORS_ORIGIN }));
    }

    const passport = require('passport');
    app.use(passport.initialize());

    app.use('/', router);

    return app;
  }

});
