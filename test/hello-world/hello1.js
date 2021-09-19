const { App } = require("../test-helpers");

App.addEndpoint('GET /hello', (name) => ({ msg: `Hello, ${name}!` }));
