var http = require('http'),  
    io = require('./socket.io'),
	net = require('net'); 

Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

// list of clients
var clients = new Array();

var status = null;

server = http.createServer(function(req, res){ 
 // your normal server code 
 res.writeHead(200, {'Content-Type': 'text/html'}); 
 res.end('<h1>Hello world</h1>'); 
});

server.listen(8888);
  
// socket.io 
var socket = io.listen(server); 
socket.on('connection', function(client){ 
	var your_id = new Date().getTime();
	// create client "object"
	var client_data = {
		'client_id': your_id,
		'client': client
	};
	
	clients.push(client_data);
	
	// connect to the suds server
   /***************************************************************
   * Connection to SUDS server
   ***************************************************************/
	
	var suds = net.createConnection(2233, 'localhost');
	suds.addListener('connect', function(){
		var connect_message = JSON.stringify({'opcode': 'web_connect'});

		suds.write(connect_message);
	});
	
	suds.addListener('data', function(data){
		console.log(data.toString());
		try
		{
			var recv = JSON.parse(data.toString());
		}
		catch(er)
		{
			console.log('malformed json');
		}
		
		if(recv.opcode == 'suds_status')
		{
			status = recv;
			send_to_all(recv);
		}
		else if(recv.opcode == 'update_stall')
		{
			console.log('update stall');
			send_to_all(recv);
		}
	});
	
	suds.addListener('end', function(){
		console.log('connection terminated');

	});
	
	suds.addListener('error', function(e){
		console.log('connection ended');
	});
	
	/**************************************************************
	*
	***************************************************************/
	
	/**************************************************************
	* Socket.io connection
	***************************************************************/
	
  	client.on('message', function(recv_message){
		console.log("----------------------------\nsocket.io:");
		console.log(recv_message);	
		console.log("----------------------------");
		if(recv_message.opcode == 'get_status')
		{
			client.send(status);
		}
				
	});
	
	client.on('disconnect', function(){
		console.log("----------------------------\nsocket.io:");
		console.log("Disconnected");
		console.log("----------------------------");
		
		message_to_send = {'opcode': 'message', 'message': '<i>'+client_data['username']+' has disconnected</i>'};
		send_to_all(message_to_send);
		
		for(var i = 0; i < clients.length; i++)
		{
			if(clients[i]['client_id'] == your_id)
			{
				clients.remove(i);
			}
		}
	});
	
	/**
	 * Send a message to everyone but yourself
	 */
	function send_to_peers(message_to_send)
	{
		for(var i = 0; i < clients.length; i++)
		{
			if(clients[i]['client_id'] != your_id)
			{
				clients[i]['client'].send(message_to_send);
			}
		}
	}
	
	/**
	 * Send message to everyone including yourself
	 */
	function send_to_all(message_to_send)
	{
		//console.log(client);
		for(var i = 0; i < clients.length; i++)
		{
			//console.log(clients[i]['client_id']);
			clients[i]['client'].send(message_to_send);
		}
	}
	 
  	 
});