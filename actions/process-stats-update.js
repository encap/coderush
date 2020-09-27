/* eslint-disable camelcase */

const core = require('@actions/core');

const fs = require('fs');

try {
  fs.readFile(process.env.GITHUB_EVENT_PATH, 'utf8', (err, data) => {
    if (err) {
      throw new Error(`ReadFile failed ${err.message}`);
    }
    core.startGroup('Preparing database');
    const parsedData = JSON.parse(data);
    const database = parsedData.client_payload;
    if (typeof database === 'object' && typeof database.stats === 'object' && database.stats.total > 0 && database.stats.correctClicks > 0 && database.languages.length >= 33 && database.languages.length < 40 && database.languages.every((language) => language.files.length > 0 && typeof language.files[0].name === 'string')) {
      core.info(`Current total: ${database.stats.total || 'ERROR'}`);

      const stringifiedDatabase = JSON.stringify(database, null, 2);
      core.endGroup();
      core.startGroup('Writing database.json');
      fs.writeFileSync('server/database.json', stringifiedDatabase);
      core.endGroup();
    } else {
      throw new Error('Database corrupted!');
    }
  });
} catch (error) {
  core.setFailed(error.message);
}
