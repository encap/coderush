const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: `${__dirname}/./../.env.local` });

const app = express();
const http = require('http').Server(app);

const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_KEY });

require('./rooms.js')(http);

const PROD = process.env.PRODUCTION;
console.log(`Environment ${PROD || 'DEV'}`);

if (process.env.AUTO_PROMOTE) {
  axios({
    url: 'https://api.heroku.com/pipeline-promotions',
    method: 'POST',
    headers: {
      Accept: 'application/vnd.heroku+json; version=3',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
    },
    withCredentials: true,
    data: {
      pipeline: {
        id: process.env.PIPELINE_ID,
      },
      source: {
        app: {
          id: process.env.SOURCE_APP_ID,
        },
      },
      targets: [
        {
          app: {
            id: process.env.TARGET_APP_ID,
          },
        },
      ],
    },
  })
    .then(() => {
      console.log('Auto promotion succeded');
    })
    .catch(() => {
      console.error('Auto promotion failed');
    });
}

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
      maintenance: action,
    },
  })
    .then(() => {
      console.log('Toogle maintance mode succeded');
    })
    .catch(() => {
      console.error('Toggle maintance mode failed');
    });
};

app.enable('trust proxy'); // trust heroku and cloudflare
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let cachedIndexHtml = fs.readFileSync('./dist/index.html', 'utf8');

let database = {};
let stringifiedDB = '';
client.query(
  [
    q.Map(
      q.Paginate(q.Documents(q.Collection('main'))),
      (languageRef) => q.Select(['data'], q.Get(languageRef)),
    ),
    q.Map(
      q.Paginate(q.Documents(q.Collection('totalStats'))),
      (statsRef) => q.Select(['data'], q.Get(statsRef)),
    ),
  ],
)
  .then((ret) => {
    console.log(ret);
    database = {
      languages: ret[0].data,
      stats: Object.fromEntries(ret[1].data.map((entry) => ([entry.name, entry.value]))),
    };
    stringifiedDB = JSON.stringify(database);
    console.log('Fetched database');
  })
  .catch((err) => console.error('Error: %s', err));


if (PROD) {
  toggleMaintanceMode(false);


  app.post(process.env.INDEX_HTML_UPDATE_URL, (req, res) => {
    if (res.body.length > 100) {
      cachedIndexHtml = res.body;
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  });

  // redirect to coderush.xyz
  app.use((req, res, next) => {
    if (req.subdomains[0] === 'coderush') {
      res.redirect(301, `https://coderush.xyz${req.path}`);
    } else {
      next();
    }
  });

  // redirect to https
  app.use((req, res, next) => {
    if (req.protocol === 'http') {
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

  // heroku free tier goes to sleep after 30 minutes of network inactivity
  app.get('/api/ping', (req, res) => {
    res.sendStatus(200);
  });

  setInterval(() => {
    axios.get('https://coderush.xyz/api/ping').catch((err) => console.error(`Ping Error: ${err}`));
  }, 1000 * 60 * 10);
} else {
  app.use((req, res, next) => {
    if (req.path.slice(-2) === 'js' || req.path.slice(-3) === 'css') {
      res.header('content-encoding', 'gzip');
    }
    next();
  });
}

// send cached index.html when possible
app.use((req, res, next) => {
  const match = req.originalUrl.match(/\.\w+$/);
  const ext = match ? match[0][0] : '';
  if ((req.method === 'GET' || req.method === 'HEAD') && (ext === '' || ext === 'html')) {
    res.send(cachedIndexHtml);
  } else {
    next();
  }
});

app.get('/database.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(stringifiedDB);
});


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
        res.sendStatus(200);
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
  const stats = req.body;
  database.stats.avgWPM = Math.round(
    (((database.stats.avgWPM * database.stats.total) + stats.wpm) / (database.stats.total + 1))
        * 1000,
  ) / 1000;

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

  res.sendStatus(200);
  stringifiedDB = JSON.stringify(database);
});


app.use(express.static(path.join(__dirname, '../dist')));


const PORT = process.env.PORT || 3000;

const server = http.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `Server listening on port ${PORT}!`);
});

const shutdown = () => {
  console.warn('Server is pending shutdown');
  server.close();
  if (PROD) {
    toggleMaintanceMode(true);
    setTimeout(() => {
      console.warn('Ready for shutdown');
      process.exit(0);
    }, 2000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown).on('SIGINT', shutdown);
