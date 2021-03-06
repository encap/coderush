/* eslint-disable function-paren-newline */
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

require('dotenv').config({ path: `${__dirname}/./../.env.local` });

const app = express();
const http = require('http').Server(app);

const faunadb = require('faunadb');

require('./rooms.js')(http);

const PROD = process.env.PRODUCTION;
console.log(`Environment ${PROD ? 'PRODUCTION' : 'DEVELOPMENT'}`);

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
    .then(async () => {
      console.log('Auto promotion succeded');

      // cannot process.exit(0) becouse heroku will restart anyway
    })
    .catch(() => {
      console.error('Auto promotion failed');
      process.exit(1);
    });
} else {
  const q = faunadb.query;
  const client = new faunadb.Client({
    secret: PROD ? process.env.FAUNA_KEY : process.env.FAUNA_DEV_KEY,
  });

  let database = null;
  let stringifiedDB = '';

  const updateDatabaseCache = () => {
    stringifiedDB = JSON.stringify(database);
  };

  const fetchDatabase = async () => {
    try {
      const [languagesRet, statsRet] = await client.query([
        q.Map(
          q.Paginate(q.Match(q.Index('allLanguagesByIndex'))),
          q.Lambda(
            'ret',
            q.Select(['data'], q.Get(q.Select([1], q.Var('ret'))))
          )
        ),
        q.Map(
          q.Paginate(q.Documents(q.Collection('totalStats'))),
          q.Lambda('ref', q.Select(['data'], q.Get(q.Var('ref'))))
        ),
      ]);

      database = {
        languages: languagesRet.data,
        stats: Object.fromEntries(
          statsRet.data.map((entry) => [entry.name, entry.value])
        ),
      };
      updateDatabaseCache();
      console.log('Fetched database');
      return 0;
    } catch (err) {
      console.log('Database fetch failed');
      console.error('Error: %s', err);
      if (database === null) {
        process.exit(1);
      }
      return 1;
    }
  };

  fetchDatabase();

  if (PROD) {
    // redirect from coderush.herokuapp.com
    app.use((req, res, next) => {
      if (req.subdomains[0] === 'coderush') {
        res.redirect(301, `https://coderush.xyz${req.path}`);
      } else {
        next();
      }
    });

    // redirect to https
    app.enable('trust proxy'); // trust heroku and cloudflare
    app.use((req, res, next) => {
      if (req.protocol === 'http') {
        if (req.method === 'GET' || req.method === 'HEAD') {
          console.log('Redirecting client to https');
          res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
        } else {
          res
            .status(403)
            .send('Only HTTPS is allowed when submitting data to this server.');
        }
      } else {
        next();
      }
    });

    // heroku free tier goes to sleep after about 30 minutes of network inactivity
    app.get('/ping', (req, res) => {
      res.sendStatus(200);
    });

    setInterval(() => {
      axios
        .get('https://api.coderush.xyz/ping')
        .catch((err) => console.error(`Ping Error: ${err}`));
    }, 1000 * 60 * 10);

    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', 'https://coderush.xyz');

      next();
    });
  } else {
    // DEV

    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      next();
    });
  }

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
  });

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.post(process.env.DB_CACHE_UPDATE_URL, (req, res) => {
    if (fetchDatabase()) {
      console.log('Updated server database cache');
      res.sendStatus(201);
    } else {
      res.sendStatus(500);
    }
  });

  app.get('/data', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'max-age=1800');

    res.send(stringifiedDB);
  });

  app.post('/upload', (req, res) => {
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

  app.post('/stats', async (req, res) => {
    const { main, misc } = req.body;
    misc.total = 1;

    console.log(
      `langTotalBefore: ${database.languages[main.languageIndex].total}`
    );
    console.log(`bestBefore: ${database.stats.best}`);
    console.log(`avgBefore: ${database.stats.avg}`);
    try {
      const qResponse = await client.query([
        q.Select(
          ['data', 'total'],
          q.Let(
            {
              lang: q.Get(
                q.Match(q.Index('languageByIndex'), main.languageIndex)
              ),
              ref: q.Select(['ref'], q.Var('lang')),
            },
            q.Update(q.Var('ref'), {
              data: {
                total: q.Add(q.Select(['data', 'total'], q.Var('lang')), 1),
              },
            })
          )
        ),

        // recalculate max
        q.Select(
          ['data', 'value'],
          q.Let(
            {
              doc: q.Get(q.Match(q.Index('statByName'), 'best')),
              ref: q.Select(['ref'], q.Var('doc')),
            },
            q.Update(q.Var('ref'), {
              data: {
                value: q.Max([
                  q.Select(['data', 'value'], q.Var('doc')),
                  main.wpm,
                ]),
              },
            })
          )
        ),

        // save run
        q.Create(q.Collection('runs'), {
          data: main,
        }),

        // calculate avg
        q.Select(
          ['data', 'value'],
          q.Let(
            {
              doc: q.Get(q.Match(q.Index('statByName'), 'avg')),
              ref: q.Select(['ref'], q.Var('doc')),
            },
            q.Update(q.Var('ref'), {
              data: {
                value: q.Round(
                  q.Select(
                    ['data', 0],
                    q.Mean(
                      q.Map(
                        q.Paginate(q.Match(q.Index('runsWpmByDate')), {
                          size: 100,
                        }),
                        q.Lambda(['ts', 'wpm'], q.Var('wpm'))
                      )
                    )
                  ),
                  1 // precision
                ),
              },
            })
          )
        ),

        // totalStats
        q.Map(
          Object.entries(misc),
          q.Lambda(
            ['name', 'value'],
            q.Let(
              {
                ret: q.Let(
                  {
                    doc: q.Get(q.Match(q.Index('statByName'), q.Var('name'))),
                    ref: q.Select(['ref'], q.Var('doc')),
                  },
                  q.Update(q.Var('ref'), {
                    data: {
                      value: q.Add(
                        q.Select(['data', 'value'], q.Var('doc')),
                        q.Var('value')
                      ),
                    },
                  })
                ),
              },
              [
                q.Select(['data', 'name'], q.Var('ret')),
                q.Select(['data', 'value'], q.Var('ret')),
              ]
            )
          )
        ),
      ]);

      let statsResponse;
      [
        database.languages[main.languageIndex].total,
        database.stats.best,
        ,
        database.stats.avg,
        statsResponse,
      ] = qResponse;

      database.stats = {
        ...database.stats,
        ...Object.fromEntries(statsResponse),
      };

      console.log(
        `langTotalAfter: ${database.languages[main.languageIndex].total}`
      );
      console.log(`bestAfter: ${database.stats.best}`);
      console.log(`avgAfter: ${database.stats.avg}`);

      updateDatabaseCache();
      res.sendStatus(200);
    } catch (e) {
      console.log('Stats update failed');
      console.error(e);
      res.sendStatus(500);
    }
  });

  app.use(express.static(path.join(__dirname, '../dist')));
}

const PORT = process.env.PORT || 3000;

const server = http.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `Server listening on port ${PORT}!`);
});

const shutdown = () => {
  console.warn('Server is pending shutdown');
  server.close();
  if (PROD) {
    setTimeout(() => {
      console.warn('Ready for shutdown');
      process.exit(0);
    }, 2000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown).on('SIGINT', shutdown);
