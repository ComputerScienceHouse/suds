#!/usr/bin/python
import serial
import time
import sys
import json
from time import strftime

from socket import *

# Configuration #
stallNames = ["South Stairwell - Far", "South Stairwell - Near", "South Vator - Far", "South Vator - Near"]

south_stalls = ((1, 'South Stairwell - Far'), (2, 'South Stairwell - Near'), (3, 'South Vator - Far'), (4, 'South Vator - Near'))
north_stalls = ((5, 'North Vator - Far'), (6, 'North Vator - Near'), (7, 'North Stairwell - Far'), (8, 'North Stairwell - Near'))

# Returns a map (from the stall number to it's status) of the stalls that have changed status
def getChanged(line, prevStatuses):
	changed = {}
	statuses = line.rstrip().split(',')
	for i in range(len(statuses)):
		if (statuses[i] != "") and (len(prevStatuses) < len(statuses) or statuses[i] != prevStatuses[i]):
			changed[i] = int(statuses[i])
	prevStatuses = statuses
	return (changed, prevStatuses)
	
# Tells the arduino to set the number of stalls to read
def setNumStalls(num):
	time.sleep(1);
	ser.write('s%d' % num)

if __name__ == '__main__':
	# python suds.py <north | south> [USB device]
	if len(sys.argv) < 2:
		print 'useage: python suds.py <north | south> [USB device]'
		exit()
	
	stalls = {}	
	
	side = sys.argv[1]
	if side == 'north':
		stalls = north_stalls
	else:
		stalls = south_stalls
		
	if len(sys.argv) == 2:
		port = '/dev/ttyUSB0'
	else:
		port = sys.argv[2]
	
	#connect to the server
	HOST = '129.21.49.139'
	PORT = 2233
	addr = (HOST, PORT)
	sock = socket(AF_INET, SOCK_STREAM)
	buff = 1024
	sock.connect(addr)
	connect_message = {'opcode': 'connect', 'suds_id': side, 'data': stalls}
	sock.send(json.dumps(connect_message, False, True))
	
	# Open serial connection
	ser = serial.Serial(port, timeout = 1)
	
	newStatuses = {}
	prevStatuses = {}	

	time.sleep(1)
	setNumStalls(len(stalls))
	
	while True:
		ser.write('p')
		newStatuses, prevStatuses = getChanged(ser.readline(), prevStatuses)
		for i in newStatuses.keys():
			update_stall = {'opcode': 'update_stall', 'suds_id': side, 'stall': stalls[i][0], 'status': newStatuses[i]}
			print strftime("%Y-%m-%d %H:%M:%S") + " - " + str(update_stall)
			sock.send(json.dumps(update_stall, False, True))
			sock.recv(buff);
		time.sleep(1)
	
	ser.close()
