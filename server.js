"use strict";
var http = require('http');

const PORT = process.env.PORT || 18340
  , PATH = process.env.DIR || "~/node-test";

var command = [
  'cd ' + PATH,
  'git pull',
  'docker rm app || true',
  'docker rmi app || true',
  'docker build -q --rm --no-cache -t app . ',
  'docker run -d -p 8000:8000 --name=app app',
  'exit'
].join('&&');


var deployServer = http.createServer(function (request, response) {
  if (request.url.search(/deploy\/?$/i) > 0) {
    var Client = require('ssh2').Client;
    var conn = new Client();
    conn.on('ready', function () {
      console.log('Client :: ready');
      conn.exec(command, function (err, stream) {
        if (err) {
          response.writeHead(500);
          response.end('Server Internal Error.\r\n' + err.message);
          console.log('ERROR: ' + err.message)
          conn.end();
        }
        stream.on('close', function (code, signal) {
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          if (code == 0) {
            response.writeHead(200);
            response.end('Deploy Done.');
          }
          else{
            response.writeHead(500);
            response.end('Server Internal Error.');
          }
          conn.end();
        }).on('data', function (data) {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', function (data) {
          console.log('STDERR: ' + data)
        });
      });
    }).connect({
      host: '138.68.43.201',
      username: 'root',
      privateKey: require('fs').readFileSync('/root/.ssh/id_rsa')
    });




  } else {
    response.writeHead(404)
    response.end('Not Found.')

  }
})

deployServer.listen(PORT)
process.stdout.write("Server running at port " + PORT + "\r\n")