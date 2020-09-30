const prerender = require('prerender');
const server = prerender();

server.use(require('prerender-memory-cache'))

server.start();
