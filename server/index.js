const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new socketio.Server(server, {
  cors: { origin: 'http://localhost:5173' }
})

io.on('connection', (socket) => {
  console.log('Connecté :', socket.id)

  socket.on('join-channel', (channel) => {
    socket.rooms.forEach(room => {
      if (room !== socket.id) socket.leave(room)
    })
    socket.join(channel)
  })

  socket.on('message', ({ channel, username, text }) => {
    io.to(channel).emit('message', { channel, username, text })
  })

  socket.on('disconnect', () => {
    console.log('Déconnecté :', socket.id)
  })
})

server.listen(3001, () => console.log('Serveur sur http://localhost:3001'))