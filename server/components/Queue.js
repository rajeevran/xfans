import kue from 'kue';
import config from '../config/environment';

//TODO - allow config multiple redis server

var queue = kue.createQueue({
  prefix: 'q',
  redis: config.redis
});

// queue.on('job enqueue', (id, type) => {
//   //TODO - hide/remove me in the production mode
//   console.log( 'Job %s got queued of type %s', id, type );
// }).on('job complete', (id, result) => {
//   //after job is completed, remove the key, we dont need it anymore
//   kue.Job.get(id, (err, job) => {
//     if (err) { return; }

//     job.remove(function(err){
//       if (err) { throw err; }
//       console.log('removed completed job #%d', job.id);
//     });
//   });
// });

module.exports = queue;