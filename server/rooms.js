const socketio = require('socket.io');

module.exports = (http) => {
  const io = socketio(http);

  const rooms = {};

  const playerDataTemplate = {
    connected: true,
    inLobby: true,
    ready: false,
  };

  io.on('connection', (socket) => {
    const { roomName } = socket.handshake.query;

    if (Object.prototype.hasOwnProperty.call(rooms, roomName)) {
      socket.emit('room_exist');

      socket.on('checkPlayerName', (playerName) => {
        if (Object.values(rooms[roomName].players).some((player) => player.name === playerName)) {
          socket.emit('player_name_taken');
        } else {
          socket.emit('player_name_avaible');

          socket.on('joinRoom', () => {
            console.log(`player "${playerName}" joined "${roomName}"`);
            socket.join(roomName);

            const playerData = {
              ...playerDataTemplate,
              name: playerName,
            };

            rooms[roomName].players[socket.id] = playerData;
            socket.emit('room_state', {
              ...rooms[roomName],
              players: Object.values(rooms[roomName].players),
              roomName,
            });

            socket.to(roomName).emit('player_joined', playerData);
          });
        }
      });
    } else {
      socket.emit('room_dont_exist');
      socket.on('createRoom', (data) => {
        socket.join(data.roomName);

        rooms[data.roomName] = {
          players: {},
          options: data.options,
          languageIndex: data.languageIndex,
        };

        const playerData = {
          ...playerDataTemplate,
          name: data.ownerName,
          owner: true,
          ready: true,
        };

        rooms[data.roomName].players[socket.id] = playerData;
        socket.emit('room_created');
        socket.emit('player_joined', playerData);
      });
    }

    socket.on('optionChange', (option) => {
      rooms[roomName].options[option.name] = option.value;
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

    socket.on('playerInLobby', (currentState) => {
      rooms[roomName].players[socket.id].inLobby = currentState;
      io.in(roomName).emit('player_in_lobby', {
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

    socket.on('start', () => {
      io.in(roomName).emit('reset');
      socket.to(roomName).emit('start');
    });

    socket.on('completed', () => {
      console.log(`player "${rooms[roomName].players[socket.id].name} completed`);

      rooms[roomName].playersCompleted = rooms[roomName].playersCompleted + 1 || 1;

      const data = {
        playerName: rooms[roomName].players[socket.id].name,
        time: Date.now(),
        place: rooms[roomName].playersCompleted,
      };

      io.in(roomName).emit('player_completed', data);
    });

    socket.on('completedStats', (stats) => {
      try {
        const data = {
          playerName: rooms[roomName].players[socket.id].name,
          stats,
        };

        io.in(roomName).emit('player_stats', data);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on('reset', () => {
      rooms[roomName].playersCompleted = 0;

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
