#!/usr/bin/env node

var transifex = require('./index'),
  _fs = require('fs'),
  _inquirer = require('inquirer'),
  _args = require('simple-args'),
  Ordine = require('ordine'),
  questions = {};

/*
  Have questions to terminal user
 */
questions.project = {
  type:'input',
  name:'project',
  message:'Project name',
  require: true
};

questions.user = {
  type:'input',
  name:'username',
  message:'Transifex Username',
  require: true
};

questions.password = {
  type:'password',
  name:'password',
  message:'Transifex Password',
  require: true
};

questions.language = {
  type:'checkbox',
  name:'languages',
  message:'Select the language :'
};

questions.resource = {
  type:'checkbox',
  name:'resources',
  message:'Select the resources :',
  require: true
};

questions.path = {
  type:'input',
  name:'path',
  message:'Path with name and extension to file :',
  require: true
};

/*
  Create var to config and queue
 */
var flush = new Ordine(function(){}),
  config = {};

/*
  Queue to question about your transifex account
  First - name of your project
 */

flush.enqueue(function() {
  if( _args.proj ) {
    config.proj = _args.proj;
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
  console.log('user');
  if( _args.user || _args.u ) {
    config.user = _args.user || _args.u;
    next();
  } else { 
    _inquirer.prompt(questions.user,function(data){
      config.user = data.username;
      flush.next()
    });
  }
},true);

    console.log(_args);
// Third - your password
// Where do login in your account
flush.enqueue(function(){
  if( _args.password || _args.p ) {
    config.pass = _args.password || _args.p;
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

    if( _args.languages || _args.l ) {
      _args.lang = _args.languages || _args.l;
      config.languages = (typeof _args.lang === 'string') ? _args.lang : questions.language.choices;
      console.log('Setting languages...');
      transifex.setLang(config.languages);
      next();
    } else {
      _inquirer.prompt(questions.language, function(data){
        transifex.setLang(data.languages);
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

    if( _args.resource || _args.r ) {
      console.log('Setting resource...');
      transifex.setResource(_args.resource || _args.r);
      next();
    } else {
      _inquirer.prompt(questions.resource, function(data){
        transifex.setResource(data.resources);
      next();
      });
    }
  });

}, true);

// Sixth - your filepath
// Get and save your translated file
flush.enqueue(function() {
  var path = 'locales/test.json';
  if( _args.path ) {
    path = _args.path || path;
    writeFile(path, function () {
      next();
    });
    transifex.setResource(_args.resource || _args.r);
  } else {
    _inquirer.prompt(questions.path, function(data) {
      writeFile(data.path, function () {
        flush.next();
      });
    });
  }
},true);

var writeFile = function (path, cb) {
  console.log('Getting strings...');
  transifex.translation(function(strings){
    strings = JSON.parse(JSON.parse(strings)['content']);
    console.log('Saving file...');

    _fs.writeFile(path, JSON.stringify(strings), function(err) {
      if(err) {
        throw new Error(err.message);
        return;
        console.log(err);
      } else {
        console.log("The file was saved!");
      }
      if( typeof cb === 'function' ) cb();
    }); 

  });
};

var next = function () {
  setTimeout(function() {
    flush.next();
  });
};
// Run queue
flush.run();
