var webpack = require('webpack');


var plugins = [
  new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
]

if (process.env.NODE_ENV === 'production')
  plugins.unshift(new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }))

module.exports = {
    context: __dirname + "/src",
    entry: { 
        javascript: "./index.js",
        html: "./index.html",
        vendors: ['react', 'react-dom', 'd3', 'codemirror', 'collection-view']
    },
    output: {
        path: __dirname + "/dist",
        filename: "index.js"
    },
    module: {
        loaders: [
            { test: /\.scss$/,
              loaders: [
                "style",
                "css?modules&-autoprefixer&localIdentName=__[path][name]_[local]_[hash:base64:5]",
                "autoprefixer",
                "sass"
              ]
            },
            { test: /\.css$/,
              loaders: [
                "style",
                "css"
              ]
            },
            { test: /\.js$/,
              exclude: /node_modules/,
              loader: "babel",
              query: {
                presets: ['react', 'es2015', 'stage-0'],
                plugins: ['transform-runtime']
              },
            },
            { test: /\.svg$/,
              loader: "url?limit=10000" },
            { test: /\.html$/,
              loader: "file?name=[name].[ext]" }
        ]
    },
    plugins: plugins
};
