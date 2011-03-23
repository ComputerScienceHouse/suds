#!/usr/bin/python
import serial
import time
import sys
import MySQLdb
from datetime import datetime

# Configuration #
stallNames = ["South Stairwell - Far", "South Stairwell - Near", "South Vator - Far", "South Vator - Near"]
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

# Gets the id from the database for each stall by it's name
def getStallIDs(stallNames):
    stalls = {}
    for i in range(len(stallNames)):
        statement = """SELECT * FROM stalls WHERE name=\"%s\"""" % stallNames[i]
        cursor.execute(statement)
        results = cursor.fetchall()
        if len(results) == 1:
            stalls[i] = int(results[0][0]), stallNames[i]
        else:
            print ("Database error: %s not found") % stallNames[i]
    return stalls

# Tells the arduino to set the number of stalls to read
def setNumStalls(num):
    time.sleep(1);
    ser.write('s%d' % num)

print str(datetime.strptime("21/11/06 16:30", "%d/%m/%y %H:%M")) + " - Starting suds"
# Open serial connection
port = sys.argv[1] if len(sys.argv) >= 2 else '/dev/ttyUSB1'
ser = serial.Serial(port, timeout=1)
print str(datetime.strptime("21/11/06 16:30", "%d/%m/%y %H:%M")) + " - Connected to arduino"

while True:
    try:
        # Open database connection
        db = MySQLdb.connect(server, username, password, database)
        print str(datetime.strptime("21/11/06 16:30", "%d/%m/%y %H:%M")) + " - Connected to database"
        cursor = db.cursor()
        newStatuses = {}
        prevStatuses = {}
        stalls = (getStallIDs(stallNames))
        #time.sleep(1)
        setNumStalls(len(stalls))
        while True:
            #print str(datetime.strptime("21/11/06 16:30", "%d/%m/%y %H:%M")) + " - SUDS Data:"
            ser.write('p')
            newStatuses, prevStatuses = getChanged(ser.readline(), prevStatuses)
            for i in newStatuses.keys():
                print(stalls[i][1], newStatuses[i])
                # Prepare SQL query to INSERT a record into the database.
                sql = """INSERT INTO log (stall_id, time, occupied) VALUES (%d, NOW(), %d);""" % (stalls[i][0], newStatuses[i])
                try:
                    # Execute the SQL command
                    cursor.execute(sql)
                    # Commit your changes in the database
                    db.commit()
                except:
                    # Rollback in case there is any error
                    print("database error occurred")
                    db.rollback()   
                #time.sleep(1)
            #print "------------------------"
    except:
        print str(datetime.strptime("21/11/06 16:30", "%d/%m/%y %H:%M")) + " - ERROR connecting to database"
        time.sleep(5)
# close connections
db.close()
ser.close()
