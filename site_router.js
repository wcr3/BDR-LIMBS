/** 
 * HTTP Routing Module, based on a single class.  Designed for a modular website built of several different 'sites.'
 * @module site_router 
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
 * Class holding result of route with header data
 * @typedef {Object} RouteResult
 * @property {*} result - The actual data to be returned to the client
 * @property {number} status - The status code sent as a response to the client
 * @property {string} status_message - The status message sent to the client
 * @property {import('http').OutgoingHttpHeaders} headers - The headers data sent to the client
 * @see {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_response_writehead_statuscode_statusmessage_headers|HTTP Module Docs}
 */
class RouteResult {
    result;
    status = 200;
    status_message = '';
    headers = {};

    /**
     * Builds a new RouteResult
     * @param {*} result 
     * @param {number} status 
     * @param {string} status_message 
     * @param {import('http').OutgoingHttpHeaders} headers 
     */
    constructor(result, status, status_message, headers) {
        this.result = result;
        this.status = status;
        this.status_message = status_message;
        this.headers = headers;
    }
}

/** Class holding routing information for various 'sites.' */
class SiteRouter {
    site_routes = {};

    /**
     * Top-level routing function
     * @param {import('http').IncomingMessage} req - The request made to the server
     * @param {import('http').ServerResponse} res - The server response
     */
    route(req, res) {
        var req_url = new URL(req.url, 'http://' + req.headers.host);
        console.log('Request made for URL: ' + req.url + '. This has basename ' + path.basename(req_url.pathname) + ' and extension ' + path.extname(req_url.pathname));
        var site_name = ((req_url.hostname.split('.'))[0]).toLowerCase();
        if (site_name !== 'localhost') {
            if (this.site_routes[site_name]) {
                if (!this.site_routes[site_name](req, res)) {
                    send_file(res, server_error(404, 'Site ' + site_name + ' failed to route.'));
                }
            }
            else {
                send_file(res, server_error(404, 'Site ' + site_name + ' does not exist.'));
            }
        }
        else {
            send_file(res, server_error(501, 'Index page not implemented.'))
        }
    }

    /**
     * Build a SiteRouter from a directory of sites
     * @param {string} site_path - The path to the directory of sites
     */
    constructor(site_path) {
        this.path = site_path;
        var dir = null;
        try {
            dir = fs.opendirSync(path.join(__dirname, this.path));
            this.site_routes = {};
            var site;
            while (((site = dir.readSync()) != null) && (site.name !== 'shared')) {
                if (site.isDirectory()) {
                    var mod_path = path.join(__dirname, this.path, site.name, 'router');
                    this.site_routes[site.name.toLowerCase()] = require(path.join(__dirname, this.path, site.name, 'router'));
                }
            }
            dir.closeSync();
        } catch (err) {
            console.error(err);
            if (dir) {
                dir.closeSync();
            }
            this.route = (req, res) => {send_file(res, server_error(500, 'Failed to load sites at path' + this.path))};
        }
    }
}

/**
 * Sends a file to the client with header information defined in route_result
 * @param {import('http').ServerResponse} res - The server response
 * @param {RouteResult} route_result - Object holding the route_result containing a ReadStream
 */
function send_file(res, route_result) {
    res.writeHead(route_result.status, route_result.status_message, route_result.headers);
    route_result.result.pipe(res);
}

/**
 * Returns a particular error page
 * @param {number} status - Status code to send to client
 * @param {string} status_message - Message to send to client
 * @returns {RouteResult} A RouteResult containing a ReadStream and Header data
 */
function server_error(status, status_message) {
    return new RouteResult(
        fs.createReadStream(path.join(__dirname, 'error', status.toString() + '.html')),
        status,
        status_message,
        {
            'Content-Type': 'text/html'
        }
    );
}

/**
 * Routes urls requested from the server
 * @param {import('http').ServerResponse} res - The server response
 * @param {string} r_url - The url path requested
 * @returns {?import('fs').ReadStream} A ReadStream for the page HTML file, or for the 404 page if not found
 */
function route_url(res, r_url) {
    var ret;
    try {
        fs.accessSync(path.join(__dirname, r_url), fs.constants.R_OK);
        ret = fs.createReadStream(path.join(__dirname, r_url, 'index.html')); // temporary.  will likely be changed.
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
function route_basic(req, res) {
    var req_url = new URL(req.url, 'http://' + req.headers.host);
    console.log('Request made for URL: ' + req.url + '. This has basename ' + path.basename(req_url.pathname) + ' and extension ' + path.extname(req_url.pathname));
    var loc = req_url.pathname;//path.join(module.exports.site, req_url.pathname);
    var f_rstream = path.extname(loc) === "" ? route_url(res, loc) : route_static(res, loc);
    if (f_rstream) {
        f_rstream.pipe(res);
    }
    else {
        res.end();
    }
}

module.exports = SiteRouter;