transifex = new require('./index');

transifex.login('xxx','xxx')
.setProject('site-5')
.setResource('strings-site')
.setLang('en')
.translation(function(c){
	console.log(c)
});