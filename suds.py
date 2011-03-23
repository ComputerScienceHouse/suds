#!/usr/bin/python
import serial
import time
import sys

# Configuration #
stallNames = ["South Stairwell - Far", "South Stairwell - Near", "South Vator - Far", "South Vator - Near"]

south_stalls = {0: (1, 'South Stairwell - Far'), 1: (2, 'South Stairwell - Near'), 2: (3, 'South Vator - Far'), 3: (4, 'South Vator - Near')}
north_stalls = {0: (5, 'North Vator - Far'), 1: (6, 'North Vator - Near'), 2: (7, 'North Stairwell - Far'), 3: (8, 'North Stairwell - Near')}

server = ""
username = ""
password = ""
database = ""

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
		stalls = south_stalls
	else:
		stalls = north_stalls
		
	if len(sys.argv) == 2:
		port = '/dev/ttyUSB0'
	else:
		port = sys.argv[2]
	
	# Open serial connection
	ser = serial.Serial(port, timeout=1)
	
	newStatuses = {}
	prevStatuses = {}	

	time.sleep(1)
	setNumStalls(len(stalls))
	
	while True:
		ser.write('p')
		newStatuses, prevStatuses = getChanged(ser.readline(), prevStatuses)
		for i in newStatuses.keys():
			print(stalls[i][1], newStatuses[i])
			# Prepare SQL query to INSERT a record into the database.
			
		time.sleep(1)
	
	ser.close()
