/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
const core = require('@actions/core');

const fs = require('fs');

try {
  fs.readFile(process.env.GITHUB_EVENT_PATH, (err, data) => {
    if (err) {
      throw new Error(`ReadFile failed ${err.message}`);
    }
    core.startGroup('Preparing list');
    const list = data.client_payload;
    console.log(JSON.stringify(list, null, 2));
    if (typeof list === 'object' && typeof list.stats === 'object' && list.stats.total > 0 && list.stats.correctClicks > 0 && list.languages.length >= 33 && list.languages.length < 40 && list.languages.every((language) => language.files.length > 0 && typeof language.files[0].name === 'string')) {
      core.info(`Current total: ${list.stats.total || 'ERROR'}`);

      const stringifiedList = JSON.stringify(list, null, 2);
      core.endGroup();
      core.startGroup('Writing list.json');
      fs.writeFileSync('public/list.json', stringifiedList);
      fs.writeFileSync('dist/list.json', stringifiedList);
      core.endGroup();
    } else {
      throw new Error('List corrupted!');
    }
  });
} catch (error) {
  core.setFailed(error.message);
}
