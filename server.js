"use strict";
var http = require('http');
var querystring = require('querystring');

const PORT = process.env.PORT || 18340,
  PATH = process.env.DIR || "~/node-test";

var command = [
  'cd ' + PATH,
  'git checkout ',
  'git pull',
  'docker rmi app || true',
  'docker rm -f app || true',
  'docker build -q --rm --no-cache -t app . ',
  'docker run -d -p 8000:8000 -p 7999:7999 --name=app app',
  'exit'
];


var deployServer = http.createServer(function (request, response) {
  if (request.url.search(/deploy\/?$/i) > 0) {

    // 定义了一个post变量，用于暂存请求体的信息
    var post = '';

    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    request.on('data', function (chunk) {
      post += chunk;
    });

    request.on('end', function () {
      var json;
      try {
        json = JSON.parse(post);
      } catch (err) {
        console.error("request body was not JSON");
        response.writeHead(500);
        response.end('request body was not JSON.');
      }

      var reg = /heads\/(.*)/;
      var branchName = reg.exec(json.ref)[1];
      console.log("branch: " + branchName);
      var Client = require('ssh2').Client;
      var conn = new Client();
      conn.on('ready', function () {
        console.log('Client :: ready');
        command[1] = "git checkout " + branchName;
        conn.exec(command.join('&&'), function (err, stream) {
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
            } else {
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
        privateKey: require('fs').readFileSync('/webhook-key/key')
      });
    });

  } else {
    response.writeHead(404)
    response.end('Not Found.')

  }
})

deployServer.listen(PORT)
process.stdout.write("Server running at port " + PORT + "\r\n")