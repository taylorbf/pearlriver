/***********************
*     Daisy Server      *
***********************/

/* "node daisyserver.js" starts local server with this script */


/* Definitions */
var express = require('express');
var app = express();


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

http.listen(8080, function(){
  console.log('listening on *:8080');
});

var usernames = []

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

	socket.on('disconnect', function() {
		// delete usernames[socket.username];
		// io.sockets.emit('updateusers', usernames);
		// socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});


	/* User disconnects
	socket.on('removeuser', function() {
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
	*/

	/* User connects */
	socket.on('adduser', function(username){
		/* socket.username = username;
		usernames[username] = username;
		socket.emit('updatechat', 'SERVER', 'you have connected');
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		io.sockets.emit('updateusers', usernames);  */
	});
});