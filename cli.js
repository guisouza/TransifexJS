#!/usr/bin/env node

var transifex = require('./index'),
  _fs = require('fs'),
  _inquirer = require('inquirer'),
  _cli_args = require('simple-args'),
  Ordine = require('ordine'),
  questions = {},
  args;

args = {
  user: _cli_args.u || _cli_args.user,
  pass: _cli_args.p || _cli_args.pass,
  proj: _cli_args.pj || _cli_args.proj,
  resource: _cli_args.r || _cli_args.resource,
  language: _cli_args.l || _cli_args.language,
  path: _cli_args.ph || _cli_args.path,
  ext: _cli_args.e || _cli_args.extension,
  originFile: _cli_args.o || _cli_args.originFile
};
/*
  Have questions to cli user
 */
questions.project = {
  type:'input',
  name:'project',
  message:'Project name'
};

questions.user = {
  type:'input',
  name:'username',
  message:'Transifex Username'
};

questions.password = {
  type:'password',
  name:'password',
  message:'Transifex Password'
};

questions.language = {
  type:'list',
  name:'languages',
  message:'Select the language :'
};

questions.resource = {
  type:'list',
  name:'resources',
  message:'Select the resources :'
};

questions.originFile = {
  type:'input',
  name:'originFile',
  message:'File path to send transifex (original language) :'
};

questions.path = {
  type:'input',
  name:'path',
  message:'Path to save files :'
};

/*
  Create var to config and queue
 */
var flush = new Ordine(function(){}),
  config = {
    ext: args.ext || 'json'
  };

/*
  Queue to question about your transifex account
  First - name of your project
 */

flush.enqueue(function() {
  if( args.proj ) {
    config.proj = args.proj;
    next();
  } else {
    _inquirer.prompt(questions.project,function(data){
      config.proj = data.project;
      next();
    });
  }
});

// Second - your username
flush.enqueue(function(){
  if( args.user ) {
    config.user = args.user;
    next();
  } else { 
    _inquirer.prompt(questions.user,function(data){
      config.user = data.username;
      flush.next()
    });
  }
},true);

// Third - your password
// Where do login in your account
flush.enqueue(function(){
  if( args.pass ) {
    config.pass = args.pass;
    console.log('Authenticating...');
    transifex = transifex.login(config.user, config.pass)
      .setProject(config.proj);
    next();
  } else {
    _inquirer.prompt(questions.password, function(data){
      config.pass = data.password;
      transifex = transifex.login(config.user, config.pass)
        .setProject(config.proj);
      next();
    });
  }
},true);

// Fourth - which languages your want translate
flush.enqueue(function() {
  questions.language.choices =  [];
  console.log('Getting languages...');
  transifex.languages(function(data) {
    data = JSON.parse(data);
    data.forEach(function(choice,i) {
      questions.language.choices.push(choice.language_code);
    });

    if( args.language ) {
      config.language = (typeof args.language === 'string') ? args.language : questions.language.choices[0];
      console.log('Setting languages...');
      transifex.setLang(config.language);
      next();
    } else {
      _inquirer.prompt(questions.language, function(data){
        config.language = (typeof data.languages === 'string') ? data.languages : data.languages[0];
        transifex.setLang(config.language);
        next();
      });
    }

  });
},true);

// Fiveth - your resource
flush.enqueue(function(){
  console.log('Getting resources...')
  transifex.resources(function(resources){
    resources = JSON.parse(resources);
    questions.resource.choices = [];

    resources.forEach(function(option,i){
      questions.resource.choices.push(option.slug);
    });

    if( args.resource ) {
      console.log('Setting resource...');
      transifex.setResource(args.resource);
      next();
    } else {
      _inquirer.prompt(questions.resource, function(data){
        transifex.setResource(data.resources);
      next();
      });
    }
  });

}, true);

// Sixth
flush.enqueue(function() {
  if( args.originFile ) {
    console.log('Sending file...');
    transifex.sendTranslation(args.originFile, function() {
      console.log('File send with success.');
      next();
    });
  } else {
    _inquirer.prompt(questions.originFile, function(data){
      if (data.originFile !== '') {
        console.log('Sending file...');
        transifex.sendTranslation(data.originFile, function () {
          console.log('File send with success.');
          next();
        });
      } else {
        next();
      }
    });
  }
},true);

// Seventh - your filepath
// Get and save your translated file
flush.enqueue(function() {
  var path = 'locales/';
  if( args.path ) {
    path = args.path;
    writeFile(path, function () {
      next();
    });
    transifex.setResource(args.resource);
  } else {
    _inquirer.prompt(questions.path, function(data) {
      writeFile(data.path, function () {
        flush.next();
      });
    });
  }
},true);

/**
 * Write file with transifex tradution
 * @param  {string}   path to destination file
 * @param  {Function} cb   to callback
 * @return {}        nothing
 */
var writeFile = function (path, cb) {
  console.log('Getting strings...');
  var pathFile = process.env.PWD + '/' + path + config.language + '.' + config.ext;
  transifex.translation(function(strings) {
    console.log('Saving file...');
    strings = JSON.parse(JSON.parse(strings)['content']);

    _fs.exists(pathFile, function(exists) {
      // Set date to rename old file
      var date = new Date();
      var fileName = (date.getMonth() + 1) + '-' + date.getDay() + '_' + date.getHours() + date.getMinutes() + date.getSeconds();

      if (exists) {
        _fs.renameSync(pathFile, pathFile.replace(config.ext, fileName + '.' + config.ext));
      }

      _fs.writeFile(pathFile, JSON.stringify(strings), function(err) {
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

/**
 * fix problem with queue
 */
var next = function () {
  setTimeout(function() {
    flush.next();
  });
};
// Run queue
flush.run();
