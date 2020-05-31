var http = require('http');

var site_router = require('./site_router');
var router = new site_router('./sites');

http.createServer((res, req) => {router.route(res, req)}).listen(8080);