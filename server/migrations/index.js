import async from 'async';
import { UserModel } from '../models';
//import Search from '../search';

let args = process.argv.slice(2);
if (args.length && args[0] === 'downES') {
  console.log('Down ES...');
  // Search.removeIndex(function(err) {
  //   if (err) {
  //     console.log('Down ES error!');
  //   } else {
  //     console.log('Down ES successfully!');
  //   }

  //   process.exit();
  // });
} else if (args.length && args[0] === 'populateES') {
  console.log('Populate ES...');
  // Search.init();
  // require('./reindex-search')(function() {
  //   //timeout before exit
  //   //TODO - should check emitter event
  //   setTimeout(function() {
  //     console.log('Populate ES done!');
  //     process.exit();
  //   }, 5 * 60 * 1000);
  // });
} else if (args.length && args[0] === 'down') {
  //down DB
  console.log('Down DB...')
  async.waterfall([
    //TODO - handle to skip error
    function(cb) {
      UserModel.remove({}, cb);
    },
    function(data, cb) {
      //down ES index
      //Search.removeIndex(cb);
      cb();
    }
  ], (err) => {
    if (err) {
      console.log('Down DB error!', err);
    } else {
      console.log('Down DB done');
    }

    process.exit();
  });
} else {
  require('./seed')(() => {
    console.log('migrate data done...');
    process.exit();
  });
}