*CSH Shower Usage Detection System (SUDS)*

server
---
suds_server.js is the main server that the actual suds machines talk to. It is also responsible for serving requests to clients.

suds
---
Small script to pull information from suds and send to the central server

web
---
A web interface that uses Socket.io to talk to a websocket server to pull in real-time updates from suds

web_server
---
A websocket server that pulls in info from the central server and sends it to connected clients
