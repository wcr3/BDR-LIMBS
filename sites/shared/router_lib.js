/**
 * Module of helper functions and constants for site routing
 * @module shared/router_lib
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