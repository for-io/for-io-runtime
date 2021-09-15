const { runTest } = require('api-diligence');
import { appFactory } from '../../src/appFactory';
const appSetup = require('./app.setup');

runTest({
    name: 'hello',
    opts: { appSetup, appFactory },
    cases: [{
        name: 'say hello to spock',
        steps: [{
            request: 'GET /hello?name=spock',
            200: { msg: 'Hello, spock!' },
        }],
    }, {
        name: 'say hello to kirk',
        steps: [{
            request: 'GET /hello?name=kirk',
            200: { msg: 'Hello, kirk!' },
        }],
    }],
});