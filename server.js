const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

io.on('connection', (socket) => {
    console.log(`🟢 Utilisateur connecté: ${socket.id}`);

    socket.on('join-voice', (room) => {
        socket.join(room);
        console.log(`🔊 ${socket.id} a rejoint le salon vocal: ${room}`);

        if (!rooms[room]) rooms[room] = [];
        rooms[room].push(socket.id);

        // Envoyer la liste des participants
        socket.to(room).emit('user-joined', socket.id);
        socket.emit('room-users', rooms[room]);
    });

    socket.on('leave-voice', (room) => {
        socket.leave(room);
        console.log(`🔇 ${socket.id} a quitté le salon vocal: ${room}`);

        if (rooms[room]) {
            rooms[room] = rooms[room].filter(id => id !== socket.id);
            socket.to(room).emit('user-left', socket.id);
            if (rooms[room].length === 0) delete rooms[room];
        }
    });

    // Signalisation WebRTC
    socket.on('offer', (data) => {
        socket.to(data.room).emit('offer', {
            offer: data.offer,
            from: socket.id
        });
    });

    socket.on('answer', (data) => {
        socket.to(data.room).emit('answer', {
            answer: data.answer,
            from: socket.id
        });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.room).emit('ice-candidate', {
            candidate: data.candidate,
            from: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Utilisateur déconnecté: ${socket.id}`);
        // Nettoyer les rooms
        for (const [room, users] of Object.entries(rooms)) {
            if (users.includes(socket.id)) {
                rooms[room] = users.filter(id => id !== socket.id);
                socket.to(room).emit('user-left', socket.id);
                if (rooms[room].length === 0) delete rooms[room];
            }
        }
    });
});

server.listen(3000, () => {
    console.log('🚀 DarkChat Vocal serveur lancé sur http://localhost:3000');
});
