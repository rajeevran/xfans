import {ES} from '../components';
import searchKeys from '../config/search';

var userTemplate = {
  "template": "user*",
  "mappings": {}
};
userTemplate.mappings[searchKeys.user.type] = {
  "properties": {
    _id : {'type' : 'string', 'index' : 'not_analyzed'}
  }
};

module.exports = () => {
  ES.indices.putTemplate({
    name: 'usertemplate',
    body: userTemplate
  })
  .catch(err => {
    console.log('Create mappings error for user');
  });
};
