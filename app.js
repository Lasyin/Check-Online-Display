var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pythonShell = require('python-shell');

var prettyjson = require('prettyjson'); // optional

var os = require('os');
const path = require('path');
const fs = require('fs');

app.set('port', process.env.PORT || 3005);

app.get('/', function(req,res){
  res.sendFile(path.join(__dirname + '/views/home.html'));
});

app.get('/home.js', function(req,res){
  res.sendFile(path.join(__dirname + '/js/home.js'));
});

io.on('connection', function(socket){
  console.log('user connected');
  socket.on('load data', function(){
    fetchCheckOnlineData(function(result){
      io.emit('return data', result)
    });
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

app.use(function(req, res){
  res.sendFile(path.join(__dirname+"/views/404.html"));
});

// Call check_online.py with argument --json to fetch data
function fetchCheckOnlineData(callback){
  var result = [];
  var options = {
    mode: 'json',
    scriptPath: '/path/to/directory',
    args: ['--json']
  }
  pythonShell.run('check_online.py', options, function(err, results){
    if(err){
      console.log("err: " + err)
      throw err;
    }
    jsonPrint(JSON.parse(results))
    return callback(JSON.parse(results))
  });
}

function jsonPrint(data){
  var options = {
    noColor: false
  };
  console.log(prettyjson.render(data, options));
}

http.listen(app.get('port'), function(){
  console.log("App started on: " + app.get('port'));
});
