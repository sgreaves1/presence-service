require('dotenv').config();
const http = require('http');
const app = require('./app');
const WebSocket = require('ws');
const admin = require('firebase-admin');
const WebSocketMessageHandler = require('./helpers/WebSocketMessageHandler');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.APP_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

const PORT = process.env.PORT || 9671;

const server = http.createServer(app);

// Attach WebSocket server
const wss = new WebSocket.Server({ server });

const onlineUsers = new Map();
const messageHandler = new WebSocketMessageHandler(onlineUsers);

wss.on('connection', async (ws, req) => {
    const token = req.url.split('token=')[1] || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      ws.close(1008, 'No token provided');
      return;
    }

    try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    ws.user = decodedToken; // Attach user info to WebSocket
    console.log('Authenticated user:', decodedToken.uid);
    
    // Now proceed with existing logic
    onlineUsers.set(decodedToken.uid, ws);
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      msg.userId = decodedToken.uid; // Ensure userId is set
      messageHandler.handleMessage(ws, msg);
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    ws.close(1008, 'Invalid token');
  }
  
  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws.user && ws.user.uid) {
      onlineUsers.delete(ws.user.uid);
      console.log(`User ${ws.user.uid} removed from online users`);
    }
  });
  
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});