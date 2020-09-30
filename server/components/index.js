import Queue from './Queue';
//import RedisClient from './RedisClient';
import S3 from './S3';
import GM from './GM';
import ES from './ES';
import Mailer from './Mailer';
import Uploader from './Uploader';
import Paypal from './Paypal';
import Bitpay from './Bitpay';
import VideoConverter from './VideoConverter';
import AWSS3 from './AWSS3';
import ElasticTranscoder from './ElasticTranscoder';

module.exports = {
  Queue,
 // RedisClient,
  S3,
  GM,
  ES,
  Uploader,
  Mailer,
  Paypal,
  Bitpay,
  VideoConverter,
  AWSS3,
  ElasticTranscoder
};
