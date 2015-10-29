var https = require('https');

function Transifex() {};

/**
 * Call api url of transifex.com with GET method
 * @param  {string}   url      complementary part of url
 * @param  {function} callback callback to call when finish function. The function param is response of transifex.com
 * @return {undefined}         undefined
 */
Transifex.prototype.get = function(baseUrl, url, callback) {
    https.get(baseUrl + url, function(res) {
        var body = '';

        res.on('data', function(data) {
          body += data;
        });

        res.on('end',function() {
          callback(body.toString());
        });
    });
};

module.exports = Transifex;