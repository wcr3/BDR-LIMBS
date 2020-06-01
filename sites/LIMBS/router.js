/** 
 * Routing Module for LIMBS to be used with the modular routing system
 * @module limbs_router
 */
var url = require('url');
var path = require('path');
var mysql = require('mysql');
var events = require('events');

var router_lib = require('../shared/router_lib');

var db_connected = false;
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password", // I am a master of security
    database: "sakila"
});
con.connect(function(err) {
    if (err) {
        console.log(err);
    }
    else {
        db_connected = true;
    }
});

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
    else if ((req_url.pathname.split('/')[1]) === 'retrieve') {
        if (!db_connected) {
            res.writeHead(500, "SQL Database not connected.");
            res.end();
            return true;
        }
        // var test = 10;
        // var queryCompleteEmitter = new events.EventEmitter();
        con.query('SELECT * FROM actor', function(err, results) {
            if (err) {
                console.log(err);
                res.writeHead(500, "SQL Query Failed.");
                res.end();
            }
            else {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(results));
            }
        });
        // while(!query_completed);  // This should really be implemented with an EventListener
        // res.writeHead(200, {'Content-Tpye': 'application/json'});
        // res.end(JSON.stringify(query_data));
        // query_completed = false;
        return true;
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