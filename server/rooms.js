const socketio = require('socket.io');

module.exports = function (http) {
  const io = socketio(http);

  const rooms = {};

  io.on('connection', (socket) => {
    const { roomName } = socket.handshake.query;

    if (rooms.hasOwnProperty(roomName)) {
      socket.emit('room_exist');
      socket.on('checkPlayerName', (playerName) => {
        if (Object.values(rooms[roomName].players).some((player) => player.name === playerName)) {
          socket.emit('player_name_taken');
        } else {
          socket.emit('player_name_avaible');
          socket.on('joinRoom', () => {
            console.log(`player "${playerName}" joined "${roomName}"`);
            socket.join(roomName);
            rooms[roomName].players[socket.id] = { connected: true };
            rooms[roomName].players[socket.id].name = playerName;
            socket.emit('room_state', {
              ...rooms[roomName],
              players: Object.values(rooms[roomName].players),
              roomName,
            });
            socket.to(roomName).emit('player_joined', playerName);
          });
        }
      });
    } else {
      socket.emit('room_dont_exist');
      socket.on('createRoom', (data) => {
        socket.join(data.roomName);
        rooms[data.roomName] = { players: {}, options: data.options, languageIndex: data.langaugeIndex };
        rooms[data.roomName].players[socket.id] = {
          name: data.ownerName,
          owner: true,
          connected: true,
        };
        socket.emit('room_created');
      });
    }

    socket.on('optionChange', (option) => {
      rooms[roomName].options[option.name] = option.data;
      socket.to(roomName).emit('option_change', option);
    });

    socket.on('optionsData', (options) => {
      rooms[roomName].options = options;
    });

    socket.on('languageChange', (languageIndex) => {
      rooms[roomName].languageIndex = languageIndex;
      socket.to(roomName).emit('language_change', languageIndex);
    });

    socket.on('playerStateChange', (currentState) => {
      rooms[roomName].players[socket.id].ready = currentState;
      io.in(roomName).emit('player_state_change', {
        playerName: rooms[roomName].players[socket.id].name,
        currentState,
      });
    });

    socket.on('fileIndex', (fileIndex) => {
      socket.to(roomName).emit('file_index', fileIndex);
    });

    socket.on('customCodeData', (data) => {
      rooms[roomName].customCode = data;
      socket.to(roomName).emit('custom_code_data', data);
    });

    socket.on('useCustomCode', (data) => {
      socket.to(roomName).emit('use_custom_code', data);
    });

    socket.on('start', (ownerStartTime) => {
      socket.to(roomName).emit('start', ownerStartTime);
    });

    socket.on('completed', (time) => {
      console.log(`player "${rooms[roomName].players[socket.id].name} completed; ${Date.now() - time} ms latency`);

      const data = {
        playerName: rooms[roomName].players[socket.id].name,
        time: Date.now(),
      };
      io.in(roomName).emit('player_completed', data);
    });

    socket.on('completedStats', (stats) => {
      const data = {
        playerName: rooms[roomName].players[socket.id].name,
        stats,
      };
      io.in(roomName).emit('player_stats', data);
    });

    socket.on('reset', () => {
      if (rooms[roomName].players[socket.id].owner) {
        console.warn(`room "${roomName}" reset`);
        io.in(roomName).emit('reset');
      }
    });

    socket.on('disconnecting', () => {
      try {
        const player = rooms[roomName].players[socket.id];
        console.log(`player "${player.name}" disconnected from "${roomName}"`);

        socket.to(roomName).emit('player_disconnected', {
          playerName: player.name,
          owner: player.owner,
        });
        if (player.owner) {
          delete rooms[roomName];
          console.warn(`room ${roomName} deleted`);
        } else {
          delete rooms[roomName].players[socket.id];
        }
      } catch (err) {
        console.error('IO DISCONNECT ERROR');
      }
    });
  });
};
