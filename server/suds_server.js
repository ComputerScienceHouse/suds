var net = require('net');

var stalls = {'south':{}, 'north': {}};
var connected = {'south': false, 'north': false};

var web_clients = new Array();

Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

function get_time()
{
	return new Date().toUTCString();
}

var server = net.createServer(function(socket){
	var suds_id = null;
	var is_client = false;
	var client_id;
	
	socket.addListener('connect', function(){
		//socket.write('connected');
		console.log(get_time() + " - " + socket.remoteAddress);
	});
	
	socket.addListener('data', function(data){
		var recv = JSON.parse(data.toString());
		if(recv.opcode == 'connect')
		{
			connected[recv['suds_id']] = true;
			suds_id = recv['suds_id'];
			
			for(var i = 0; i < recv.data.length; i++)
			{
				var d = recv['data'][i];
				var info = {'name': d[1], 'status': 0};
				stalls[recv['suds_id']][d[0]] = info;
			}
			
			var msg = JSON.stringify({'opcode': 'suds_status', 'status': connected});
			push_to_web_clients(msg);
			
			//console.log(stalls);
			socket.write("ACK\n");
		}
		else if(recv.opcode == 'update_stall')
		{
			var id = recv.suds_id;
			var stall = recv.stall
			//console.log(recv);
			stalls[id][stall]['status'] = recv['status'];
			
			var client_message = JSON.stringify({'opcode': 'suds_status', 'status': connected, 'stalls': stalls});
			push_to_web_clients(client_message);
			//console.log(stalls);
			socket.write("ACK\n");			
		}
		else if(recv.opcode == 'web_connect')
		{
			console.log(get_time() + ' - web client connected');
			is_client = true;
			client_id = new Date().getTime();
			//console.log(client_id);
			web_clients.push({'client_id': client_id, 'sock': socket});
			var msg = JSON.stringify({'opcode': 'suds_status', 'status': connected, 'stalls': stalls});
			console.log(get_time() + ' - ' + msg);
			socket.write(msg);
		}
		else
		{
			socket.write("BADACK\n");
			console.log('')
		}
		
	});
	
	socket.addListener('end', function(){
		//console.log(get_time() + 'connection terminated');
		// mark as disconnected
		if(is_client == true)
		{
			console.log(get_time() + ' client connected ended');
			for(var i = 0; i < web_clients.length; i++)
			{
				if(web_clients[i]['client_id'] == client_id)
				{
					web_clients.remove(i);
				}
			}
		}
		else
		{
			console.log(get_time() + ' - suds connection ended');
			connected[suds_id] = false;
			suds_id = null;
			var msg = JSON.stringify({'opcode': 'suds_status', 'status': connected, 'stalls': stalls});
			push_to_web_clients(msg);
		}
		
	});
	
	socket.addListener('error', function(e){
		// mark as disconnected
		if(is_client == true)
		{
			console.log(get_time() + ' - client connection lost (error)');
			for(var i = 0; i < web_clients.length; i++)
			{
				if(web_clients[i]['client_id'] == client_id)
				{
					web_clients.remove(i);
				}
			}
		}
		else
		{
			console.log(get_time() + ' - suds (' + suds_id + ') connection lost (error)');
			connected[suds_id] = false;
			stalls[suds_id] = {};
			suds_id = null;		
			var msg = JSON.stringify({'opcode': 'suds_status', 'status': connected, 'stalls': stalls});
			push_to_web_clients(msg);
		}
		
	});
	
	function push_to_web_clients(message)
	{
		console.log(get_time() + ' - sending to web  clients');
		for(var i = 0; i < web_clients.length; i++)
		{
			console.log("\t" + web_clients[i]['client_id']);
			web_clients[i]['sock'].write(message + "\n");
		}
	}
});

server.listen(2233);
console.log(get_time() + ' - Server started');