const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
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
    console.log('Toogle success');
  }).catch((err) => {
    console.warn('Toggle failed');
    console.error(err);
  });
};
if (process.env.NODE_ENV === 'production') {
  toggleMaintanceMode(false);
}

let cachedIndexHtml = '';
const getIndexHtml = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('getIndexHtml');
    axios.get('https://coderushcdn.ddns.net/index.html')
      .then((res) => {
        if (res.status === 200) {
          cachedIndexHtml = res.data;
        } else {
          throw new Error('index.html response not 200');
        }
      })
      .catch((err) => {
        console.warn('Error index.html');
        console.error(err);
      });
  }
};

getIndexHtml();

const database = {};
const cachedStringifiedDatabase = '';

const getDatabase = () => {
  console.log('getDatabase');
  if (process.env.NODE_ENV === 'production') {
    axios.get('https://coderushcdn.ddns.net/database.json')
      .then((res) => {
        if (res.status === 200) {
          database = res.data;
          cachedStringifiedDatabase = JSON.stringify(database);
        }
      })
      .catch((err) => {
        console.warn('Error database.json not found');
        console.error(err);
      });

    setInterval(() => {
      console.log('TIMER');
      cachedStringifiedDatabase = JSON.stringify(database);
      axios.get('https://coderush.herokuapp.com/api/ping')
        .then((res) => console.log(`ping ok, status: ${res.status}`))
        .catch((err1) => console.error(`Ping Error: ${err1}`));
    }, 1000 * 60 * 20);
  }
};

getDatabase();

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
        client_payload: database,
      },
    })
      .then(() => {
        console.log(`Stats Sent. Total: ${database.stats.total || 'ERROR'}`);
      })
      .catch((response) => {
        console.warn('Stats update failed');
        console.error(response);
      });
  }
};
setInterval(sendStats, 1000 * 60 * 5);

app.enable('trust proxy'); // heroku

app.use((req, res, next) => {
  if (req.protocol === 'http' && process.env.NODE_ENV === 'production') {
    if (req.method === 'GET' || req.method === 'HEAD') {
      console.log('redirected to https');
      res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    } else {
      res.status(403).send('Only HTTPS is allowed when submitting data to this server.');
    }
  } else {
    next();
  }
});

// send cached index.html
app.use((req, res, next) => {
  const match = req.originalUrl.match(/\.\w+$/);
  const ext = match ? match[0][0] : '';
  if ((req.method === 'GET' || req.method === 'HEAD') && (ext === '' || ext === 'html')) {
    if (cachedIndexHtml) {
      console.log('cachedhtml');
      res.send(cachedIndexHtml);
    } else {
      console.log('file html');
      res.sendFile('index.html', { root: PATH });
    }
  } else {
    next();
  }
});

// send cached database
app.get('/database.json', (_req, res) => {
  if (cachedStringifiedDatabase.length > 2) { // {} empty object
    console.log('cachedDatabase');
    res.setHeader('Content-Type', 'application/json');
    res.send(cachedStringifiedDatabase);
  } else {
    console.log('file database');
    res.sendFile('database.json', { root: __dirname });
  }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/upload', (req, res) => {
  res.send('OK');
});

app.post('/api/stats', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    const stats = req.body;
    database.stats.total += 1;
    database.stats.correctClicks = database.stats.correctClicks + stats.correctClicks || database.stats.correctClicks;
    database.stats.backspaceClicks = database.stats.backspaceClicks + stats.backspaceClicks || database.stats.backspaceClicks;
    database.stats.deletingTime = database.stats.deletingTime + stats.deletingTime || database.stats.deletingTime;
    database.languages[stats.languageIndex].total = database.languages[stats.languageIndex].total + 1 || 1;
    database.languages[stats.languageIndex].files[stats.fileIndex].total = database.languages[stats.languageIndex].files[stats.fileIndex].total + 1 || 1;

    newStats = true;
  }


  res.send('OK');
});

app.get('/api/ping', (req, res) => {
  res.send('OK');
});

app.use((req, res, next) => {
  if (!(process.env.NODE_ENV === 'production') && (req.originalUrl.slice(-3) === '.js' || req.originalUrl.slice(-4) === '.css')) {
    res.header('content-encoding', 'gzip');
    res.header('content-type', req.originalUrl.includes('js') ? 'application/javascript' : 'text/css');
  }
  next();
});

app.use(express.static(PATH));


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
