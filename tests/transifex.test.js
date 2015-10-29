var Transifex = require('../src/Service/Transifex'), 
  https = require('https'), 
  request = require('request'), 
  fs = require('fs'),
  chai = require('chai'),
  sinon = require('sinon');

var transifex = require('../index')(new Transifex, https, request, fs);

describe("Transifex", function(){

    describe("projects", function(){
        
        var spy;
        beforeEach(function() {
            spy = sinon.spy(https, 'get');
        });

        afterEach(function() {
            spy.restore();
        });

        it('should call https.get correctly url', function() {
            //Given
            var user = "user";
            var pass = "pass";
            var loggedTransifex = transifex.login(user, pass);

            //When
            loggedTransifex.projects();


            //Then
            var expectedUrl = 'https://' + user + ':' + pass + '@www.transifex.com/api/2/projects/';
                chai.assert.isTrue(spy.calledOnce);
                chai.assert.isTrue(spy.calledWith(expectedUrl));
        });

        it('should call https.get correctly and callback', function(done) {
            //Given
            var user = "user";
            var pass = "pass";
            var loggedTransifex = transifex.login(user, pass);

            //When
            loggedTransifex.projects(function(){
                done();
            });

            //Then
            var res = {
                on : function(event, callback) {
                    if(event == "end") {
                        callback();
                    }
                }
            };
            var callback = spy.args[0][1];
            callback(res);

        });

    });

    describe("sendTranslation", function() {
        var file = "./tests/tempFiles/file.json";
        
        var requestPutStub, fsWriteFileSyncStub, fsCreateReadStreamStub;
        beforeEach(function() {
            requestPutStub = sinon.stub(request, 'put');
            fsWriteFileSyncStub = sinon.spy(fs, 'writeFileSync');
            fsCreateReadStreamStub = sinon.stub(fs, 'createReadStream');
        });

        afterEach(function() {
            requestPutStub.restore();
            fsWriteFileSyncStub.restore();
            fsCreateReadStreamStub.restore();
            fs.unlinkSync(file);
        });

        it('should call https.put and callback', function(done) {
            //Given
            var user = "user";
            var pass = "pass";
            var loggedTransifex = transifex.login(user, pass);
            var fileContent = {"a": "b"};
            fs.writeFileSync(file, JSON.stringify(fileContent));
            //When
            loggedTransifex.sendTranslation(file, function(body) {
                chai.assert.equal('teste', body);
                done();
            });

            //Then
            
            var callback = requestPutStub.args[0][1];
            callback(false, {}, 'teste');

        });

        it('Should delete empty key and call writeFileSync without this string', function(done){
            //Given
            var user = "user";
            var pass = "pass";
            var loggedTransifex = transifex.login(user, pass);
            var fileContent = {"" : undefined};
            fs.writeFileSync(file, JSON.stringify(fileContent));

            //When
            loggedTransifex.sendTranslation(file, function(body) {
                chai.assert.equal('teste', body);
                done();
            });

            //Then
            chai.assert.equal('{}', fsWriteFileSyncStub.args[0][1]);
            var callback = requestPutStub.args[0][1];
            callback(false, {}, 'teste');
        });

    });

});