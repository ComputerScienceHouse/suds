/**
 * Created by JetBrains PhpStorm.
 * User: seanmcgary
 * Date: 8/29/11
 * Time: 7:19 PM
 * To change this template use File | Settings | File Templates.
 */

var net = require('net');
var sys = require('sys');
var colors = require('colors');
var express = require('express');
var io = require('socket.io');

var stalls = {'south':{}, 'north': {}};
var connected = {'south': false, 'north': false};

var clients = new Array();
var suds_clients = new Array();

sys.puts(get_time().green + ' - Server started');

var socket_handler = {
    suds_connect: function(socket, conn, recv){
        sys.puts(get_time().green + ' - ' + 'Suds client connected'.blue);

        suds_clients.push({'id' : conn.client_id, 'socket': socket, 'suds_id': recv.suds_id});

        var tmp_stalls = [];

        for(var i = 0; i < recv.data.length; i++)
        {
            tmp_stalls[i] = {'id': recv.data[i][0], 'name': recv.data[i][1], 'status': 0};

        }

        stalls[recv['suds_id']] = tmp_stalls;

        conn.client_type = 'suds';

        var stall_dump = {'opcode': 'stall_dump', 'stalls': stalls};

        socket.write(JSON.stringify({'opcode': 'ACK'}) + "\n");
    },
    client_connect: function(socket, conn, recv){
        console.log('client connect');
    },
    update_stall: function(socket, conn, recv){
        sys.puts(get_time().green + ' - ' + ('Updating stall ' + get_stall_by_id(recv.suds_id, recv.stall).name + ' to ' + recv.status).yellow);

        //update stall status
        update_stall_status(recv.suds_id, recv.stall, recv.status);

        // TODO - log updates to database

        // TODO - broadcast changes to all clients

        socket.write(JSON.stringify({'opcode': 'ACK'}) + "\n");
    },
    ACK: function(socket, conn, recv){
        console.log('ACK');
    },
    ERR: function(socket, conn, recv){
        console.log('ERR');
    }
};

function update_stall_status(side, id, status){
    for(var i = 0; i < stalls[side].length; i++){
        if(stalls[side][i].id == id){
            stalls[side][i].status = status;
        }
    }
}

function get_stall_by_id(side, id){
    var side = stalls[side];

    for(var i = 0; i < side.length; i++){
        if(side[i].id == id){
            return side[i];
        }
    }
}

// Setup TCP server
var server = net.createServer(function(socket){
    var conn = this;

    conn.client_id = new Date().getTime();
	conn.client_type = null;

    socket.on('connect', function(){
        sys.puts(get_time().green + ' - ' + (socket.remoteAddress + ' connected').magenta);
    });

    socket.on('data', function(data){
        var recv = data.toString();

        recv = recv.replace("\\n", "");

        try {
            recv = JSON.parse(recv);
            //console.log(recv);

            if(recv.opcode in socket_handler){
                socket_handler[recv['opcode']](socket, conn, recv);
            } else {
                sys.puts(get_time().red + ' - ' + 'opcode not recognized'.red);
            }

            //socket.write(JSON.stringify({'opcode': 'ACK'}) + "\n");

        } catch(err){
            sys.puts(get_time().red + ' - ' + err.red);
			socket.write(JSON.stringify({"opcode" : "ERR"}) + "\n");
        }
    });

    socket.on('end', function(){

    });

    socket.on('error', function(){

    });
});

server.listen(2233);

/*
// Setup websocket server
var app = express.createServer();
io = io.listen(app);
app.listen(8080);

io.sockets.on('connection', function(socket){
     
});
*/
/**
 * Helper functions
 */
function get_time(){
	return new Date().toUTCString();
}


