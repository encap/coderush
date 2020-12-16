const faunadb = require('faunadb');
require('dotenv').config({ path: `${__dirname}/env.local` });

const db = require('./server/database.json');

const q = faunadb.query;

const client = new faunadb.Client({ secret: process.env.FAUNA_KEY });

// Object.entries(db.stats).forEach(([key, value]) => {
//   client.query(
//     q.Create(
//       q.Collection('totalStats'),
//       {
//         data: { name: key, value },
//       },
//     ),
//   )
//     .then((ret) => console.log(ret))
//     .catch((err) => console.error(err));
// });

db.languages.map((lang, index) => ({ ...lang, index })).forEach((lang) => {
  client.query(
    q.Create(
      q.Collection('main'),
      {
        data: lang,
      },
    ),
  )
    .then((ret) => console.log(ret))
    .catch((err) => console.error(err));
});

