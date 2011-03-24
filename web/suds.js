$(document).ready(function(){
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};	
	var username = null;

	var socket = new io.Socket(null, {port: 8888, rememberTransport: false});
	
	$(function(){
		socket.connect();
		$("#connecting_modal").modal({
		    opacity:50,
		    overlayCss: {backgroundColor:"#7f7f7f"},
		    overlayClose:true,
			position: ['20%', '40%']
		});
	});
	
	socket.on('message', function(obj){
		if(obj.opcode == 'suds_status')
		{
			// create zone status table
			/*var status_div = $('#suds-zones');
			status_div.html('');
			var table = $('<table></table>');
			for(var i in obj['status'])
			{
				table.append('<tr><td id="'+i+'">' + i + '</td><td>' + obj['status'][i].toString() + '</td></tr>');
			}	
			
			status_div.append(table);
			*/
			
			var stalls = $('#stalls');
			stalls.html('');
			// create stall status table
			for(var i in obj['stalls'])
			{
				var stalls_div = $('<div class="stall-group"></div>');
				stalls_div.append('<h2>' + i + '</h2>');
				if(Object.size(obj['stalls'][i]))
				{
					for(var j in obj['stalls'][i])
					{
						var stall = $('<div class="stall">' + obj['stalls'][i][j]['name'] + '</div>');
						if(obj['stalls'][i][j]['status'] == 0)
						{
							stall.addClass('vacant');
						}
						else
						{
							stall.addClass('occupied');
						}
						stalls_div.append(stall);
					}
				}
				else
				{
					stalls_div.append('<i>Empty</i>');
				}
				stalls.append(stalls_div);
				
			}
		}
		else if(obj.opcode == 'update_stall')
		{
			//console.log(obj);
		}
	});

	socket.on('connect', function(){ 
		$.modal.close();
		
	});

	socket.on('disconnect', function(){ 
		console.log("disconnected");
		
		
	});

	socket.on('reconnect', function(){ 
		console.log("reconnected");
	});

	socket.on('reconnecting', function( nextRetry ){ 
		console.log("reconnecting");
	});

	socket.on('reconnect_failed', function(){ 
		console.log("failed to reconnect");
	});
});