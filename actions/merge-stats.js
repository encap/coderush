// eslint-disable-next-line import/no-extraneous-dependencies
const core = require('@actions/core');

const https = require('https');
const fs = require('fs');


try {
  const merge = (source) => {
    core.startGroup('Read target database');
    const target = JSON.parse(fs.readFileSync('server/database.json', 'utf8'));
    core.endGroup();

    core.startGroup('Validate source');
    if (
      typeof source === 'object'
      && typeof source.stats === 'object'
      && source.stats.total > 0
      && source.stats.correctClicks > 0
      && source.languages.length >= 30
      && source.languages.length < 40
      && source.languages.every((language) => language.files.length > 0
      && typeof language.files[0].name === 'string')
    ) {
      core.endGroup();

      core.info(`Current total: ${source.stats.total || 'ERROR'}`);

      core.startGroup('Merge');
      if (source.stats.total > target.stats.total) {
        const database = {
          stats: source.stats,
          languages: target.languages.map((language, langIndex) => {
            const srcLang = source.languages[langIndex];
            if (srcLang && srcLang.total && srcLang.total > language.total) {
              return {
                ...language,
                total: srcLang.total,
                files: language.files.map((file, fileIndex) => {
                  const srcFile = source.files[fileIndex];
                  if (srcFile && srcFile.total && srcFile.total > file.total) {
                    return {
                      ...file,
                      total: srcFile.total,
                    };
                  }

                  return file;
                }),
              };
            }

            return language;
          }),
        };
        core.endGroup();

        core.startGroup('Write to database.json');
        fs.writeFileSync('server/database.json', JSON.stringify(database, null, 2));
        core.endGroup();
      }
    } else {
      throw new Error('Database corrupted!');
    }
  };

  if (process.env.SOURCE_URL) {
    core.startGroup('Fetch database from server');

    https.get(process.env.SOURCE_URL, (res) => {
      let data = '';

      res.on('data', (d) => {
        data += d;
      });
      res.on('end', () => {
        core.endGroup();

        merge(JSON.parse(data));
      });
    });
  } else {
    core.startGroup('Get database from payload');

    fs.readFile(process.env.GITHUB_EVENT_PATH, 'utf8', (err, data) => {
      if (err) {
        throw new Error(`ReadFile failed ${err.message}`);
      }
      const parsedData = JSON.parse(data);
      core.endGroup();

      merge(parsedData.client_payload);
    });
  }
} catch (error) {
  core.setFailed(error.message);
}
