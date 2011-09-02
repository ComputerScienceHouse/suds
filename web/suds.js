
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
        var stalls = $('#stalls');
        stalls.html('');
        
        // create stall status table
        for(var i in data['stalls'])
        {
            var stalls_div = $('<div class="stall-group"></div>');
            stalls_div.append('<h2>' + i + '</h2>');
            if(Object.size(data['stalls'][i]))
            {
                for(var j in data['stalls'][i])
                {
                    var stall = data['stalls'][i][j];

                    var dom_stall = $('<div class="stall" suds_id="' + i + '" stall_id="' + stall['id'] + '">' + stall['name'] + '</div>');
                    if(stall['status'] == 0)
                    {
                        dom_stall.addClass('vacant');
                    }
                    else
                    {
                        dom_stall.addClass('occupied');
                    }

                    stalls_div.append(dom_stall);
                }
            }
            else
            {
                stalls_div.append('<i>Offline</i>');
            }
            
            stalls.append(stalls_div);

        }
    });

    socket.on('update_stall', function(data){
        console.log(data);
        var stall = $('[stall_id="' + data.id + '"]');
        stall.removeClass('vacant');
        stall.removeClass('occupied');
        if(data.status == 1)
        {
            stall.addClass('occupied');
        }
        else
        {
            stall.addClass('vacant');
        }
    });

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
