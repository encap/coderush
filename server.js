const fallback = require('express-history-api-fallback');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PATH = path.join(__dirname, '/dist');
console.warn(PATH);

// fs.copySync('dist', 'public', { overwrite: true, filter: (filePath) => !filePath.includes('.json') && !filePath.includes('code') });

let list = {};
let stringifiedList = '';

fs.readFile(`${PATH}/list.json`, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  stringifiedList = data;
  list = JSON.parse(data);
});

setInterval(() => {
  try {
    if (list.length > 28 && list.length < 50 && list[0].files.length > 0) {
      fs.writeJson(`${PATH}/list.json`, list, { spaces: 2 });
    }

    stringifiedList = JSON.stringify(list);
  } catch (e) {
    console.error('list corrupted');
    console.dir(list);
  }
}, 1000 * 60);

app.use(morgan('dev'));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static(PATH));

app.use(cors());

app.get('/code/:lang/:file', cors(), (req, res) => {
  console.log('FILE');
  res.sendFile(`${PATH}/code/${req.params.lang}/${req.params.file}`);
});

// send cached list
app.get('/list', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(stringifiedList);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/upload', cors(), (req, res) => {
  fs.writeFile(`${PATH}/code/${list.languages[req.body.languageIndex].name.replace('#', '_sharp')}/${req.body.name}.${req.body.ext}`, req.body.code, () => { console.log(`wrote ${req.body.name}.${req.body.ext}`); });

  if (!list[req.body.languageIndex].verify) {
    list[req.body.languageIndex].verify = [];
  }
  list[req.body.languageIndex].verify.push({
    name: req.body.name,
    source: 'uploaded by contributor',
    tabSize: req.body.tabSize,
    numberOfLines: req.body.numberOfLines,
  });
  res.send('OK');
});

app.use(fallback('index.html', { root: PATH }));

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
          console.warn(`join ROOM ${roomName}, player: ${playerName}`);
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

  socket.on('languageChange', (languageIndex) => {
    rooms[roomName].languageIndex = languageIndex;
    socket.to(roomName).emit('language_change', languageIndex);
  });

  socket.on('playerStateChange', (currentState) => {
    rooms[roomName].players[socket.id].ready = currentState;
    if (rooms[roomName].players[socket.id].owner) {
      rooms[roomName].ready = currentState;
      io.in(roomName).emit('room_ready', currentState);
    }
    io.in(roomName).emit('player_state_change', {
      playerName: rooms[roomName].players[socket.id].name,
      currentState,
    });
  });

  socket.on('fileIndex', (fileIndex) => {
    socket.to(roomName).emit('file_index', fileIndex);
  });

  socket.on('customCodeData', (data) => {
    socket.to(roomName).emit('custom_code_data', data);
  });

  socket.on('useCustomCode', (data) => {
    console.log('sadddddddadgadf\nasdasdda');
    socket.to(roomName).emit('use_custom_code', data);
  });

  socket.on('start', (ownerStartTime) => {
    socket.to(roomName).emit('start', ownerStartTime);
  });

  socket.on('completed', (time) => {
    console.log(`completed ${Date.now() - time} ms latency`);

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
      console.dir(rooms[roomName]);
      rooms[roomName].ready = false;
      io.in(roomName).emit('reset');
    }
  });

  socket.on('disconnecting', () => {
    console.log('disconnect');
    try {
      const player = rooms[roomName].players[socket.id];

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
      console.error(err);
    }
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
