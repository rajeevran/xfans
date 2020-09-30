import _ from 'lodash';
import fs from 'fs';
import path from 'path';

class UtilsHelper {
  /**
   * replace empty string, undefined... with new value
   *
   * @param  {Object} obj   Input
   * @param  {Mixed} value replaced data
   * @return {void}
   */
  static replaceEmptyAttributes(obj, value) {
    for (let i in obj) {
      if (!obj[i]) {
        obj[i] = value;
      }
    }
  }

  /**
   * replace empty string, undefined... with new value
   *
   * @param  {Object} obj   Input
   * @return {void}
   */
  static removeEmptyAttributes(obj) {
    return _(obj).omitBy(_.isUndefined).omitBy(_.isNull).omitBy(_.isEmpty).value();
  }

  /**
   * populate response data from
   * @param  {Object} result ES result
   * @return {Object}
   */
  static populateSearchResults(result) {
    return {
      totalItem: result.hits.total,
      items: result.hits.hits.map((hit) => {
        return hit._source;
      })
    };
  }

  /**
   * populate response data from
   * @param  {Object} result ES result
   * @return {Object}
   */
  static populateSearchResult(result) {
    return result._source || null;
  }

  static mkdirpSync(dir, mode) {
    const sep = path.sep, arr = dir.split(sep)
    let i = 0, len = arr.length, tmp
    for (; i < len; i++) {
        tmp = arr.slice(0, i + 1).join(sep);
        if (tmp === '') continue;
        if (!fs.existsSync(tmp)) {
            try {
                fs.mkdirSync(tmp, mode);
            } catch (e) {
                switch (e.code) {
                    case 'EEXIST':
                        break;
                    case 'ENOTDIR' :
                        throw `${tmp.slice(0, tmp.lastIndexOf(sep))} is not a directory`
                    default:
                        throw e
                }
            }
        }
    }
  }
}

module.exports = UtilsHelper;
