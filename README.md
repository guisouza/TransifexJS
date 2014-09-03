![alt text](http://i.imgur.com/5kxuCNV.png "TransifexJS")


Transifex nodeJS API
=========

TransifexJS is an module to get data from Transifex API.


```javascript
	//NOTE : chainable methods ! =D 
	transifex = new require('./index');
	transifex.login('xxx','xxx')
	.setProject('site-5')
	.setResource('strings-site')
	.setLang('en')
	.translation(function(c){
		console.log(c)
	});
```
