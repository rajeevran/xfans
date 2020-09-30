import { Queue } from '../components';

//import email queue
require('./emails')(Queue);
require('./convert-video')(Queue);
require('./uploadToS3')(Queue);
require('./auto-post-twitter')(Queue);
require('./download-and-reupload-video-clip')(Queue);
require('./affiliate-content')(Queue);
