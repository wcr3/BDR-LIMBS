/** 
 * HTTP Routing Module
 * @module router 
 */

var url = require('url');
var fs = require('fs');
var path = require('path');

/**
 * Collection of HTTP Content-Types (MIME Types) based on file extension
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types|MDN Web Docs}
 * @constant {Object.<string, string>}
 */
const http_content_types = {
    '.html': 'text/html',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript',
};

/**
 * The root-level site location
 * @type {string}
 * @default ''
 */
module.exports.site = '';

/** 
 * Top-level routing function for HTTP Server
 * @param {import('http').IncomingMessage} req - The request made to the server
 * @param {import('http').ServerResponse} res - The server response
 */
module.exports.route = function(req, res) {
    var req_url = new URL(req.url, 'http://' + req.headers.host);
    console.log('Request made for URL: ' + req.url + '. This has basename ' + path.basename(req_url.pathname) + ' and extension ' + path.extname(req_url.pathname));
    var loc = module.exports.site +  req_url.pathname;
    if (loc === 'LIMBS/') {
        loc += '/index.html';
    }
    var ext = path.extname(loc);
    res.writeHead(200, {'Content-Type': http_content_types[ext]});
    var f_rstream = fs.createReadStream(__dirname + '/' + loc);
    f_rstream.pipe(res);
}