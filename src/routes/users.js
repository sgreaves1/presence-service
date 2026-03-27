const express = require('express');
const router = express.Router();

let onlineUsers; // Will be injected from server

// Inject onlineUsers from server
const setOnlineUsers = (usersMap) => {
  onlineUsers = usersMap;
};

// GET /api/users/online - Get all online users
router.get('/online', (req, res) => {
  try {
    const onlineUserIds = Array.from(onlineUsers.keys());
    const onlineUserInfo = onlineUserIds.map(userId => ({
      userId: userId,
      connectedAt: onlineUsers.get(userId).connectedAt || Date.now()
    }));
    
    res.json({
      count: onlineUserIds.length,
      users: onlineUserInfo
    });
  } catch (error) {
    console.error('Error getting online users:', error);
    res.status(500).json({ error: 'Failed to get online users' });
  }
});

module.exports = { router, setOnlineUsers };