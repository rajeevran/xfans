import config from '../config/environment';
import redis from 'redis';
//import jsonify from 'redis-jsonify';

//redis with jsonify
//module.exports = jsonify(redis.createClient(config.redis));
module.exports = {} //redis.createClient(config.redis);
