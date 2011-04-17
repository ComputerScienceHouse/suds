var net = require('net');

var stalls = {'south':{}, 'north': {}};
var connected = {'south': false, 'north': false};

var clients = new Array();
var suds_clients = new Array();

//emitter.setMaxListeners(200);

var server = net.createServer(function(socket){
	var client_id = new Date().getTime();
	var client_type = null;
	
	socket.addListener('connect', function(){
		console.log(get_time() + " - " + socket.remoteAddress + " connected");
		var msg = {'opcode': 'stall_dump', 'stalls': stalls};
		//socket.write(JSON.stringify(ack_msg) + "\n");
		
		//var msg = {'opcode': "ACK"};
		socket.write(JSON.stringify(msg) + "\n");
		//console.log('foo');
	});
	
	socket.addListener('data', function(data){
		//console.log(data.toString());
		var recv = data.toString();
		recv = recv.replace("\\n", "");
		try
		{
			
			recv = JSON.parse(recv);
			//console.log(recv);
			//var ack_msg = {"opcode" : "ACK"};
			switch(recv.opcode)
			{
				case "suds_connect":
					console.log(get_time() + " - suds client connected"); 
					suds_clients.push({'id' : client_id, 'socket': socket, 'suds_id': recv.suds_id});
					//stalls[recv['suds_id']] = recv.data;
					var tmp_stalls = [];

					for(var i = 0; i < recv.data.length; i++)
					{
						tmp_stalls[i] = {'id': recv.data[i][0], 'name': recv.data[i][1], 'status': 0}; 
						//console.log(tmp_stalls[i]);
					}
					
					stalls[recv['suds_id']] = tmp_stalls;
					
					//console.log(stalls);
					client_type = 'suds';
					
					var stall_dump = {'opcode': 'stall_dump', 'stalls': stalls};
					send_to_clients(JSON.stringify(stall_dump) + "\n");
					socket.write(JSON.stringify({'opcode': 'ACK'}) + "\n");
					break;
				case "client_connect":
					console.log(get_time() + " - client connected");
					client_type = 'client';
					clients.push({'id': client_id, 'socket': socket});
					
					break;
				case "update_stall":
					// recv a stall status update from a "suds-node"
					console.log(get_time() + " - updating stall " + recv.suds_id + "-" + recv.stall + " to " + recv.status);
					// update the DB here and publish to redis?
					update_stall(recv.suds_id, recv.stall, recv.status);
					//send update to all clients
					var msg = {'opcode': 'update_stall', 'suds_id': recv.suds_id, 'id': recv.stall, 'status': recv.status};
					send_to_clients(JSON.stringify(msg) + "\n");
					socket.write(JSON.stringify({'opcode': 'ACK'}) + "\n");
					
					break;
				case "ACK":
				case "ERR":
					break;
				default:
					console.log(get_time() + ' - opcode not recognized');
					socket.write(JSON.stringify({'opcode': 'ACK'}) + "\n");
			}
			
			
		}
		catch(e)
		{
			var err = {"opcode" : "ERR"};
			socket.write(JSON.stringify(err) + "\n");
			console.log(get_time() + " - " + e + ": " + data.toString());
		}
		
	});
	
	socket.addListener('end', function(){
		console.log(get_time() + ' - ' + client_type + ':' + client_id + ' disconnected (end)');
		remove_client(client_type, client_id);

	});
	
	socket.addListener('error', function(e){
		console.log(get_time() + ' - ' + client_type + ':' + client_id + ' disconnected (error)');
		remove_client(client_type, client_id);
	});
	
});

/**
 * Web Server
 */




server.listen(2233);
console.log(get_time() + ' - Server started');



Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

function update_stall(suds_id, stall_id, status)
{
	console.log('updating stall: ' + suds_id + ", " + stall_id + ", " + status);
	for(var i = 0; i < stalls[suds_id].length; i++)
	{
		if(stalls[suds_id][i]['id'] == stall_id)
		{
			stalls[suds_id][i]['status'] = status;
		}
	}
}

function remove_client(client_type, id)
{
	if(client_type == 'suds')
	{
		
		
		for(var i = 0; i < suds_clients.length; i++)
		{
			if(suds_clients[i]['id'] == id)
			{
				stalls[suds_clients[i]['suds_id']] = {};
				suds_clients.remove(i);
			}
		}
		
		var stall_dump = {'opcode': 'stall_dump', 'stalls': stalls};
		send_to_clients(JSON.stringify(stall_dump) + "\n");
	}
	
	if(client_type == 'client')
	{
		for(var i = 0; i < clients.length; i++)
		{
			if(clients[i]['id'] == id)
			{
				clients.remove(i);
			}
		}
	}
}

function send_to_clients(message)
{
	console.log(get_time() + ' - sending to web  clients: ');
	for(var i = 0; i < clients.length; i++)
	{
		//console.log("\t" + clients[i]['id']);
		clients[i]['socket'].write(message);
	}
}

function get_time()
{
	return new Date().toUTCString();
}