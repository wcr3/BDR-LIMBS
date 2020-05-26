var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');

var port = 8080;

var res_types = {
    '.html': 'text/html',
    '.ico': 'image/x-icon'
};

http.createServer(function (req, res) {
    var req_url = new URL(req.url, 'http://localhost:' + port);
    console.log('Request made for URL: ' + req.url);
    var loc = req_url.pathname;
    if (loc == '/') {
        loc = '/index.html';
    }
    var ext = path.extname(loc);
    res.writeHead(200, {'Content-Type': res_types[ext]});
    fs.readFile('.' + loc, function(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            res.end(data);
        }
    });
}).listen(port);