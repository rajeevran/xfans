const countries = require('../../data/countries.json');
const CountryBlock = require('../../models/country-block');

exports.getBlockList = function(req, res) {
  CountryBlock.find({}, function(err, list) {
    if (err) {
      return res.status(500).send(err)
    }
    list = err ? [] : list;
    const data = countries.map(c => {
      c.isBlocked = list.find(i => i.code === c.code) !== undefined;
      return c;
    });
    res.status(200).send(data);
  });
};

exports.removeCountry = function(req, res) {
  CountryBlock.remove({
    code: req.params.code
  }, function() {
    res.status(200).send({
      success: true
    });
  });
};

exports.addCountry = function(req, res, next) {
  CountryBlock.findOne({
    code: req.body.code
  }, function (err, country) {
    if (err) {
      return res.status(500).send(err)
    }
    if (country) {
      return res.status(200).send(country);
    }

    country = new CountryBlock(req.body);
    country.save(function() {
      return res.status(200).send(country);
    });
  });
};
