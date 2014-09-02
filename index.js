module.exports = (function(https){
	'use Strict'

	this.username = '';
	this.password = '';
	this.baseUrl = 'https://www.transifex.com/api/2/';
	this.loggedIn = false;
	this.projectName = false;
	this.resourceName = false;
	this.langName = false;

	function authenticate(username,password){
		this.loggedIn = true;
		this.username = username;
		this.password = password;
		this.baseUrl = this.baseUrl.replace('https://','https://'+username+':'+password+'@')
	}

	function setProject(projectName){
		this.projectName = projectName;
	}

	function setResource(resourceName){
		this.resourceName = resourceName;
	}

	function setLang(langName){
		this.langName = langName;
	}

	function request(url,callback){
		console.log(baseUrl+url);
		https.get(baseUrl+url, function(res) {
			res.on('data',function(buf){
				callback(buf.toString())
			});
		});
	}

	return{

		login : function(username,password){
			authenticate(username,password);
			return this;
		},
		setProject : function (projectName){
			setProject(projectName);
			return this
		},
		projects : function(callback){
			var url = 'projects/';
			request(url,callback);
		},
		resources : function(callback){
			var url = 'project/'+projectName+'/resources/';
			request(url,callback);
		},
		setResource : function(resourceName){
			setResource(resourceName);
			return this;
		},
		languages : function(callback){
			var url = 'project/'+projectName+'/languages/';
			request(url,callback);
		},
		setLang : function(langName){
			setLang(langName);
			return this;
		},
		translation : function(callback){
			var url = 'project/'+projectName+'/resource/'+resourceName+'/translation/'+langName;
			request(url,callback);
		}

	}

})(require('https'))