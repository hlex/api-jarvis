var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.dev');
var proxy = require('http-proxy-middleware');

var app = express();
var compiler = webpack(config);

app.use(
  require('webpack-dev-middleware')(compiler, {
    // noInfo: true,
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    noInfo: false,
    compress: true,
    stats: {
      assets: true,
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: false,
      chunkModules: false,
    },
    quiet: false,
    inline: false,
  })
);

app.use(require('webpack-hot-middleware')(compiler));

app.use('/static', express.static('static'));

// const url = 'http://httpstat.us/';
// app.use([
//   '/',
// ], proxy({
//   target: url,
// }));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dev.html'));
});

app.listen(9090, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:9090');
});
