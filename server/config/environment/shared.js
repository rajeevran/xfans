'use strict';
import path from 'path';

exports = module.exports = {
  // List of user roles
  userRoles: ['guest', 'user', 'admin'],
  socketUrl:  process.env.SOCKET_URL || 'https://myadmirers.com',
  version: require(path.join(__dirname, '..', '..', '..', 'package.json')).version,
  buildNumber: require(path.join(__dirname, '..', '..', '..', 'package.json')).buildNumber,
  enableRTMP: false,
  showBuild: false,
  cdn: {
    //do not have spash eg https://cdn.domain.com
    video: '',
    file: ''
  },
  siteName: 'myadmirers',
  twitterName: '@myadmirers'
};
