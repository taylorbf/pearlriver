/***********************
*     Daisy Server      *
***********************/

/* "node daisyserver.js" starts local server with this script */


/* Definitions */
var express = require('express');
var app = express.createServer(express.static(__dirname));
var io = require('socket.io').listen(app);


var hostlocation;

var os=require('os');
var ifaces=os.networkInterfaces();
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
      //console.log(dev+(alias?':'+alias:''),details.address);
      if (details.address!="127.0.0.1") {
      	console.log(details.address);
      	hostlocation = details.address;
      }
      ++alias;
    }
  });
}


/* Routing */
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

/* Open Port */
app.listen(8080);

/* For future usernames */
var usernames = {};


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
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
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
		socket.username = username;
		usernames[username] = username;
		socket.emit('updatechat', 'SERVER', 'you have connected');
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		io.sockets.emit('updateusers', usernames);
	});
});