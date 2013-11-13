var fs = require('fs');

function handler(req, res) {
	"use strict";
	fs.readFile(__dirname + '/chatClient_prueba.html', function(err, data) {
		if (err) {
			res.writeHead(500);
			return res.end("Error loading el archivo chatClient.html");
		}

		res.writeHead(200, {'content-type': 'text/html; charset=utf8'});
		res.end(data);
	});
}

var app = require('http').createServer(handler),
	io = require('socket.io').listen(app);

app.listen(8000, function () {
	"use strict";
	console.log("Servidor http escuchando en el puerto 8000");
})

io.sockets.on('connection', function (socket) {
	"use strict";
	socket.on('inicio', function() {
		socket.get('nombre', function(err, nick) {
			socket.room = "General";
			socket.join(socket.room);
			socket.emit('chat', {'from': 'Servidor', 'text':'red' ,'msg': "Bienvenido al chat, " + nick});
			socket.emit('chat', {'from': 'Servidor', 'msg': "Has entrado en la sala " + socket.room});
			socket.broadcast.to(socket.room).emit('chat', {'from': 'Servidor', 'msg': nick + " se acaba de conectar."});
		});
	});
	/*socket.on('message', function (data) {
		console.log(socket.get() + " dice => " + data);
		socket.emit('message', data);
		socket.broadcast.emit('chat', {'from': socket.id, 'msg': data});
	});*/

	socket.on('disconnect', function () {
		socket.get('nombre', function(err, nick) {
			socket.broadcast.to(socket.room).emit('chat', {'from': 'Servidor', 'msg': nick + " se ha desconectado"});
		});
	});

	socket.on('cliente', function (data) {
		"use strict";
		socket.get('nombre', function(err, nick) {
		
			console.log(nick + " dice en la sala " + socket.room + " => " + data.msg);
			socket.emit('message', "Tú: " + data.msg);
			socket.broadcast.to(socket.room).emit('chat', {'from': nick, 'msg': data.msg})
		
		});

	});

	socket.on('UserNickname', function(nick){
		socket.set('nombre', nick, function(){ socket.emit('inicio', {});})
	});

	socket.on('cambiarSala', function (sala) {
		"use strict";
		socket.get('nombre', function(err, nick) {
			socket.broadcast.to(socket.room).emit('chat', {'from': 'Servidor', 'msg': nick + ' ha abandonado esta sala'});
			socket.leave(socket.room);
			socket.room = sala;
			socket.join(sala);
			socket.emit('chat', {'from': 'Servidor', 'msg': 'Has entrado en la sala ' + socket.room});
			socket.broadcast.to(socket.room).emit('chat', {'from': 'Servidor', 'msg': nick + ' se ha unido a esta sala'});
		});
	});

});

console.log("Sigue el programa");
