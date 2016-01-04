/***********************
*     Daisy Server      *
***********************/

/* "node server.js" starts local server with this script */


/* Definitions */
var express = require('express');
var app = express();

// for heroku
var port = process.env.PORT || 8080;

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});


io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(port, function(){
  console.log('listening on *:8080');
});

io.sockets.on('connection', function (socket) {

	/* Send gestures to all users 
	   (conceived as a "chat" with gestures) */
	/* two parameters: 
		type: ?
		data:  */
		
	/* THIS HANDLES DAISYHEAD DATA */	
	socket.on('sendchat', function (type, data) {
		/* return update chat */
		io.sockets.emit('updatechat', type, data);
	});
	
	/* THIS HANDLES PEARLRIVER DATA */
	socket.on('senddata', function (type, data) {
		/* return update chat */
		io.sockets.emit('updatedata', type, data);
	});

	socket.on('sendpearlchat', function (type, data) {
		/* return update chat */
		io.sockets.emit('updatepearlchat', type, data);
	});
});