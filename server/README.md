suds_server.js
===

SUDS Server that receives data from the SUDS hardware, persists stall statuses, logs statuses to database (coming soon), and forwards data to connected clients (e.g. the included web_socket_server).

Opcodes
---

- suds_connect
	Sent by the suds hardware to establish a connection. 
	- suds_id: the id of the suds machine (north or south)
	- data: the stalls in the specified location and their descriptions
	
			{ 
				"opcode" : "suds_connect",
			  	"suds_id" : "south"
				"data" : [ 
					[ 
						1,
			        	"South Stairwell - Far"
			      	],[ 
						2,
			        	"South Stairwell - Near"
			      	],[ 
						3,
			        	"South Vator - Far"
			     	],[ 
						4,
			        	"South Vator - Near"
			      	]
			    ]
			}
		
- update_stall
	Sent by the suds hardware when a stall changes status
	- suds_id: id of the suds machine (north or south)
	- status: 0 or 1 for open or closed
	- stall: id of the stall
	
			{
				"opcode": "update_stall"
				"status": 0, 
				"suds_id": "south", 
				"stall": 4, 
			}

- client_connect
	Sent by a connecting client that is _not_ the suds hardware (e.g. the web_socket_server)
	
	Generates a client id and saves the socket connection to a list of clients.