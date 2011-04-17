SUDS Web Socket Client
===

Opcodes
---
- stall_dump
	- stalls: object containing the north and south stalls
	- id: stall id
	- name: name/description of the stall
	- status: 0 or 1 for open or closed
	
			{
				"opcode" : "stall_dump",
				"stalls" : { 
					"north" : [ 
						{ 
							"id" : 5,
			            	"name" : "North Vator - Far",
			            	"status" : 0
			          	},{ 
							"id" : 6,
			            	"name" : "North Vator - Near",
			            	"status" : 0
			          	},{ 
							"id" : 7,
			            	"name" : "North Stairwell - Far",
			            	"status" : 1
			          	},{ 
							"id" : 8,
			            	"name" : "North Stairwell - Near",
			            	"status" : 0
			          	}
			        ],
			      	"south" : [ 
						{ 
							"id" : 1,
			            	"name" : "South Stairwell - Far",
			            	"status" : 0
			          	},{ 
							"id" : 2,
			            	"name" : "South Stairwell - Near",
			            	"status" : 0
			          	},{ 
							"id" : 3,
			            	"name" : "South Vator - Far",
			            	"status" : 0
			          	},{ 
							"id" : 4,
			            	"name" : "South Vator - Near",
			            	"status" : 0
			          	}
			        ]
			    }
			}

- update_stall 
	- suds_id: will be either "north" or "south"
	- id: id of the stall
	- status: 0 or 1 for open or closed
		
			{
				"opcode":"update_stall",
				"suds_id":"south",
				"id":1,
				"status":1
			}