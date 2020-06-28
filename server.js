var http = require('http');

var site_router = require('./site_router');
//var router = new site_router('./BDR-SITES');

(async () => {
    var router = await site_router.build_router('./BDR-SITES');
    http.createServer((req, res) => {router.route(req, res)}).listen(8080);
})();