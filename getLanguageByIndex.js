/* eslint-disable function-paren-newline */
const faunadb = require('faunadb');
require('dotenv').config({ path: `${__dirname}/.env.local` });

const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_KEY });

const languageIndex = 4;

client.query(
  q.Select('data', q.Get(q.Match(q.Index('languageByIndex'), languageIndex))),
)
  .then((ret) => console.log(JSON.stringify(ret, null, 2)))
  .catch((err) => console.log(JSON.stringify(err, null, 2)));

