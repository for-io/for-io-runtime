const { appFactory } = require('../test-helpers');

export const unauthorizedTestOpts = {
    appSetup: {
        dir: __dirname,
        moduleNames: { src: ['./unauthorized'] }
    },
    appFactory
};
