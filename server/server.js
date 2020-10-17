const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const http = require('http').Server(app);

require('./rooms.js')(http);


const PATH = path.join(__dirname, '../dist');
const PROD = process.env.NODE_ENV === 'production';

const toggleMaintanceMode = (action) => {
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
      maintenance: action,
      name: 'coderush',
    },
  }).then(() => {
    console.log('Toogle maintance mode succeded');
  }).catch(() => {
    console.error('Toggle maintance mode failed');
  });
};

if (PROD) {
  toggleMaintanceMode(false);
}

let cachedIndexHtml = '';

// this will provide 0 downtime and will prevent reseting created rooms

const getIndexHtml = () => {
  if (PROD) {
    console.log('index.html cache update');
    axios.get('https://coderushcdn.ddns.net/index.html')
      .then((res) => {
        if (res.status === 200) {
          cachedIndexHtml = res.data;
        } else {
          throw new Error(`Response status: "${res.status}"`);
        }
      })
      .catch((err) => {
        console.warn('Error: cannot get index.html from cdn');
        console.error(err);
      });
  }
};

setInterval(getIndexHtml, 1000 * 60 * 60 * 24);

let database = {};
let cachedStringifiedDatabase = '';


if (PROD) {
  console.log('fetching database from cdn');

  axios.get('https://coderushcdn.ddns.net/database.json')
    .then((res) => {
      if (res.status === 200) {
        database = res.data;
        cachedStringifiedDatabase = JSON.stringify(database);
      } else {
        throw new Error(`Response status: "${res.status}"`);
      }
    })
    .catch((err) => {
      console.warn('Error: cannot get database from cdn');
      console.error(err);
    });

  setInterval(() => {
    console.log('Database cache update');
    cachedStringifiedDatabase = JSON.stringify(database);
  }, 1000 * 60 * 60 * 6);
}


let newStats = false;

const sendStats = () => {
  if (newStats && PROD) {
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
        console.log(`Stats sent. Total: ${database.stats.total}`);
      })
      .catch((response) => {
        console.warn('Stats update failed');
        console.error(response);
      });
  }
};

setInterval(sendStats, 1000 * 60 * 60 * 12);

app.enable('trust proxy'); // trust heroku and cloudflare

// redirect to https
app.use((req, res, next) => {
  if (req.protocol === 'http' && PROD) {
    if (req.method === 'GET' || req.method === 'HEAD') {
      console.log('Redirecting client to https');
      res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    } else {
      res.status(403).send('Only HTTPS is allowed when submitting data to this server.');
    }
  } else {
    next();
  }
});

// send cached index.html when possible
app.use((req, res, next) => {
  const match = req.originalUrl.match(/\.\w+$/);
  const ext = match ? match[0][0] : '';
  if ((req.method === 'GET' || req.method === 'HEAD') && (ext === '' || ext === 'html')) {
    if (cachedIndexHtml) {
      console.log('sending cached index.html');
      res.send(cachedIndexHtml);
    } else {
      console.log('sending index.html from a file');
      res.sendFile('index.html', { root: PATH });
    }
  } else {
    next();
  }
});

// send cached stringified database.json when possible
app.get('/database.json', (_req, res) => {
  if (cachedStringifiedDatabase.length > 2) { // {} empty object
    console.log('sending cached database');
    res.setHeader('Content-Type', 'application/json');
    res.send(cachedStringifiedDatabase);
  } else {
    console.log('sending database from file');
    res.sendFile('database.json', { root: __dirname }); // database.json is in the same dir as server
  }
});

// heroku free tier goes to sleep after 30 minutes of network inactivity
app.get('/api/ping', (req, res) => {
  res.send('OK');
});

const keepAwake = () => {
  axios.get('https://coderush.herokuapp.com/api/ping')
    .catch((err) => console.error(`Ping Error: ${err}`));
};

if (PROD) {
  setInterval(keepAwake, 1000 * 60 * 20);
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/upload', (req, res) => {
  if (typeof req.body.code === 'string' && req.body.code.length > 20) {
    axios({
      url: 'https://api.github.com/repos/encap/coderush/dispatches',
      method: 'post',
      headers: {
        Accept: 'application/vnd.github.everest-preview+json',
        Authorization: `token ${process.env.GH_PERSONAL_TOKEN}`,
      },
      withCredentials: true,
      data: {
        event_type: 'code-submission',
        client_payload: req.body,
      },
    })
      .then(() => {
        console.log('Code submission succeded');
        res.send('OK');
      })
      .catch((error) => {
        console.warn('Code submission failed');
        console.error(error.response);
        res.status(error.response.status).send(res.data);
      });
  } else {
    res.status(400).send('Invalid input');
  }
});

app.post('/api/stats', (req, res) => {
  if (PROD) {
    const stats = req.body;
    database.stats.avgWPM = Math.round(((database.stats.avgWPM * database.stats.total) + stats.wpm) / (database.stats.total + 1) * 1000) / 1000;

    database.stats.total += 1;

    if (stats.wpm < 200 && stats.wpm > database.stats.best) {
      database.stats.best = stats.wpm;
    }

    database.stats.correctClicks = database.stats.correctClicks + stats.correctClicks || database.stats.correctClicks;
    database.stats.correctLines = database.stats.correctLines + stats.correctLines || database.stats.correctLines;
    database.stats.backspaceClicks = database.stats.backspaceClicks + stats.backspaceClicks || database.stats.backspaceClicks;
    database.stats.deletingTime = database.stats.deletingTime + stats.deletingTime || database.stats.deletingTime;
    database.languages[stats.languageIndex].total = database.languages[stats.languageIndex].total + 1 || 1;
    database.languages[stats.languageIndex].files[stats.fileIndex].total = database.languages[stats.languageIndex].files[stats.fileIndex].total + 1 || 1;

    newStats = true;
  }

  res.send('OK');
});

if (!PROD) {
  // local server
  app.use((req, res, next) => {
    if (req.path.slice(-2) === 'js' || req.path.slice(-3) === 'css') {
      res.header('content-encoding', 'gzip');
    }
    next();
  });
}

app.use(express.static(PATH));

const PORT = process.env.PORT || 3000;

const server = http.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `Server listening on port ${PORT}!`);
});

const shutdown = () => {
  console.warn('Server is pending shutdown');
  server.close();
  if (PROD) {
    sendStats();
    toggleMaintanceMode(true);
    setTimeout(() => {
      console.warn('Ready for shutdown');
      process.exit(0);
    }, 2000);
  } else {
    process.exit(0);
  }
};

process
  .on('SIGTERM', shutdown)
  .on('SIGINT', shutdown);
