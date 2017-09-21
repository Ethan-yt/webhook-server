var http = require('http')
  , exec = require('child_process').exec

const PORT = process.env.PORT || 18340
  , PATH = process.env.DIR

var deployServer = http.createServer(function (request, response) {
  if (request.url.search(/deploy\/?$/i) > 0) {

    var commands = [
      'ssh root@138.68.43.201',
      'cd ' + PATH,
      'git pull',
      'docker rm app',
      'docker rmi app',
      'docker build --rm --no-cache -t app . ',
      'docker run -d -p 8000:8000 --name=app app'
    ]
    for (cmd in commands) {
      exec(cmd, function (err, stdout, stderr) {
        if (err) {
          response.writeHead(500)
          response.end('Server Internal Error.\r\n' + err)
          process.stderr.write(err)
          throw err
        }
        process.stdout.write(stdout)
        response.writeHead(200)
        response.end('Deploy Done.')
      })
    }
  } else {
    response.writeHead(404)
    response.end('Not Found.')

  }
})

deployServer.listen(PORT)
process.stdout.write("Server running at port " + PORT)