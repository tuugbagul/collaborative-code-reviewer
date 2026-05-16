const rooms = {};

module.exports = function roomHandler(io, socket) {
  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    if (!rooms[roomId]) {
      rooms[roomId] = { users: [], currentCode: '' };
    }

    if (!rooms[roomId].users.includes(username)) {
      rooms[roomId].users.push(username);
    }

    socket.to(roomId).emit('user-joined', { username });

    socket.emit('room-state', {
      currentCode: rooms[roomId].currentCode,
      users: rooms[roomId].users,
    });
  });

  socket.on('code-change', ({ roomId, newCode }) => {
    if (rooms[roomId]) {
      rooms[roomId].currentCode = newCode;
    }
    socket.to(roomId).emit('code-change', newCode);
  });

  socket.on('send-comment', ({ roomId, username, comment }) => {
    io.to(roomId).emit('new-comment', { username, comment });
  });

  socket.on('disconnect', () => {
    const { roomId, username } = socket.data;
    if (roomId && rooms[roomId]) {
      rooms[roomId].users = rooms[roomId].users.filter((u) => u !== username);
      socket.to(roomId).emit('user-left', { username });
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
      }
    }
  });
};
