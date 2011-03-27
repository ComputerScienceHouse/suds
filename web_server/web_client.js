var http = require('http'),  
    io = require('./socket.io'),
	net = require('net');

// map of stalls for north and south side
// get from server on connect.
var stalls = null;

// clients connected to the web socket server
var web_clients = new Array();
var suds = null;

if(suds == null)
{
	var suds = net.Socket();

	suds.on('connect', function(){
		console.log(get_time() + ' - connected to suds');
		var connect_msg = {'opcode': 'client_connect'};
		suds.write(JSON.stringify(connect_msg) + "\n");
	});

	suds.on('data', function(data){
		//console.log("recvd: " + data.toString());
		var recv = data.toString();
		recv = recv.replace("\\n", "");
		try
		{
			recv = JSON.parse(recv);
			//console.log(recv);
			switch(recv.opcode)
			{
				case "update_stall":
					console.log(get_time() + " - updating stall " + recv.suds_id + "-" + recv.stall + " to " + recv.status);
					// forward the update to all web clients
					send_to_all(recv);
					suds.write(JSON.stringify({'opcode': 'ACK'}));
					break;
				case "stall_dump":
					console.log(get_time() + " - got stall dump from server");
					stalls = recv.stalls;
					//console.log('-----');
					//console.log(stalls);
					send_to_all(recv);
					suds.write(JSON.stringify({'opcode': 'ACK'}));
					break;
				case "ACK":
				case "ERR":
					console.log("ACK received");
					//suds.write(JSON.stringify({'opcode': 'ACK'}) + "\n");
					break;
				default:
					console.log(get_time() + ' - opcode not recognized');
			}
		}
		catch(e)
		{
			var err = {"opcode" : "ERR"};
			suds.write(JSON.stringify(err) + "\n");
			console.log(get_time() + " - " + e + ": " + data.toString());
		}
	});

	suds.on('end', function(){
		console.log('ended');
	});

	suds.on('error', function(){
		console.log('err');
	});

	suds.connect(2233, 'localhost');
}

var web_server = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('<h1>Welcome to suds!</h1>');
});

web_server.listen(8888);

var web_socket = io.listen(web_server);

web_socket.on('connection', function(socket){
	console.log(get_time() + " - web: client connected");
	var client_id = new Date().getTime();
	web_clients.push({'client_id': client_id, 'socket': socket});
	
	var connect_msg  = {'opcode': 'data_init', 'stalls': stalls};
	socket.send(connect_msg);
	
	web_socket.on('message', function(data){
		console.log(get_time() + " - web: message received " + data.toString());
	});

	web_socket.on('disconnect', function(){
		console.log(get_time() + " - client disconnected");
	});
});




/**
 * Send message to everyone including yourself
 */
function send_to_all(message_to_send)
{
	//console.log(client);
	for(var i = 0; i < web_clients.length; i++)
	{
		//console.log(clients[i]['client_id']);
		web_clients[i]['socket'].send(message_to_send);
	}
}

function get_time()
{
	return new Date().toUTCString();
}

Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};