/** 
 * Routing Module for LIMBS to be used with the modular routing system
 * @module limbs_router
 */
var url = require('url');
var path = require('path');

var router_lib = require('../shared/router_lib');

/**
 * A function to handle routing for LIMBS
 * @param {import('http').IncomingMessage} req - The request made to the server
 * @param {import('http').ServerResponse} res - The server response
 * @returns {boolean} Whether the response was completed
 */
module.exports = function(req, res) {
    var f_stream;
    var req_url = new URL(req.url, 'http://' + req.headers.host);
    if (req_url.pathname === '/') {
        if (f_stream = router_lib.get_file(path.join(__dirname, 'site', 'index.html'))) {
            router_lib.send_success(res, f_stream, router_lib.HTTP_CONT_TYPE['.html']);
            return true;
        }
    }
    else if (path.extname(req_url.pathname) !== '') {
        if ((f_stream = router_lib.get_file(path.join(__dirname, 'site', req_url.pathname))) || 
                (f_stream = router_lib.get_file(path.resolve(path.join('..', 'shared', 'assets', req_url.pathname))))) {
            router_lib.send_success(res, f_stream, router_lib.HTTP_CONT_TYPE[path.extname(req_url.pathname)]);
            return true;
        }
    }
    return false;
};