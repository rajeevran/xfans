//all document see here https://github.com/elastic/elasticsearch-js
import elasticsearch from 'elasticsearch';
import config from '../config/environment';

var client = null;
if (config.ES.provider === 'aws') {
  client = elasticsearch.Client({
    hosts: config.ES.hosts,
    connectionClass: require('http-aws-es'),
    amazonES: {
      region: config.ES.region,
      accessKey: config.ES.accessKeyId || config.AWS.accessKeyId,
      secretKey: config.ES.secretAccessKey || config.AWS.secretAccessKey
    }
  });
} else {
  client = elasticsearch.Client({hosts: config.ES.hosts});
}

module.exports = client;