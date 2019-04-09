
const path = require('path');

const devMode = process.env.NODE_ENV !== 'production'

// const webPack = require('webpack');
//
// const pluginProposalClassProp = require('@babel/plugin-proposal-class-properties')

//const ExtractTextPlugin = require("extract-text-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");




module.exports = {
    mode: devMode?'development':'production',
    devtool: devMode?'cheap-inline-module-source-map':'',
    entry: './src/frontend/index.jsx',
    output: {
        path:   path.join(__dirname + '/dist'),
        filename:"js/callcenter.js"
    },
    resolve: {
        extensions: ['.css','.scss','.sass', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    //devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    //'postcss-loader',
                    'sass-loader',
                ],
            }



        ]
    },
    plugins:[
        new MiniCssExtractPlugin({
            //filename: devMode ? '[name].css' : '[name].[hash].css',
            path:   path.join(__dirname + '/dist'),
            filename: 'css/callcenter.css'
            //chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
        })

    ]


}