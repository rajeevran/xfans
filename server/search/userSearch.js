import { UserEvent } from '../events';
import { ES } from '../components';
import keys from '../config/keys';
import searchKeys from '../config/search';
import _ from 'lodash';

module.exports = () => {
  /**
   * do index data, for create or update
   */
  function indexUser(data, cb) {
    ES.index({
      index: searchKeys.user.index,
      type: searchKeys.user.type,
      id: data.uuid,
      body: data
    }, (error, response) => {
      cb && cb(error, response);
    });
  }

  UserEvent.on(keys.USER_UPDATED, (user) => {
    //do not index private data
    //TODO - list more here
    let data = _.omit(user.attrs, 'salt', 'password', 'emailVerifiedToken', 'passwordResetToken');
    indexUser(data);
  });

  UserEvent.on(keys.USER_CREATED, (user) => {
    indexUser(user.attrs);
  });
};