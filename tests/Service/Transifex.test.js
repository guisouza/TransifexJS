var Transifex = require('../../src/Service/Transifex'),
    chai = require('chai'),
    nock = require('nock'),
    sinon = require('sinon');

describe("Transifex", function(){

    describe("get", function(){

        it('should call Transifex.get correctly and callback', function(done) {
            //Given
            var baseUrl = "https://www.transifex.com";
            var url = '/api/2/projects/';
            var body = 'teste';
            nock(baseUrl)
                .get(url)
                .reply(200, body);

            //When
            var transifex = new Transifex(); 
            transifex.get(baseUrl, url, function(data) {
                //Then
                chai.assert.equal(body, data);
                done();
            });
        });
    });

});