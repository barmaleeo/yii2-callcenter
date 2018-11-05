
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/frontend/index.jsx',
    output: {
        filename:"callcenter.js"
    },
    resolve: {
        modules: [path.join(__dirname, '../../npm-asset'), 'node_modules']
    },

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
            }

        ]
    }
}