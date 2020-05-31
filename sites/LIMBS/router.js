/** 
 * Routing Module for LIMBS to be used with the modular routing system
 * @module limbs_router
 */
var url = require('url');

var router_lib = require('../shared/router_lib');


/**
 * A function to handle routing for LIMBS
 * @param {import('http').IncomingMessage} req - The request made to the server
 * @param {import('http').ServerResponse} res - The server response
 * @returns {boolean} Whether the response was completed
 */
module.exports = function(req, res) {
    var req_url = new URL(req.url, 'http://' + req.headers.host);
    if (req_url.pathname) {
        
    }
    return false;
};