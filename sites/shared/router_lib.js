/**
 * Module of helper functions and constants for site routing
 * @module shared/router_lib
 */
var fs = require('fs');


 /** 
  * Collection of bit values corresponding to HTTP Request Methods 
  * @constant {Object.<string, number>}
  */
const HTTP_REQ_METHOD = module.exports.HTTP_REQ_METHOD = {
    'GET': 1<<0,
    'HEAD': 1<<1,
    'POST': 1<<2,
    'PUT': 1<<3,
    'DELETE': 1<<4,
    'CONNECT': 1<<5,
    'OPTIONS': 1<<6,
    'TRACE': 1<<7
};

/**
 * Collection of HTTP Content-Types (MIME Types) based on file extension
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types|MDN Web Docs}
 * @constant {Object.<string, string>}
 */
const HTTP_CONT_TYPE = module.exports.HTTP_CONT_TYPE = {
    '.html': 'text/html',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript',
};

/**
 * Routes static files requested from the server
 * @param {import('http').ServerResponse} res - The server response
 * @param {string} f_path - The path to the static file
 * @returns {?import('fs').ReadStream} A ReadStream for the given file, or null if it does not exist.
 */
modul.exports.route_file = function(res, f_path) {
    var ret;
    try {
        fs.accessSync(path.join(__dirname, f_path), fs.constants.R_OK);
        ret = fs.createReadStream(path.join(__dirname, f_path));
        res.writeHead(200, {'Content-Type': HTTP_CONT_TYPE[path.extname(f_path)]});
    } catch (err) {
        console.log(err);
        ret = null;
        res.writeHead(404, err);
    }
    return ret;
}