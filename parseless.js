var fs   = require('fs')
  , less = require('less');

var lessparser = {};
var cache = {};
var parser;

module.exports.setup = function(app, opts) {
  var rootDir = process.cwd();
  opts = opts || {};

  var inputDir = opts.inputDir || './views/less';
  var outputDir = opts.outputDir || '/styles';

  parser = new less.Parser({
    paths: [inputDir]
  });

  lessparser.__express = function(path, options, fn) {
    if ('function' == typeof options) {
      fn = options, options = {};
    }
    options.filename = path;
    var str;

    if (options.cache && cache[path]) str = cache[path];
    else str = cache[path] = fs.readFileSync(path, 'utf-8')

    parser.parse(str, function(error, tree) {
      var css = tree.toCSS();
      fn(null, css);
    });
  };

  app.engine('less', lessparser.__express);
  app.get(outputDir + '/:path.:format', function(req, res) {
    if (req.params.format == 'css') {
      res.render('less/' + req.params.path + '.less', function(err, html) {
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.end(html);
      });
    } 
  });

};


