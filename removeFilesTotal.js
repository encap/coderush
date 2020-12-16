/* eslint-disable function-paren-newline */
const faunadb = require('faunadb');
require('dotenv').config({ path: `${__dirname}/env.local` });

const q = faunadb.query;

const client = new faunadb.Client({ secret: process.env.FAUNA_KEY });

client.query(
  q.Map(
    q.Paginate(q.Documents(q.Collection('main'))),
    q.Lambda('languageRef',
      q.Let(
        {
          ref: q.Var('languageRef'),
          lang: q.Get(q.Var('ref')),
          filesArr: q.Select(['data', 'files'], q.Var('lang')),
        },
        q.Update(q.Var('ref'), {
          data: {
            files: q.Map(q.Var('filesArr'),
              q.Lambda('file',
                q.Merge(q.Var('file'), { total: null }))),
          },
        }),
      ),
    ),
  ),
)
  .then((ret) => console.log(JSON.stringify(ret, null, 2)))
  .catch((err) => console.log(JSON.stringify(err, null, 2)));

