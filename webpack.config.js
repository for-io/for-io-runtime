const path = require("path");

module.exports = {
    mode: 'production',
    entry: { index: path.resolve(__dirname, "src", "index.js") },
};
