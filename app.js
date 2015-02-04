#!/usr/bin/env node

var transifex = require('./index'),
  _fs = require('fs'),
  _cli_args = require('simple-args'),
  configFile = 'transifex.json',
  PWD = process.env.PWD,
  config = PWD + '/' + configFile;


var getTranslate = function(lang, cb) {
  if (typeof lang === 'string') {
    transifex.setLang(lang);
    donwloadFile(lang, function() {
      if(typeof cb === 'function')
        cb();
    });
  } else if(typeof config.language === 'object') {
    var count = config.language.length,
      i = 0;

    transifex.setLang(config.language[i]);
    getTranslate(config.language[i++], function() {
      if (i < count) {
        getTranslate(config.language[i++]);
      }
    });
  }
}

var donwloadFile = function(lang, cb) {
  var path = PWD + '/' + config.path + '/' + lang + '.' + config.ext;
  writeFile(path, cb);
}

/**
 * Write file with transifex tradution
 * @param  {string}   path to destination file
 * @param  {Function} cb   to callback
 * @return {}        nothing
 */
var writeFile = function (path, cb) {
  console.log('Getting strings('+ transifex.getLang() +')...');

  transifex.translation(function(strings) {
    console.log('Saving file...');
    strings = JSON.parse(JSON.parse(strings)['content']);

    _fs.exists(path, function(exists) {
      // Set date to rename old file
      var date = new Date();
      var fileName = (date.getMonth() + 1) + '-' + date.getDate() + '_' + date.getHours() + date.getMinutes() + date.getSeconds();

      if (exists) {
        _fs.renameSync(path, path.replace(config.ext, fileName + '.' + config.ext));
      }

      _fs.writeFile(path, JSON.stringify(strings), function(err) {
        if(err) {
          throw new Error(err.message);
          console.error(err);
        } else {
          console.log("The file was saved!");
        }
        if (typeof cb === 'function') {
          cb();
        }
      });

    });
  });
};

if(_fs.existsSync(config)) {
  config = require(config);
} else {
  if (typeof _cli_args.config !== 'undefined') {
    config = require(PWD + '/' + _cli_args.config );
  } else {
    throw Error('Config file not a found. Please, create config file (' + configFile + ')');
    return;
  }
}
/*
  Create var to config and queue
 */
config.ext = config.ext || 'json';

console.log('Authenticating...');

transifex = transifex.login(config.user, config.pass).setProject(config.project);

transifex.setResource(config.resource);

if (typeof config.originFile !== 'undefined' && config.originFile !== '') {
  console.log('Sending file...');
  transifex.sendTranslation(config.originFile, function () {
    console.log('File send with success.');
    getTranslate();
  });
} else {
  getTranslate();
}