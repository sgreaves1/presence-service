class WebSocketMessageHandler {
  constructor(onlineUsers) {
    this.onlineUsers = onlineUsers;
  }

  handleMessage(ws, msg) {
    console.log('Received:', msg);

    switch (msg.type) {
      case 'online':
        // add to current users
        this.onlineUsers.set(msg.userId, ws);
        break;
      case 'offline':
        // remove from current users
        this.onlineUsers.delete(msg.userId);
        break;
      case 'watching_live':
        this.handleWatchingLive(ws, msg);
        break;
      case 'watching_video':
        this.handleWatchingVideo(ws, msg);
        break;
      default:
        console.log('Unknown message type:', msg.type);
    }
  }

  handleWatchingLive(ws, msg) {
    // Handle live watching logic
    console.log(`User ${msg.userId} is watching live:`, msg.data);
    // Broadcast to other users that someone is watching live
    this.broadcastToOthers(ws, {
      type: 'user_watching_live',
      userId: msg.userId,
      data: msg.data
    });
  }

  handleWatchingVideo(ws, msg) {
    // Handle video watching logic
    console.log(`User ${msg.userId} is watching video:`, msg.data);
    
    // Store the video watching state
    const userState = {
      userId: msg.userId,
      videoId: msg.data.videoId,
      timestamp: msg.data.timestamp || Date.now(),
      isPaused: msg.data.isPaused || false
    };
    
    // Broadcast to other users that someone is watching a video
    this.broadcastToOthers(ws, {
      type: 'user_watching_video',
      ...userState
    });
  }

  broadcastToOthers(senderWs, message) {
    this.onlineUsers.forEach((ws, userId) => {
      if (ws !== senderWs && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

module.exports = WebSocketMessageHandler;