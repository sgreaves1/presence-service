require('dotenv').config();
const http = require('http');
const app = require('./app');
const WebSocket = require('ws');

const PORT = process.env.PORT || 9671;

const server = http.createServer(app);

// Attach WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    console.log('Received:', msg);

    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});