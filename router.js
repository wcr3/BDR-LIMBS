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
 * Routes pages requested from the server
 * @param {import('http').ServerResponse} res - The server response
 * @param {string} f_path - The url path of the page
 * @returns {?import('fs').ReadStream} A ReadStream for the page HTML file, or for the 404 page if not found
 */
function route_page(res, f_path) {
    var ret;
    try {
        fs.accessSync(path.join(__dirname, f_path), fs.constants.R_OK);
        ret = fs.createReadStream(path.join(__dirname, f_path, 'index.html')); // temporary.  will likely be changed.
        res.writeHead(200, {'Content-Type': 'text/html'});
    } catch (err) {
        console.log(err);
        ret = fs.createReadStream(path.join(__dirname, '404.html'));
        res.writeHead(404, err, {'Content-Type': 'text/html'});
    }
    return ret;
}

/**
 * Routes static files requested from the server
 * @param {import('http').ServerResponse} res - The server response
 * @param {string} f_path - The path to the static file
 * @returns {?import('fs').ReadStream} A ReadStream for the given file, or null if it does not exist.
 */
function route_static(res, f_path) {
    var ret;
    try {
        fs.accessSync(path.join(__dirname, f_path), fs.constants.R_OK);
        ret = fs.createReadStream(path.join(__dirname, f_path));
        res.writeHead(200, {'Content-Type': http_content_types[path.extname(f_path)]});
    } catch (err) {
        console.log(err);
        ret = null;
        res.writeHead(404, err);
    }
    return ret;
}

/** 
 * Top-level routing function for HTTP Server
 * @param {import('http').IncomingMessage} req - The request made to the server
 * @param {import('http').ServerResponse} res - The server response
 */
module.exports.route = function(req, res) {
    var req_url = new URL(req.url, 'http://' + req.headers.host);
    console.log('Request made for URL: ' + req.url + '. This has basename ' + path.basename(req_url.pathname) + ' and extension ' + path.extname(req_url.pathname));
    var loc = path.join(module.exports.site, req_url.pathname);
    var f_rstream = path.extname(loc) === "" ? route_page(res, loc) : route_static(res, loc);
    if (f_rstream) {
        f_rstream.pipe(res);
    }
    else {
        res.end();
    }
}