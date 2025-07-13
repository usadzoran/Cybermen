const express = require('express'),
      app = express(),
      http = require('http').createServer(app),
      io = require('socket.io')(http);
const badWords = ["badword1","badword2","fuck","shit"];
app.use(express.static('public'));

io.on('connection', socket => {
  let room = '', user = {};
  socket.on('join', data => {
    user = data;
    room = data.gender === 'men' ? 'men' : 'women';
    socket.join(room);
    updateUsers();
  });

  socket.on('message', text => {
    let clean = badWords.some(w => text.toLowerCase().includes(w));
    if (clean) {
      socket.emit('badword');
    } else {
      io.to(room).emit('message', { ...user, text });
    }
  });

  socket.on('disconnect', updateUsers);

  function updateUsers() {
    const clients = Array.from(io.sockets.adapter.rooms.get(room) || [])
                        .map(id => io.sockets.sockets.get(id).user);
    io.to(room).emit('userList', clients);
  }

  socket.on('user', () => { socket.emit('userList', []); });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
