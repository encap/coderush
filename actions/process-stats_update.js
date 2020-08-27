/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
import fs from 'fs';

console.log(process.env.GITHUB_EVENT_PATH);

const { client_payload } = require(process.env.GITHUB_EVENT_PATH);

console.log(client_payload);

const list = client_payload.list;

fs.writeFileSync(
  'public/list.json',
  JSON.stringify(list),
);
