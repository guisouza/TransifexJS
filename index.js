module.exports = (function(https, request, fs){
  'use Strict'

  this.username = '';
  this.password = '';
  this.baseUrl = 'https://www.transifex.com/api/2/';
  this.loggedIn = false;
  this.projectName = false;
  this.resourceName = false;
  this.langName = false;
  this.host = false;

  /**
   * Set authenticate variables
   * @param  {string} username of transifex.com
   * @param  {string} password of transifex.com
   * @return {undefined}          undefined
   */
  function authenticate(username,password){
    this.loggedIn = true;
    this.username = username;
    this.password = password;
    this.baseUrl = this.baseUrl.replace('https://','https://'+username+':'+password+'@');
  };

  /**
   * Set project name
   * @param {string} projectName of transifex.com
   */
  function setProject(projectName){
    this.projectName = projectName;
  };

  /**
   * Set resource name
   * @param {string} resourceName of transifex.com
   */
  function setResource(resourceName){
    this.resourceName = resourceName;
  };

  /**
   * Set language to donwload of transifex.com
   * @param {string} langName to abreviation of language
   */
  function setLang(langName){
    this.langName = langName;
  };

  transifex = {
    /**
     * Call api url of transifex.com with GET method
     * @param  {string}   url      complementary part of url
     * @param  {function} callback callback to call when finish function. The function param is response of transifex.com
     * @return {undefined}            undefined
     */
    get: function (url, callback) {
      https.get(baseUrl+url, function(res) {

        var body = '';
        res.on('data', function (data) {
          body += data;
        });

        res.on('end',function(){
          callback(body.toString());
        });
      });
    },
    /**
     * Call api url of transifex.com with PUT method. Only to send strings to transifex.com
     * @param  {}   url      [description]
     * @param  {string}   url      complementary part of url
     * @param  {function} callback callback to call when finish function. The function param is response of transifex.com
     * @return {undefined}            undefined
     */
    put: function(url, data, callback) {
      var formData = {
        content: fs.createReadStream(__dirname + '/' + data)
      };
      request.put({
        url: baseUrl+url,
        formData: formData
      }, function(err, httpResponse, body) {
        if( err ) {
          return console.error('upload failed:', err);
        }
        callback(body.toString());
      });
    }
  };

  return {

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
      transifex.get(url, callback);
    },
    resources : function(callback){
      var url = 'project/'+projectName+'/resources/';
      transifex.get(url, callback);
    },
    setResource : function(resourceName){
      setResource(resourceName);
      return this;
    },
    languages : function(callback){
      var url = 'project/'+projectName+'/languages/';
      transifex.get(url, callback);
    },
    setLang : function(langName){
      setLang(langName);
      return this;
    },
    translation : function(callback){
      var url = 'project/'+projectName+'/resource/'+resourceName+'/translation/'+langName;
      transifex.get(url, callback);
    },
    sendTranslation : function(data, callback){
      var url = 'project/'+projectName+'/resource/'+resourceName+'/content/';
      transifex.put(url, data, callback);
    }

  }

})(require('https'), require('request'), require('fs'));