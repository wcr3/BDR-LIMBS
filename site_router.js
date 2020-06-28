/** 
 * HTTP Routing Module, based on a single class.  Designed for a modular website built of several different 'sites.'
 * @module site_router 
 */

var fs = require('fs');
var fs_promises = require('fs').promises;
var path = require('path');

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
     * @returns {Promise} Resolves on completed routing.  Rejects otherwise.
     */
    async route(req, res) {
        var req_url = new URL(req.url, 'http://' + req.headers.host);
        console.log('Request made for URL: ' + req.url + '. This has basename ' + path.basename(req_url.pathname) + ' and extension ' + path.extname(req_url.pathname));
        try {
            var site_name = ((req_url.hostname.split('.'))[0]).toLowerCase();
            if (site_name !== 'localhost') {  // TO BE CHANGED
                if (this.site_routes[site_name]) {
                    await this.site_routes[site_name](req, res);
                    return;
                }
                throw new Error('404 Site ' +  site_name + ' does not exist.');
            }
            throw new Error('501 Index page not implemented');
        } 
        catch (err) {
            console.error(err);
            send_file(res, server_error(err.message.substring(0,3), err.message.substring(4)));  // I don't really like this and would prefer for isolation between the server and the sites
                                                                                                   // This restricts what structure Errors the sites can throw
        }
    }

    /**
     * Asynchronously builts a SiteRouter
     * @param {string} site_path The relative path to the directory of sites
     * @returns {Promise<SiteRouter>} Resolves to the SiteRouter, rejects on failure to parse sites
     */
    static async build_router(site_path) {
        var router = new SiteRouter(site_path);
        var dir = null;
        try {
            dir = await fs_promises.opendir(path.join(__dirname, site_path));
            for await (const site of dir) {
                if (site.isDirectory() && site.name !== 'shared') {
                    router.site_routes[site.name.toLowerCase()] = require(path.join(__dirname, router.path, site.name, 'router'));
                }
            }
        }
        catch (err) {
            if (dir) {
                await dir.close();
            }
            SiteRouter.route = (req, res) => {send_file(res, server_error(500, 'Failed to load sites at path' + this.path))};
        }
        return router;
    }

    /**
     * Build a SiteRouter from a directory of sites
     * @param {string} site_path - The path to the directory of sites
     */
    constructor(site_path) {
        this.path = site_path;
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
        fs.createReadStream(path.join(__dirname, 'error', status + '.html')),
        status,
        status_message,
        {
            'Content-Type': 'text/html'
        }
    );
}

module.exports = SiteRouter;