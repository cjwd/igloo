var webpack = require('webpack');

var path = require('path');

var glob = require('glob');

var ExtractTextPlugin = require("extract-text-webpack-plugin");

var PurifyCSSPlugin = require('purifycss-webpack');

var CleanWebpackPlugin = require('clean-webpack-plugin')

var inProduction = (process.env.NODE_ENV === 'production');

// the path(s) that should be cleaned
let pathsToClean = [
  'dist',
  'build'
]

// the clean options to use
let cleanOptions = {
  root: __dirname,
  verbose: true,
  dry: false
}

module.exports = {
  entry: {
    main: [
      './src/assets/js/main.js',
      './src/assets/styles/main.scss',
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        loaders: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/images/[name].[chunkhash].[ext]' // Also try contenthash
            }
          },
          'img-loader'
        ]

      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css'), //entry point name

    new webpack.LoaderOptionsPlugin({
      minimize: inProduction //true
    }),

    new PurifyCSSPlugin({
      paths: glob.sync(path.join(__dirname, 'src/*.pug')),
      minimize: inProduction
    }),

    new CleanWebpackPlugin(pathsToClean, cleanOptions),

    function() {
      this.plugin('done', stats => {
        require('fs').writeFileSync(path.join(__dirname, 'dist/manifest.json')),
        JSON.stringify(stats.toJson().assetsByChunkName)
      })
    }

  ]
};

if(inProduction) {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin()
  );
}