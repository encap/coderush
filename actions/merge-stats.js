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

      core.info(`Server total: ${source.stats.total || 'ERROR'}`);

      core.startGroup('Merge');
      if (source.stats.total > target.stats.total) {
        const database = {
          languages: target.languages.map((language, langIndex) => {
            const srcLang = source.languages[langIndex];
            if (srcLang && srcLang.total && srcLang.total > language.total) {
              return {
                ...language,
                total: srcLang.total,
                files: language.files.map((file, fileIndex) => {
                  const srcFile = srcLang.files[fileIndex];
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
          stats: source.stats, // must be at the bottom
        };
        core.endGroup();

        core.startGroup('Check total');
        const count = (arr) => arr.reduce((acc, item) => {
          if (item.total) {
            // eslint-disable-next-line no-param-reassign
            acc += item.total;
          }
          return acc;
        }, 0);

        database.languages.forEach((language) => {
          const counted = count(language.files);
          console.log('\x1b[0m', `${language.name}: ${counted}`);
          if (counted !== (language.total || 0)) {
            const msg = `DOESN'T MATCH: ${counted} | ${language.total} - in ${language.name}`;
            console.log('\x1b[31m', msg);
            core.setFailed(msg);
          }
        });

        const totalCounted = count(database.languages);

        if (totalCounted !== database.stats.total) {
          console.log('\x1b[31m', 'TOTAL DOESN\'T MATCH');
          console.log(`TOTAL IN DB: ${database.stats.total}`);
          core.setFailed('TOTAL DOESN\'T MATCH');
        } else {
          console.log('\x1b[32m', `TOTAL: ${totalCounted}`);
          core.endGroup();

          core.startGroup('Write to database.json');
          fs.writeFileSync('server/database2.json', JSON.stringify(database, null, 2));
          core.endGroup();
        }
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
