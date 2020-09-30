import searchKeys from '../config/search';
import { ES } from '../components';

class Search {
  static init() {
    //create mapping
    require('./mapping')();

    //require search component
    require('./userSearch')();
  }

  static removeIndex(cb) {
    ES.indices.delete({
      index: '_all'
    }, cb);
  }
}

module.exports = Search;
