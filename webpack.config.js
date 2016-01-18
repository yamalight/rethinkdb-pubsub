const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

// ignored modules
const nodeModules = fs.readdirSync('node_modules').filter(x => ['.bin'].indexOf(x) === -1);

// export config
module.exports = {
    context: path.resolve(__dirname),
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'es5'),
        filename: 'component.js',
        libraryTarget: 'umd',
    },
    resolve: {
        root: path.resolve(__dirname),
    },
    node: {
        fs: 'empty',
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
            },
        ],
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
    ],
    externals: nodeModules,
};
