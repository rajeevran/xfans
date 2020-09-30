import {ES} from '../components';
import keys from '../config/keys';

module.exports = (queue) => {
  //TODO - create map
  /**
   * Create or update a document.
   * job object for object
   * {
   *   type: photos, users...
   *   data: body data
   * }
   */
  queue.process(keys.INDEX_SEARCH, function(job, done){
    //check id
    let id = job.data.data.uuid || job.data.data.id;
    if (!id) {
      return done();
    }

    ES.index({
      //index: 'myindex',
      //TODO - config index
      type: job.data.type,
      id: id,
      body: job.data.data
    }, (error) => {
      done(error);
    });
  });
};