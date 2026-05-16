const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const roomHandler = require('./handlers/roomHandler');

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: '*' }));

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.get('/health', (_req, res) => {
  res.json({ status: 'Collaboration Service running' });
});

io.on('connection', (socket) => {
  roomHandler(io, socket);
});

const PORT = process.env.PORT || 3003;
httpServer.listen(PORT, () => {
  console.log(`Collaboration Service listening on port ${PORT}`);
});
