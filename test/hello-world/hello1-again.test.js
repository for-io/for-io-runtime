const { runTest } = require('../diligence');
import { appFactory } from '../../src/appFactory';

// This tests the execution of another test for the same app setup with same modules (hello1.setup)
const appSetup = require('./hello1.setup');

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