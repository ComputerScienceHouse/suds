
$(document).ready(function(){
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};	
	var username = null;

	var socket = io.connect('http://soap-south.csh.rit.edu:8080');

    $("#connecting_modal").modal({
        opacity:50,
        overlayCss: {backgroundColor:"#7f7f7f"},
        overlayClose:true,
        position: ['20%', '40%']
    });

    socket.on('stall_dump', function(data){
        console.log(data);
    });

    /*
	socket.on('message', function(obj){
		console.log(obj);
        console.log(JSON.stringify(obj));
		switch(obj.opcode)
		{
			case "data_init":
			case "stall_dump":
				var stalls = $('#stalls');
				stalls.html('');
				// create stall status table
				for(var i in obj['stalls'])
				{
					var stalls_div = $('<div class="stall-group"></div>');
					stalls_div.append('<h2>' + i + '</h2>');
					if(Object.size(obj['stalls'][i]))
					{
						//console.log(i);
						for(var j in obj['stalls'][i])
						{
							//console.log(j);
							var stall = $('<div class="stall" id="' + i + '-' + obj['stalls'][i][j]['id'] + '">' + obj['stalls'][i][j]['name'] + '</div>');
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
				break;
			case "update_stall":
				//console.log(obj);
				var stall = $('#' + obj.suds_id + '-' + obj.id);
				stall.removeClass('vacant');
				stall.removeClass('occupied');
				if(obj.status == 1)
				{
					stall.addClass('occupied');
				}
				else
				{
					stall.addClass('vacant');
				}
				break;
			default:
				break;
		}
	});*/

	socket.on('connect', function(){ 
		console.log('connected');
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
