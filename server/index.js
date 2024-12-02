const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const WebSocket = require('ws')
const http = require('http')
const config = require('./config')
const handleMessage = require('./websocket/messageHandler')
const errorHandler = require('./middleware/error')
const logger = require('./middleware/logger')

const app = express()
const server = http.createServer(app)

// WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/ws'
});

// WebSocket connection management
const wsClients = new Map();

wss.on('connection', (ws, req) => {
  console.log('WebSocket connected');
  
  // Get token
  const token = new URL(req.url, 'http://localhost').searchParams.get('token');
  if (!token) {
    ws.close();
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    const userId = decoded.id;
    
    // Save connection
    wsClients.set(userId, ws);

    // Send online status
    ws.send(JSON.stringify({
      type: 'presence',
      status: 'online'
    }));

    // Handle message
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data);
        await handleMessage(message, decoded, wsClients);
      } catch (error) {
        console.error('Failed to handle message:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      wsClients.delete(userId);
      console.log('WebSocket disconnected');
    });

  } catch (error) {
    console.error('WebSocket auth failed:', error);
    ws.close();
  }
});

// Add route log middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// Middleware
app.use(cors(config.cors))
app.use(express.json())
app.use(logger)

// Test route
app.get('/test', (req, res) => {
  console.log('Test route hit')
  res.json({ message: 'Server is running' })
})

// Register routes
const routes = {
  auth: require('./routes/auth'),
  users: require('./routes/users'),
  chats: require('./routes/chats'),
  marketplace: require('./routes/marketplace'),
  posts: require('./routes/posts'),
  notifications: require('./routes/notifications'),
  // 'group-statistics': require('./routes/group-statistics'),
  activities: require('./routes/activities')
}

// Register routes and add error handling
Object.entries(routes).forEach(([name, router]) => {
  const path = `/${name}`
  console.log(`[Router] Registering ${path}`)
  app.use(path, router)
})

// 404 handling
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`)
  res.status(404).json({
    code: 404,
    message: 'Interface does not exist',
    path: req.url,
    method: req.method
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    code: 500,
    message: err.message || 'Server error'
  })
})

module.exports = app 