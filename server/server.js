const axios = require('axios');
const fallback = require('express-history-api-fallback');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const http = require('http').Server(app);
require('./rooms.js')(http);


const PATH = path.join(__dirname, '../dist');
console.warn(PATH);

const toggleMaintanceMode = (toggle) => {
  axios({
    url: 'https://api.heroku.com/apps/coderush',
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.heroku+json; version=3',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
    },
    withCredentials: true,
    data: {
      build_stack: 'heroku-18',
      maintenance: toggle,
      name: 'coderush',
    },
  }).then(() => {
    console.log('Toogle 200');
  }).catch(() => {
    console.warn('Toggle failed');
  });
};
if (process.env.NODE_ENV === 'production') {
  toggleMaintanceMode(false);
}

let list = {};
let stringifiedList = '';
let newStats = false;

const sendStats = () => {
  if (newStats && process.env.NODE_ENV === 'production') {
    newStats = false;

    axios({
      url: 'https://api.github.com/repos/encap/coderush/dispatches',
      method: 'post',
      headers: {
        Accept: 'application/vnd.github.everest-preview+json',
        Authorization: `token ${process.env.GH_PERSONAL_TOKEN}`,
      },
      withCredentials: true,
      data: {
        event_type: 'update-stats',
        client_payload: list,
      },
    })
      .then(() => {
        console.log(`Stats Sent. Total: ${list.stats.total || 'ERROR'}`);
      })
      .catch((response) => {
        console.error(response);
      });
  }
};
setInterval(sendStats, 1000 * 60 * 60 * 24);




fs.readFile(`${PATH}/static/list.json`, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  stringifiedList = data;
  list = JSON.parse(data);
  setInterval(() => {
    console.log('TIMER');
    stringifiedList = JSON.stringify(list);
    axios.get('https://coderush.herokuapp.com/api/ping')
      .then((res) => console.log(`ping ok, status: ${res.status}`))
      .catch((err1) => console.error(`Ping Error: ${err1}`));
  }, 1000 * 60 * 20);
});



app.use(morgan('dev'));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static(`${PATH}`));

app.use(cors());

app.get('/code/:lang/:file', cors(), (req, res) => {
  console.log('FILE');
  res.sendFile(`${PATH}/code/${req.params.lang}/${req.params.file}`);
});

// send cached list
app.get('/list.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(stringifiedList);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/upload', cors(), (req, res) => {
  // fs.writeFile(`${PATH}/code/${list.languages[req.body.languageIndex].name.replace('#', '_sharp')}/${req.body.name}.${req.body.ext}`, req.body.code, () => { console.log(`wrote ${req.body.name}.${req.body.ext}`); });

  // if (!list[req.body.languageIndex].verify) {
  //   list[req.body.languageIndex].verify = [];
  // }
  // list[req.body.languageIndex].verify.push({
  //   name: req.body.name,
  //   source: 'uploaded by contributor',
  //   tabSize: req.body.tabSize,
  //   numberOfLines: req.body.numberOfLines,
  // });
  res.send('OK');
});

app.post('/api/stats', cors(), (req, res) => {
  const stats = req.body;
  list.stats.total += 1;
  list.stats.correctClicks = list.stats.correctClicks + stats.correctClicks || list.stats.correctClicks;
  list.stats.backspaceClicks = list.stats.backspaceClicks + stats.backspaceClicks || list.stats.backspaceClicks;
  list.stats.deletingTime = list.stats.deletingTime + stats.deletingTime || list.stats.deletingTime;
  list.languages[stats.languageIndex].total = list.languages[stats.languageIndex].total + 1 || 1;
  list.languages[stats.languageIndex].files[stats.fileIndex].total = list.languages[stats.languageIndex].files[stats.fileIndex].total + 1 || 1;

  newStats = true;
  res.send('OK');
});

app.get('/api/ping', cors(), (req, res) => {
  res.send('OK');
});

app.use(fallback('index.html', { root: PATH }));



const PORT = process.env.PORT || 3000;

const server = http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

const shutdown = () => {
  console.warn(`SHUTDOWN PENDING ${process.env.NODE_ENV}`);
  server.close();
  if (process.env.NODE_ENV === 'production') {
    sendStats();
    toggleMaintanceMode(true);
    setTimeout(() => {
      console.warn('SHUTDOWN');
      process.exit(0);
    }, 2000);
  } else {
    process.exit(0);
  }
};

process
  .on('SIGTERM', shutdown)
  .on('SIGINT', shutdown);
