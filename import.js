const faunadb = require('faunadb');
const db = require('./server/database.json');

const q = faunadb.query;

const client = new faunadb.Client({ secret: 'fnAD9JL_aHACBxtFnhe8nEKiu6DM0H3l5A5J_2Z3' });


console.log(Object.entries(db.stats));
Object.entries(db.stats).forEach(([key, value]) => {
  client.query(
    q.Create(
      q.Collection('totalStats'),
      {
        data: { name: key, value },
      },
    ),
  )
    .then((ret) => console.log(ret))
    .catch((err) => console.error(err));
});

