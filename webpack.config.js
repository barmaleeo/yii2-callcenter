
const path = require('path');

// const webPack = require('webpack');
//
// const pluginProposalClassProp = require('@babel/plugin-proposal-class-properties')




module.exports = {
    mode: 'development',
    entry: './src/frontend/index.jsx',
    output: {
        path:   path.join(__dirname + '/dist/js'),
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