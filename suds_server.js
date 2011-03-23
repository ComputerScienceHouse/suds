var net = require('net');

var stalls = {'south':{}, 'north': {}};
var connected = {'south': false, 'north': false};

var server = net.createServer(function(socket){
	var suds_id = null;
	
	socket.addListener('connect', function(){
		socket.write('connected');
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
			console.log(recv['suds_id'] + ' connected');
			//console.log(stalls);
			socket.write("ACK\n");
		}
		else if(recv.opcode == 'update_stall')
		{
			var id = recv.suds_id;
			var stall = recv.stall
			//console.log(recv);
			stalls[id][stall]['status'] = recv['status'];
			console.log(stalls);
			socket.write("ACK\n");			
		}
		else
		{
			socket.write("BADACK\n");
			console.log('')
		}
		
	});
	
	socket.addListener('end', function(){
		console.log('connection terminated');
		// mark as disconnected
		connected[suds_id] = false;
		suds_id = null;
	});
	
	socket.addListener('error', function(e){
		// mark as disconnected
		connected[suds_id] = false;
		stalls[suds_id] = {};
		console.log(suds_id + " disconnected");
		suds_id = null;		
	});
});

server.listen(2233);