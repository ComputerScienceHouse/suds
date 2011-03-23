var net = require('net');

var server = net.createServer(function(socket){
	socket.addListener('connect', function(){
		console.log('connected');
		
		socket.write('connected');
	});
	
	socket.addListener('data', function(data){
		console.log(data);
	});
	
	socket.addListener('end', function(){
		console.log('connection terminated');
	});
});

server.listen(2233);