/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');

const { client_payload } = require(process.env.GITHUB_EVENT_PATH);


console.log(client_payload);

const list = client_payload;

fs.writeFileSync(
  'public/list.json',
  JSON.stringify(list),
);
