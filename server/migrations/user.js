import async from 'async';
var users = require('./usersData/users.json');

module.exports = (UserModel, cb) => {
  async.eachSeries(users, (item, cb) => {
    UserModel.create({
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,
      salt: item.salt,
      password: item.password,
      role: item.role,
      type: item.type,
      emailVerified: item.emailVerified,
      emailVerifiedToken: item.emailVerifiedToken,
      countryCode: item.countryCode,
      avatar: item.avatar,
      about: item.about,
      gender: item.gender,
      birthdate: {
        year: item.birthdate.year,
        month: item.birthdate.month,
        day: item.birthdate.day
      },
      cellPhoneNumber: item.cellPhoneNumber,
      profileAddress: {
        fullAddress: item.profileAddress.fullAddress,
        country: item.profileAddress.country,
        city: item.profileAddress.city,
        province: item.profileAddress.province,
        state: item.profileAddress.state,
        zipCode: item.profileAddress.zipCode,
        coordinate: {
          lat: item.profileAddress.coordinate.lat,
          lng: item.profileAddress.coordinate.lng
        }
      },
      socials: item.socials,
      completedProfile: item.completedProfile,
      photography: item.photography,
      videography: item.videography,
      expertises: item.expertises,
      paidAssignments: item.paidAssignments,
      allowPixForSale: item.allowPixForSale,
      photoGears: item.photoGears,
      videoGears: item.videoGears,
      workAddresses: item.workAddresses,
      stats: {
        totalPix: item.stats.totalPix,
        contests: item.stats.contests,
        finalist: item.stats.finalist,
        followers: item.stats.followers,
        following: item.stats.following,
        profileViews: item.stats.profileViews,
        rate: item.stats.rate,
        rateTotal: item.stats.rateTotal
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }, cb);
  }, cb);
};