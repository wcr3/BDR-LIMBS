var http = require('http');

var router = require('./router');

router.site = 'LIMBS';
http.createServer(router.route).listen(8080);